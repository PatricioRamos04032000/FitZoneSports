import { ApiProperty } from '@nestjs/swagger';
import {
  PLANES_MEMBRESIA,
  type EstadoMembresia,
  type Membresia,
  type PlanMembresia,
  type PlanMembresiaFila,
} from './membresia.model';

export class CrearMembresiaDto {
  @ApiProperty({
    format: 'uuid',
    example: 'a1000000-0000-4000-8000-000000000001',
    description: 'UUID del perfil del socio al que se le da de alta o renueva la membresía',
  })
  perfil_id!: string;

  @ApiProperty({
    enum: PLANES_MEMBRESIA,
    example: 'mensual',
    description: 'Plan contratado según catálogo de planes_membresia',
  })
  plan!: PlanMembresia;
}

export class MembresiaResponseDto implements Membresia {
  @ApiProperty({ format: 'uuid', example: 'b1000000-0000-4000-8000-000000000001' })
  id!: string;

  @ApiProperty({ format: 'uuid', example: 'a1000000-0000-4000-8000-000000000001' })
  perfil_id!: string;

  @ApiProperty({ enum: PLANES_MEMBRESIA, example: 'mensual' })
  plan!: PlanMembresia;

  @ApiProperty({ enum: ['activo', 'vencido', 'suspendido'], example: 'activo' })
  estado!: EstadoMembresia;

  @ApiProperty({ format: 'date', example: '2026-11-04' })
  vigente_desde!: string;

  @ApiProperty({ format: 'date', example: '2026-12-04' })
  vigente_hasta!: string;
}

export class PlanMembresiaResponseDto implements PlanMembresiaFila {
  @ApiProperty({ enum: PLANES_MEMBRESIA, example: 'mensual' })
  plan!: PlanMembresia;

  @ApiProperty({ example: 1, description: 'Duración del plan en meses calendario' })
  duracion_meses!: number;

  @ApiProperty({ example: 25000, description: 'Precio vigente del plan en ARS' })
  precio!: number;

  @ApiProperty({ example: true })
  activo!: boolean;
}
