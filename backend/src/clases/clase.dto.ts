import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  ClaseConCupo,
  EstadoClase,
  EstadoInscripcion,
  InscripcionClase,
} from './clase.model';

export class InscribirClaseDto {
  @ApiProperty({
    format: 'uuid',
    example: 'c1000000-0000-4000-8000-000000000001',
    description: 'UUID de la clase a reservar (el socio se obtiene del token JWT)',
  })
  claseId!: string;
}

export class ClaseConCupoResponseDto implements ClaseConCupo {
  @ApiProperty({ format: 'uuid', example: 'c1000000-0000-4000-8000-000000000001' })
  id!: string;

  @ApiProperty({ format: 'uuid', example: '42363e91-8c03-4d52-b160-5c1345be8656' })
  sede_id!: string;

  @ApiProperty({ example: 'Spinning' })
  tipo!: string;

  @ApiProperty({ example: 'Lucía Fernández' })
  instructor!: string;

  @ApiProperty({ format: 'date-time', example: '2026-11-10T18:00:00-03:00' })
  inicio!: string;

  @ApiProperty({ format: 'date-time', example: '2026-11-10T19:00:00-03:00' })
  fin!: string;

  @ApiProperty({ example: 20 })
  capacidad_max!: number;

  @ApiProperty({ enum: ['programada', 'cancelada'], example: 'programada' })
  estado!: EstadoClase;

  @ApiProperty({ format: 'date-time', example: '2026-11-01T12:00:00Z' })
  created_at!: string;

  @ApiProperty({ example: 5, description: 'Lugares disponibles descontando inscriptos y notificados vigentes' })
  cupos_libres!: number;

  @ApiProperty({ example: 0, description: 'Cantidad de socios aguardando en lista de espera' })
  en_espera!: number;
}

export class InscripcionClaseResponseDto implements InscripcionClase {
  @ApiProperty({ format: 'uuid', example: 'd1000000-0000-4000-8000-000000000001' })
  id!: string;

  @ApiProperty({ format: 'uuid', example: 'c1000000-0000-4000-8000-000000000001' })
  clase_id!: string;

  @ApiProperty({ format: 'uuid', example: 'a1000000-0000-4000-8000-000000000001' })
  perfil_id!: string;

  @ApiProperty({ enum: ['inscripto', 'cancelada'], example: 'inscripto' })
  estado!: EstadoInscripcion;

  @ApiProperty({ format: 'date-time', example: '2026-11-04T19:00:00Z' })
  created_at!: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true, example: null })
  cancelada_en?: string | null;

  @ApiProperty({ example: false, description: 'True si se canceló con menos de 2 h de anticipación (D6)' })
  cancelacion_tardia!: boolean;
}
