import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckInRequestDto {
  @ApiProperty({ format: 'uuid' })
  perfilId: string;

  @ApiProperty({ description: 'Código TOTP de 6 dígitos del QR del socio' })
  code: string;

  @ApiProperty({ format: 'uuid' })
  sedeId: string;

  @ApiPropertyOptional({
    format: 'uuid',
    required: false,
    nullable: true,
    description:
      'Opcional. Solo para sync offline / reintentos (idempotencia). En check-in online online NO hace falta: omitilo o dejalo vacío.',
  })
  clientEventId?: string;
}

export class CheckOutRequestDto {
  @ApiProperty({ format: 'uuid' })
  perfilId: string;

  @ApiProperty({ format: 'uuid' })
  sedeId: string;

  @ApiPropertyOptional({
    format: 'uuid',
    required: false,
    nullable: true,
    description: 'Opcional. Idempotencia offline; en uso normal omitilo.',
  })
  clientEventId?: string;
}

export class EmitirTotpDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Perfil al que emitir o rotar el seed TOTP',
  })
  perfilId: string;
}

export class TotpMeResponseDto {
  @ApiProperty({ format: 'uuid' })
  perfilId: string;

  @ApiProperty({ example: 60 })
  periodSeconds: number;

  @ApiProperty({
    description: 'Secreto base32 para armar el QR (Authenticator / lib cliente)',
  })
  secret: string;
}

export class TotpCodigoResponseDto {
  @ApiProperty({ example: '123456' })
  code: string;

  @ApiProperty({ example: 60 })
  periodSeconds: number;

  @ApiProperty({ description: 'Segundos restantes del período actual' })
  secondsRemaining: number;
}

export class CheckInResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  perfilId: string;

  @ApiProperty({ format: 'uuid' })
  sedeId: string;

  @ApiProperty({ enum: ['entrada', 'salida'] })
  tipo: 'entrada' | 'salida';

  @ApiProperty({ enum: ['online', 'offline_sync'] })
  origen: 'online' | 'offline_sync';

  @ApiProperty()
  ocurrioEn: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  clientEventId: string | null;
}

export class PresenciaItemDto {
  @ApiProperty({ format: 'uuid' })
  perfilId: string;

  @ApiProperty({ format: 'uuid' })
  sedeId: string;

  @ApiProperty()
  desde: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  nombre: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  apellido: string | null;
}

export class PresenciasResponseDto {
  @ApiProperty({ format: 'uuid' })
  sedeId: string;

  @ApiProperty({ type: [PresenciaItemDto] })
  items: PresenciaItemDto[];

  @ApiProperty({ description: 'Cantidad de socios dentro' })
  ocupacion: number;

  @ApiPropertyOptional({
    description: 'aforo_max de la sede (soft; no bloquea ingreso)',
    nullable: true,
  })
  aforoMax: number | null;
}

export class EmitirTotpResponseDto {
  @ApiProperty({ format: 'uuid' })
  perfilId: string;

  @ApiProperty({ description: 'true si se creó o rotó el seed' })
  emitido: boolean;
}

export class SyncCheckInItemDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Idempotencia: UUID generado en el cliente al encolar',
  })
  clientEventId: string;

  @ApiProperty({ format: 'uuid' })
  perfilId: string;

  @ApiProperty({ description: 'Código TOTP capturado al escanear (puede estar vencido al sync)' })
  code: string;

  @ApiProperty({ format: 'uuid' })
  sedeId: string;

  @ApiPropertyOptional({
    description: 'Timestamp del escaneo offline (ISO). Si falta, usa now().',
  })
  ocurrioEn?: string;
}

export class SyncCheckInsRequestDto {
  @ApiProperty({
    type: [SyncCheckInItemDto],
    description: 'Cola offline (máx. 50 ítems)',
  })
  items: SyncCheckInItemDto[];
}

export class SyncCheckInResultDto {
  @ApiProperty({ format: 'uuid' })
  clientEventId: string;

  @ApiProperty()
  ok: boolean;

  @ApiPropertyOptional({ type: CheckInResponseDto })
  checkIn?: CheckInResponseDto;

  @ApiPropertyOptional({
    example: 'YA_EN_OTRA_SEDE',
    description: 'Código tipado si ok=false',
  })
  code?: string;

  @ApiPropertyOptional()
  message?: string;
}

export class SyncCheckInsResponseDto {
  @ApiProperty({ type: [SyncCheckInResultDto] })
  results: SyncCheckInResultDto[];
}
