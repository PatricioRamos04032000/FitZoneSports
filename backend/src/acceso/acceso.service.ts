import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { MembresiasService } from '../usuarios/membresias/membresias.service';
import { RepositoryError } from '../supabase/repository.error';
import type { RolUsuario } from '../common/rol-usuario';
import { AccesoRepository } from './acceso.repository';
import {
  CheckInResponseDto,
  PresenciasResponseDto,
  SyncCheckInItemDto,
  SyncCheckInResultDto,
  SyncCheckInsResponseDto,
  TotpCodigoResponseDto,
  TotpMeResponseDto,
} from './acceso.dto';
import { CheckIn } from './acceso.model';
import { TotpService, TOTP_PERIOD_SECONDS } from './totp.service';

const SYNC_BATCH_MAX = 50;

@Injectable()
export class AccesoService {
  constructor(
    private readonly repository: AccesoRepository,
    private readonly totp: TotpService,
    @Inject(forwardRef(() => MembresiasService))
    private readonly membresias: MembresiasService,
  ) {}

  async totpMe(perfilId: string): Promise<TotpMeResponseDto> {
    const secret = await this.secretDePerfil(perfilId);
    return {
      perfilId,
      periodSeconds: TOTP_PERIOD_SECONDS,
      secret,
    };
  }

  async totpCodigo(perfilId: string): Promise<TotpCodigoResponseDto> {
    const secret = await this.secretDePerfil(perfilId);
    const code = await this.totp.generarCodigo(secret);
    return {
      code,
      periodSeconds: TOTP_PERIOD_SECONDS,
      secondsRemaining: this.totp.secondsRemaining(),
    };
  }

  async emitirTotp(perfilId: string): Promise<{ perfilId: string; emitido: boolean }> {
    if (!this.totp.puedeEmitirCifrado()) {
      throw new ServiceUnavailableException(
        'Configurá TOTP_SEED_ENCRYPTION_KEY para emitir seeds cifrados',
      );
    }
    const secret = this.totp.crearSecret();
    const seedCifrado = this.totp.encriptarSeed(secret);
    await this.repository.upsertTotpSeed({ perfilId, seedCifrado });
    return { perfilId, emitido: true };
  }

  /**
   * Al activar membresía: crea seed cifrado solo si el perfil aún no tiene uno activo.
   * No rota seeds existentes. Sin TOTP_SEED_ENCRYPTION_KEY no hace nada (log).
   */
  async ensureTotpSeed(perfilId: string): Promise<{ perfilId: string; emitido: boolean }> {
    const existente = await this.repository.findTotpSeedActivo(perfilId);
    if (existente) {
      return { perfilId, emitido: false };
    }
    if (!this.totp.puedeEmitirCifrado()) {
      // Evita romper alta de membresía en entornos sin key (p. ej. CI).
      return { perfilId, emitido: false };
    }
    return this.emitirTotp(perfilId);
  }

  async checkIn(
    actor: { id: string; rol: RolUsuario },
    body: {
      perfilId: string;
      code: string;
      sedeId: string;
      clientEventId?: string;
    },
  ): Promise<CheckInResponseDto> {
    this.assertIds(body.perfilId, body.sedeId);
    await this.assertPuedeOperarSede(actor, body.sedeId);
    await this.assertMembresiaActiva(body.perfilId);

    const secret = await this.secretDePerfil(body.perfilId);
    const ok = await this.totp.verificar(secret, body.code);
    if (!ok) {
      throw new UnauthorizedException({
        code: 'TOTP_INVALIDO',
        message: 'Código TOTP inválido o fuera de ventana',
      });
    }

    try {
      const fila = await this.repository.registrarCheckIn({
        perfilId: body.perfilId,
        sedeId: body.sedeId,
        origen: 'online',
        clientEventId: body.clientEventId ?? null,
      });
      return this.toCheckInDto(fila);
    } catch (e) {
      this.rethrowRpc(e);
    }
  }

