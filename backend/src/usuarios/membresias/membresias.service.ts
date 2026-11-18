import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { AccesoService } from '../../acceso/acceso.service';
import { PagosRepository } from '../../pagos/pagos.repository';
import {
  PASARELA_PAGO,
  type PasarelaPago,
} from '../../pagos/pasarela-pago';
import { RepositoryError } from '../../supabase/repository.error';
import { CrearMembresiaDto } from './membresia.dto';
import {
  Membresia,
  PLANES_MEMBRESIA,
  PlanMembresia,
  PlanMembresiaFila,
} from './membresia.model';
import { MembresiasRepository } from './membresias.repository';

const ZONA_HORARIA_AR = 'America/Argentina/Buenos_Aires';
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const formatoFechaArgentina = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA_AR,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Devuelve la fecha calendario actual en Argentina en formato `YYYY-MM-DD`. */
export function fechaHoyArgentina(ahora: Date = new Date()): string {
  return formatoFechaArgentina.format(ahora);
}

/**
 * Suma meses calendario sobre una fecha `YYYY-MM-DD` ajustando al último día
 * válido del mes destino (p. ej. 2026-01-31 + 1 mes = 2026-02-28).
 */
export function sumarMesesFechaIso(fechaIso: string, meses: number): string {
  const [anioStr, mesStr, diaStr] = fechaIso.split('-');
  const anio = Number(anioStr);
  const mes = Number(mesStr);
  const dia = Number(diaStr);

  const totalMeses = anio * 12 + (mes - 1) + meses;
  const anioDestino = Math.floor(totalMeses / 12);
  const mesDestino0 = totalMeses % 12;
  const ultimoDiaMesDestino = new Date(
    Date.UTC(anioDestino, mesDestino0 + 1, 0),
  ).getUTCDate();
  const diaDestino = Math.min(dia, ultimoDiaMesDestino);

  const mm = String(mesDestino0 + 1).padStart(2, '0');
  const dd = String(diaDestino).padStart(2, '0');
  return `${anioDestino}-${mm}-${dd}`;
}

@Injectable()
export class MembresiasService {
  constructor(
    private readonly repository: MembresiasRepository,
    @Inject(forwardRef(() => AccesoService))
    private readonly acceso: AccesoService,
    @Inject(forwardRef(() => PagosRepository))
    private readonly pagos: PagosRepository,
    @Inject(PASARELA_PAGO) private readonly pasarela: PasarelaPago,
  ) {}

  async listarPlanes(): Promise<PlanMembresiaFila[]> {
    return this.repository.findPlanesActivos();
  }

  async findAll(ahora: Date = new Date()): Promise<Membresia[]> {
    const hoy = fechaHoyArgentina(ahora);
    const filas = await this.repository.findAll();
    return filas.map((m) => this.calcularEstadoVencido(m, hoy));
  }

  /**
   * Consulta la membresía vigente de un perfil. Lanza `NotFoundException` si no existe
   * o si `vigente_hasta < hoy` (en hora Argentina). Usado también por `AccesoService` (M2)
   * y `ClasesService` (RN-03).
   */
  async findActivaPorPerfil(
    perfilId: string,
    ahora: Date = new Date(),
  ): Promise<Membresia> {
    this.validarUuid(perfilId, 'perfilId');

    const membresia = await this.repository.findActivaPorPerfil(perfilId);
    if (!membresia) {
      throw new NotFoundException('El usuario no tiene una membresía activa');
    }

    const hoy = fechaHoyArgentina(ahora);
    if (membresia.vigente_hasta < hoy) {
      throw new NotFoundException('La membresía se encuentra vencida');
    }

    return membresia;
  }

  /**
   * Devuelve la membresía actual o más reciente del socio autenticado aplicando
   * la decisión D3 (`estado: 'vencido'` calculado dinámicamente en Nest si expiró).
   */
  async obtenerMia(
    perfilId: string,
    ahora: Date = new Date(),
  ): Promise<Membresia> {
    this.validarUuid(perfilId, 'perfilId');

    const membresia =
      (await this.repository.findActivaPorPerfil(perfilId)) ??
      (await this.repository.findUltimaPorPerfil(perfilId));

    if (!membresia) {
      throw new NotFoundException('El usuario no tiene membresías registradas');
    }

    return this.calcularEstadoVencido(membresia, fechaHoyArgentina(ahora));
  }

