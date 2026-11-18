import { ApiProperty } from '@nestjs/swagger';

export class ResumenSedeDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'FitZone Central' })
  nombre: string;

  @ApiProperty({ example: true })
  activa: boolean;

  @ApiProperty({ example: 50, description: 'Aforo máximo de la sede' })
  aforo_max: number;

  @ApiProperty({
    example: 3,
    description: 'Personas adentro ahora (filas de presencias)',
  })
  ocupacion: number;

  @ApiProperty({
    example: 4,
    description:
      'Reservas pendiente o confirmada cuyo inicio cae hoy en America/Argentina/Buenos_Aires',
  })
  reservas_del_dia: number;

  @ApiProperty({
    example: 2,
    description:
      'Clases programada cuyo inicio cae hoy en America/Argentina/Buenos_Aires',
  })
  clases_del_dia: number;
}

export class ResumenCadenaDto {
  @ApiProperty({ example: 8 })
  ocupacion: number;

  @ApiProperty({ example: 200 })
  aforo_max: number;

  @ApiProperty({ example: 12 })
  reservas_del_dia: number;

  @ApiProperty({ example: 6 })
  clases_del_dia: number;
}

export class ResumenReporteDto {
  @ApiProperty({
    example: '2026-11-17',
    description: 'Día calendario de America/Argentina/Buenos_Aires',
  })
  fecha: string;

  @ApiProperty({ type: [ResumenSedeDto] })
  sedes: ResumenSedeDto[];

  @ApiProperty({ type: ResumenCadenaDto })
  cadena: ResumenCadenaDto;
}
