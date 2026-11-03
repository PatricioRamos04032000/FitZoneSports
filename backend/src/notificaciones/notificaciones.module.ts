import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ListaEsperaPublisher } from './lista-espera.publisher';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesRepository } from './notificaciones.repository';
import { NotificacionesService } from './notificaciones.service';
import { EmailSimuladoObserver } from './observers/email-simulado.observer';
import { InAppObserver } from './observers/in-app.observer';
import { LogObserver } from './observers/log.observer';
import { PreferenciasRepository } from './preferencias.repository';

/** Exporta `ListaEsperaPublisher` para que Clases publique los lugares liberados. */
@Module({
  imports: [AuthModule],
  controllers: [NotificacionesController],
  providers: [
    ListaEsperaPublisher,
    InAppObserver,
    LogObserver,
    EmailSimuladoObserver,
    NotificacionesRepository,
    PreferenciasRepository,
    NotificacionesService,
  ],
  exports: [ListaEsperaPublisher],
})
export class NotificacionesModule {}