  async crear(
    dto: CrearMembresiaDto,
    ahora: Date = new Date(),
  ): Promise<Membresia> {
    if (!dto || typeof dto !== 'object') {
      throw new BadRequestException('Los datos de la membresía son obligatorios');
    }

    this.validarUuid(dto.perfil_id, 'perfil_id');
    this.validarPlan(dto.plan);

    const planFila = await this.repository.findPlanActivo(dto.plan);
    if (!planFila) {
      throw new BadRequestException('El plan solicitado no se encuentra activo');
    }

    // La vigencia la calcula renovar_membresia (misma zona que fechaHoyArgentina).
    void ahora;

    let creada: Membresia;
    try {
      creada = await this.repository.renovar(dto.perfil_id, dto.plan);
    } catch (e) {
      this.traducirErrorAlta(e);
    }

    // Acceso M2: socio con membresía activa recibe seed TOTP cifrado (si aún no tiene).
    if (creada.perfil_id) {
      await this.acceso.ensureTotpSeed(creada.perfil_id);
    }

    return creada;
  }

  /**
   * El socio elige un plan del catálogo. Deja un pago pendiente y la URL del checkout.
   * La membresía vigente no cambia hasta que la pasarela aprueba.
   */
  async iniciarRenovacion(
    perfilId: string,
    plan: unknown,
  ): Promise<{
    pagoId: string;
    checkoutUrl: string;
    monto: number;
    plan: PlanMembresia;
  }> {
    this.validarUuid(perfilId, 'perfilId');
    this.validarPlan(plan);

    const planFila = await this.repository.findPlanActivo(plan);
    if (!planFila) {
      throw new BadRequestException('El plan solicitado no se encuentra activo');
    }

    const preferencia = await this.pasarela.crearPreferencia({
      monto: Number(planFila.precio),
      concepto: 'membresia',
      referenciaId: perfilId,
      perfilId,
      plan,
    });

    return {
      pagoId: preferencia.pagoId,
      checkoutUrl: preferencia.checkoutUrl,
      monto: Number(planFila.precio),
      plan,
    };
  }

  /**
   * Resultado del checkout de un pago de membresía.
   * El rechazo solo marca el pago. La aprobación cierra la activa e inserta la nueva.
   */
  async aplicarResultadoPago(
    pago: { id: string; perfil_id: string; plan: PlanMembresia | null },
    aprobado: boolean,
    token?: string,
  ): Promise<void> {
    if (!aprobado) {
      await this.pagos.actualizarEstado(pago.id, {
        estado: 'rechazado',
        token_pasarela: null,
      });
      return;
    }

    if (!pago.plan) {
      throw new BadRequestException('El pago de membresía no tiene plan');
    }

    let creada: Membresia;
    try {
      creada = await this.repository.renovar(pago.perfil_id, pago.plan);
    } catch (e) {
      this.traducirErrorAlta(e);
    }

    await this.pagos.aprobarMembresia(pago.id, creada.id, token ?? null);
    await this.acceso.ensureTotpSeed(pago.perfil_id);
  }

  private traducirErrorAlta(e: unknown): never {
    if (e instanceof RepositoryError) {
      if (e.code === '23505') {
        throw new ConflictException(
          'El socio ya posee una membresía activa en curso',
        );
      }
      if (e.code === '23503') {
        throw new NotFoundException('El perfil indicado no existe');
      }
      if (e.message.includes('PLAN_INACTIVO')) {
        throw new BadRequestException('El plan solicitado no se encuentra activo');
      }
    }
    throw e;
  }

  private calcularEstadoVencido(membresia: Membresia, hoyIso: string): Membresia {
    if (membresia.estado === 'activo' && membresia.vigente_hasta < hoyIso) {
      return { ...membresia, estado: 'vencido' };
    }
    return membresia;
  }

  private validarUuid(valor: string | undefined, campo: string): void {
    if (!valor || typeof valor !== 'string' || !UUID_REGEX.test(valor)) {
      throw new BadRequestException(`${campo} debe ser un UUID válido`);
    }
  }

  private validarPlan(plan: unknown): asserts plan is PlanMembresia {
    if (
      typeof plan !== 'string' ||
      !(PLANES_MEMBRESIA as readonly string[]).includes(plan)
    ) {
      throw new BadRequestException(
        `El plan debe ser uno de: ${PLANES_MEMBRESIA.join(', ')}`,
      );
    }
  }
}