  /**
   * Flush de cola offline: HTTP 200 siempre; ok/error tipado por ítem.
   * Si clientEventId ya existe → ok idempotente sin revalidar TOTP.
   */
  async syncCheckIns(
    actor: { id: string; rol: RolUsuario },
    items: SyncCheckInItemDto[],
  ): Promise<SyncCheckInsResponseDto> {
    if (!Array.isArray(items)) {
      throw new BadRequestException({
        code: 'DATOS_INVALIDOS',
        message: 'items debe ser un array',
      });
    }
    if (items.length > SYNC_BATCH_MAX) {
      throw new BadRequestException({
        code: 'DATOS_INVALIDOS',
        message: `Máximo ${SYNC_BATCH_MAX} ítems por sync`,
      });
    }

    const results: SyncCheckInResultDto[] = [];
    for (const item of items) {
      results.push(await this.syncOneCheckIn(actor, item));
    }
    return { results };
  }

  private async syncOneCheckIn(
    actor: { id: string; rol: RolUsuario },
    item: SyncCheckInItemDto,
  ): Promise<SyncCheckInResultDto> {
    const clientEventId = item?.clientEventId?.trim() ?? '';
    try {
      if (!clientEventId) {
        throw new BadRequestException({
          code: 'DATOS_INVALIDOS',
          message: 'clientEventId es obligatorio en sync',
        });
      }
      this.assertIds(item.perfilId, item.sedeId);
      await this.assertPuedeOperarSede(actor, item.sedeId);

      const existente =
        await this.repository.findCheckInByClientEventId(clientEventId);
      if (existente) {
        return {
          clientEventId,
          ok: true,
          checkIn: this.toCheckInDto(existente),
        };
      }

      await this.assertMembresiaActiva(item.perfilId);
      const secret = await this.secretDePerfil(item.perfilId);
      const totpOk = await this.totp.verificar(secret, item.code ?? '');
      if (!totpOk) {
        throw new UnauthorizedException({
          code: 'TOTP_INVALIDO',
          message: 'Código TOTP inválido o fuera de ventana',
        });
      }

      try {
        const fila = await this.repository.registrarCheckIn({
          perfilId: item.perfilId,
          sedeId: item.sedeId,
          origen: 'offline_sync',
          ocurrioEn: item.ocurrioEn,
          clientEventId,
        });
        return {
          clientEventId,
          ok: true,
          checkIn: this.toCheckInDto(fila),
        };
      } catch (e) {
        this.rethrowRpc(e);
      }
    } catch (e) {
      const mapped = this.mapSyncError(e);
      return {
        clientEventId: clientEventId || item?.clientEventId || '',
        ok: false,
        code: mapped.code,
        message: mapped.message,
      };
    }
  }

  private mapSyncError(e: unknown): { code: string; message: string } {
    if (e instanceof HttpException) {
      const body = e.getResponse();
      if (typeof body === 'object' && body !== null && 'code' in body) {
        const o = body as { code?: string; message?: string | string[] };
        const message = Array.isArray(o.message)
          ? o.message.join(', ')
          : (o.message ?? e.message);
        return { code: String(o.code ?? 'ERROR'), message };
      }
      if (typeof body === 'string') {
        return { code: 'ERROR', message: body };
      }
      const msg =
        typeof body === 'object' &&
        body !== null &&
        'message' in body &&
        (body as { message?: string | string[] }).message
          ? Array.isArray((body as { message: string | string[] }).message)
            ? (body as { message: string[] }).message.join(', ')
            : String((body as { message: string }).message)
          : e.message;
      return { code: 'ERROR', message: msg };
    }
    if (e instanceof Error) {
      return { code: 'ERROR', message: e.message };
    }
    return { code: 'ERROR', message: 'Error desconocido en sync' };
  }

  async checkOut(
    actor: { id: string; rol: RolUsuario },
    body: {
      perfilId: string;
      sedeId: string;
      clientEventId?: string;
    },
  ): Promise<CheckInResponseDto> {
    this.assertIds(body.perfilId, body.sedeId);
    await this.assertPuedeOperarSede(actor, body.sedeId);

    try {
      const fila = await this.repository.registrarCheckOut({
        perfilId: body.perfilId,
        sedeId: body.sedeId,
        origen: 'online',
        clientEventId: body.clientEventId ?? null,
      });
      return this.toCheckInDto(fila);
    } catch (e) {
      this.rethrowRpc(e);
    }
  }

