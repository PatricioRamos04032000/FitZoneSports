import { ApiProperty } from '@nestjs/swagger';
import {
  Notificacion,
  PreferenciasNotificacion,
  type TipoNotificacion,
} from './notificacion.model';

export class NotificacionDto implements Notificacion {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  perfil_id: string;

  @ApiProperty({ enum: ['lugar_liberado'] })
  tipo: TipoNotificacion;

  @ApiProperty({ example: 'Se liberó un lugar en Spinning' })
  titulo: string;

  @ApiProperty({
    example:
      'Hay un lugar para vos en Spinning (7/10, 18:00). Confirmalo antes de 7/10, 16:30; si no, pasa al siguiente de la lista.',
  })
  mensaje: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Para lugar_liberado: espera_id, clase_id y vence_en',
    example: {
      espera_id: '9b1d...',
      clase_id: '4c2e...',
      vence_en: '2026-10-07T19:30:00+00:00',
    },
  })
  datos: Record<string, unknown>;

  @ApiProperty({ format: 'date-time', nullable: true, type: String })
  leida_en: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;
}

export class PreferenciasNotificacionDto implements PreferenciasNotificacion {
  @ApiProperty({
    description: 'Además del aviso in-app, recibir un email (simulado)',
    example: true,
  })
  notificar_por_email: boolean;
}
