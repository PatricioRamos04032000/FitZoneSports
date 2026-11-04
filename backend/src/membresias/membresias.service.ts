import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { AccesoService } from '../acceso/acceso.service';
import { RepositoryError } from '../supabase/repository.error';
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

    const vigenteDesde = fechaHoyArgentina(ahora);
    const vigenteHasta = sumarMesesFechaIso(
      vigenteDesde,
      planFila.duracion_meses,
    );

    // D1: cerrar cualquier membresía activa previa del socio antes de dar de alta la nueva.
    await this.repository.cerrarActivasPorPerfil(dto.perfil_id);

    let creada: Membresia;
    try {
      creada = await this.repository.crear({
        perfil_id: dto.perfil_id,
        plan: dto.plan,
        estado: 'activo',
        vigente_desde: vigenteDesde,
        vigente_hasta: vigenteHasta,
      });
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.code === '23505') {
          throw new ConflictException(
            'El socio ya posee una membresía activa en curso',
          );
        }
        if (e.code === '23503') {
          throw new NotFoundException('El perfil indicado no existe');
        }
      }
      throw e;
    }

    // Acceso M2: socio con membresía activa recibe seed TOTP cifrado (si aún no tiene).
    if (creada.perfil_id) {
      await this.acceso.ensureTotpSeed(creada.perfil_id);
    }

    return creada;
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
