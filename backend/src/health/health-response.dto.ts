import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: 'ok';

  @ApiProperty({
    example: '2026-09-26T22:00:00.000Z',
    description: 'Fecha y hora del servidor (ISO 8601)',
  })
  timestamp: string;

  @ApiProperty({
    example: 123.45,
    description: 'Segundos desde que arrancó el proceso',
  })
  uptime: number;
}
