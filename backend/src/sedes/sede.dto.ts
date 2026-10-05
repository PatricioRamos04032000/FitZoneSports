import { ApiProperty } from '@nestjs/swagger';

export class SedeDto {
  @ApiProperty({ format: 'uuid', example: '42363e91-8c03-4d52-b160-5c1345be8656' })
  id: string;

  @ApiProperty({ example: 'FitZone Central' })
  nombre: string;

  @ApiProperty({ example: 'San Martín 1234' })
  direccion: string;

  @ApiProperty({ example: 100, description: 'Capacidad máxima de personas en la sede' })
  aforo_max: number;

  @ApiProperty({ example: true })
  activa: boolean;

  @ApiProperty({ format: 'date-time', example: '2026-09-21T16:15:30.534949+00:00' })
  created_at: string;
}
