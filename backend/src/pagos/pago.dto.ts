import { ApiProperty } from '@nestjs/swagger';

export class PagoResumenDto {
  @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
  id: string;

  @ApiProperty({ enum: ['membresia', 'reserva_cancha'] })
  concepto: 'membresia' | 'reserva_cancha';

  @ApiProperty({ example: 24000 })
  monto: number;

  @ApiProperty({ enum: ['pendiente', 'aprobado', 'rechazado'] })
  estado: 'pendiente' | 'aprobado' | 'rechazado';

  @ApiProperty({ nullable: true })
  reservaCanchaId: string | null;

  @ApiProperty({ nullable: true })
  membresiaId: string | null;

  @ApiProperty({ nullable: true, enum: ['mensual', 'trimestral', 'anual'] })
  plan: 'mensual' | 'trimestral' | 'anual' | null;

  @ApiProperty({ example: '2026-11-15T19:00:00.000Z' })
  createdAt: string;
}
