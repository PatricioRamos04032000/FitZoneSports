import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TipoCancha } from './cancha.model';

export const TIPOS_CANCHA: readonly TipoCancha[] = [
  'paddle',
  'futbol5',
  'otro',
] as const;

export type EstadoTurnoGrilla = 'disponible' | 'ocupado' | 'mantenimiento';

export class CanchaResponseDto {
  @ApiProperty({ example: 'a3000000-0000-4000-8000-000000000001' })
  id: string;

  @ApiProperty({ example: 'a1000000-0000-4000-8000-000000000001' })
  sedeId: string;

  @ApiProperty({ example: 'Paddle 1' })
  nombre: string;

  @ApiProperty({ enum: TIPOS_CANCHA, example: 'paddle' })
  tipo: TipoCancha;

  @ApiProperty({ example: 20000 })
  precioHora: number;

  @ApiProperty({ example: true })
  activa: boolean;

  @ApiProperty({ example: '2026-10-27T20:00:00.000Z' })
  createdAt: string;
}

export class CrearCanchaDto {
  @ApiProperty({
    example: 'a1000000-0000-4000-8000-000000000001',
    description: 'ID de la sede a la que pertenece la cancha',
  })
  sedeId: string;

  @ApiProperty({ example: 'Paddle 2' })
  nombre: string;

  @ApiProperty({ enum: TIPOS_CANCHA, example: 'paddle' })
  tipo: TipoCancha;

  @ApiProperty({
    example: 20000,
    description: 'Precio base por hora en pesos (RF-09, S4-T09 P1)',
  })
  precioHora: number;
}

export class ActualizarCanchaDto {
  @ApiPropertyOptional({ example: 'Paddle Central 1' })
  nombre?: string;

  @ApiPropertyOptional({
    example: 22000,
    description: 'Nuevo precio base por hora (solo afecta reservas nuevas)',
  })
  precioHora?: number;

  @ApiPropertyOptional({ example: true })
  activa?: boolean;
}

export class MantenimientoCanchaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  canchaId: string;

  @ApiProperty({ example: '2026-11-15T14:00:00-03:00' })
  desde: string;

  @ApiProperty({ example: '2026-11-15T18:00:00-03:00' })
  hasta: string;

  @ApiPropertyOptional({ nullable: true, example: 'Pintura de líneas' })
  motivo: string | null;

  @ApiProperty()
  createdAt: string;
}

export class CrearMantenimientoDto {
  @ApiProperty({
    example: '2026-11-15T14:00:00-03:00',
    description: 'Inicio del período de mantenimiento (ISO 8601)',
  })
  desde: string;

  @ApiProperty({
    example: '2026-11-15T18:00:00-03:00',
    description: 'Fin del período de mantenimiento (ISO 8601, posterior a desde)',
  })
  hasta: string;

  @ApiPropertyOptional({ example: 'Recambio de césped sintético' })
  motivo?: string;
}

export class ConfiguracionPicoDto {
  @ApiProperty({ example: 'a1000000-0000-4000-8000-000000000001' })
  sedeId: string;

  @ApiProperty({ example: 20, description: 'Porcentaje de recargo (0 a 100)' })
  recargoPct: number;

  @ApiProperty({ example: '19:00', description: 'Hora de inicio en punto (HH:00)' })
  desde: string;

  @ApiProperty({ example: '21:00', description: 'Hora de fin en punto (HH:00)' })
  hasta: string;

  @ApiProperty({
    type: [Number],
    example: [1, 2, 3, 4, 5, 6, 7],
    description: 'Días ISO en que aplica (1 = lunes … 7 = domingo)',
  })
  dias: number[];
}

export class ActualizarConfiguracionPicoDto {
  @ApiProperty({ example: 20, description: 'Porcentaje de recargo entre 0 y 100' })
  recargoPct: number;

  @ApiProperty({ example: '19:00', description: 'Hora de inicio en punto (HH:00)' })
  desde: string;

  @ApiProperty({ example: '21:00', description: 'Hora de fin en punto (HH:00)' })
  hasta: string;

  @ApiProperty({
    type: [Number],
    example: [1, 2, 3, 4, 5],
    description: 'Lista no vacía de días ISO (1 = lunes … 7 = domingo)',
  })
  dias: number[];
}

export class DescuentoSocioResponseDto {
  @ApiProperty({
    example: 15,
    description: 'Porcentaje único de descuento de socio para toda la cadena',
  })
  descuentoSocioPct: number;
}

export class ActualizarDescuentoSocioDto {
  @ApiProperty({
    example: 15,
    description: 'Porcentaje de descuento de socio entre 0 y 100',
  })
  descuentoSocioPct: number;
}

export class TurnoDisponibilidadDto {
  @ApiProperty({ example: '19:00' })
  hora: string;

  @ApiProperty({
    example: '2026-11-15T19:00:00-03:00',
    description: 'Inicio del turno en hora Argentina (ISO 8601, listo para reservar)',
  })
  inicio: string;

  @ApiProperty({ example: '2026-11-15T20:00:00-03:00' })
  fin: string;

  @ApiProperty({
    enum: ['disponible', 'ocupado', 'mantenimiento'],
    example: 'disponible',
  })
  estado: EstadoTurnoGrilla;

  @ApiProperty({ example: true })
  esHorarioPico: boolean;

  @ApiProperty({
    example: 24000,
    description: 'Precio final calculado con Strategy para cliente externo o socio vencido',
  })
  precioExterno: number;

  @ApiProperty({
    example: 20400,
    description: 'Precio final calculado con Strategy para socio con membresía activa',
  })
  precioSocio: number;
}

export class CanchaDisponibilidadDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sedeId: string;

  @ApiProperty({ example: 'Paddle 1' })
  nombre: string;

  @ApiProperty({ enum: TIPOS_CANCHA, example: 'paddle' })
  tipo: TipoCancha;

  @ApiProperty({ example: 20000 })
  precioHora: number;

  @ApiProperty({ type: [TurnoDisponibilidadDto] })
  turnos: TurnoDisponibilidadDto[];
}

export class DisponibilidadSedeResponseDto {
  @ApiProperty({ example: 'a1000000-0000-4000-8000-000000000001' })
  sedeId: string;

  @ApiProperty({ example: '2026-11-15' })
  fecha: string;

  @ApiProperty({ type: ConfiguracionPicoDto })
  configuracionPico: ConfiguracionPicoDto;

  @ApiProperty({ example: 15 })
  descuentoSocioPct: number;

  @ApiProperty({ type: [CanchaDisponibilidadDto] })
  canchas: CanchaDisponibilidadDto[];
}
