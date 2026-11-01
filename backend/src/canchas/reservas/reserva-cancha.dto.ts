import { ApiProperty } from '@nestjs/swagger';

export class ReservarCanchaDto {
  @ApiProperty({
    example: '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70',
    description: 'ID de la cancha a reservar',
  })
  canchaId: string;

  @ApiProperty({
    example: '2026-11-15T19:00:00-03:00',
    description:
      'Inicio del turno (hora en punto, futuro, dentro de 1 mes). ISO 8601.',
  })
  inicio: string;
}

export class ReservaCanchaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  canchaId: string;

  @ApiProperty()
  perfilId: string;

  @ApiProperty()
  inicio: string;

  @ApiProperty()
  fin: string;

  @ApiProperty({ example: 20000 })
  precio: number;

  @ApiProperty({
    example: {
      precioBase: 20000,
      reglasAplicadas: ['StandardPricing', 'PeakHourPricing'],
      descuentoSocioAplicado: false,
    },
  })
  detalle: Record<string, unknown>;

  @ApiProperty({ enum: ['pendiente', 'confirmada', 'cancelada'] })
  estado: string;

  @ApiProperty()
  createdAt: string;
}