  async listarPresencias(
    actor: { id: string; rol: RolUsuario },
    sedeId: string,
  ): Promise<PresenciasResponseDto> {
    if (!sedeId?.trim()) {
      throw new BadRequestException('sedeId es obligatorio');
    }
    await this.assertPuedeOperarSede(actor, sedeId);
    const items = await this.repository.listarPresenciasPorSede(sedeId);
    const aforoMax = await this.repository.findAforoMax(sedeId);
    return {
      sedeId,
      items: items.map((p) => ({
        perfilId: p.perfil_id,
        sedeId: p.sede_id,
        desde: p.desde,
      })),
      ocupacion: items.length,
      aforoMax,
    };
  }

  async listarCheckIns(
    actor: { id: string; rol: RolUsuario },
    sedeId: string,
  ): Promise<CheckInResponseDto[]> {
    if (!sedeId?.trim()) {
      throw new BadRequestException('sedeId es obligatorio');
    }
    await this.assertPuedeOperarSede(actor, sedeId);
    const filas = await this.repository.listarCheckInsPorSede(sedeId);
    return filas.map((f) => this.toCheckInDto(f));
  }

  private async secretDePerfil(perfilId: string): Promise<string> {
    const seed = await this.repository.findTotpSeedActivo(perfilId);
    if (!seed) {
      throw new NotFoundException({
        code: 'TOTP_SEED_AUSENTE',
        message: 'El perfil no tiene seed TOTP activo',
      });
    }
    return this.totp.desencriptarSeedAlmacenado(seed.seed_cifrado);
  }

  private async assertMembresiaActiva(perfilId: string): Promise<void> {
    try {
      await this.membresias.findActivaPorPerfil(perfilId);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw new ForbiddenException({
          code: 'MEMBRESIA_INACTIVA',
          message: 'El socio no tiene membresía activa vigente',
        });
      }
      throw e;
    }
  }

  private async assertPuedeOperarSede(
    actor: { id: string; rol: RolUsuario },
    sedeId: string,
  ): Promise<void> {
    if (actor.rol === 'gerente') return;
    if (actor.rol !== 'admin_sede') {
      throw new ForbiddenException('Tu rol no puede operar check-in en sede');
    }
    const ok = await this.repository.esAdminDeSede(actor.id, sedeId);
    if (!ok) {
      throw new ForbiddenException({
        code: 'SEDE_NO_ASIGNADA',
        message: 'No administrás esa sede',
      });
    }
  }

  private assertIds(perfilId: string, sedeId: string): void {
    if (!perfilId?.trim() || !sedeId?.trim()) {
      throw new BadRequestException('perfilId y sedeId son obligatorios');
    }
  }

  private toCheckInDto(fila: CheckIn): CheckInResponseDto {
    return {
      id: fila.id,
      perfilId: fila.perfil_id,
      sedeId: fila.sede_id,
      tipo: fila.tipo,
      origen: fila.origen,
      ocurrioEn: fila.ocurrio_en,
      clientEventId: fila.client_event_id,
    };
  }

  private rethrowRpc(e: unknown): never {
    if (e instanceof RepositoryError && e.code === 'P0001') {
      switch (e.message) {
        case 'YA_DENTRO':
          throw new ConflictException({
            code: 'YA_DENTRO',
            message: 'El socio ya figura dentro de esta sede',
          });
        case 'YA_EN_OTRA_SEDE':
          throw new ConflictException({
            code: 'YA_EN_OTRA_SEDE',
            message: 'El socio ya figura dentro de otra sede',
          });
        case 'EVENTO_DUPLICADO':
          throw new ConflictException({
            code: 'EVENTO_DUPLICADO',
            message: 'clientEventId ya fue registrado',
          });
        case 'PRESENCIA_NO_EXISTE':
          throw new NotFoundException({
            code: 'PRESENCIA_NO_EXISTE',
            message: 'El socio no tiene presencia abierta',
          });
        case 'SEDE_DISTINTA':
          throw new BadRequestException({
            code: 'SEDE_DISTINTA',
            message: 'La presencia abierta es de otra sede',
          });
        case 'PERFIL_NO_EXISTE':
          throw new NotFoundException('El perfil no existe');
        case 'SEDE_NO_EXISTE':
          throw new NotFoundException('La sede no existe');
      }
    }
    throw e;
  }
}
