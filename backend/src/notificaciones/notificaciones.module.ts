import { Module, OnModuleInit } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ListaEsperaSubject } from './lista-espera.subject';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesRepository } from './notificaciones.repository';
import { NotificacionesService } from './notificaciones.service';
import { EmailSimuladoObserver } from './observers/email-simulado.observer';
import { InAppObserver } from './observers/in-app.observer';
import { LogObserver } from './observers/log.observer';
import { PreferenciasRepository } from './preferencias.repository';

/** Exporta `ListaEsperaSubject` para que Clases publique los lugares liberados. */
@Module({
  imports: [AuthModule],
  controllers: [NotificacionesController],
  providers: [
    ListaEsperaSubject,
    InAppObserver,
    LogObserver,
    EmailSimuladoObserver,
    NotificacionesRepository,
    PreferenciasRepository,
    NotificacionesService,
  ],
  exports: [ListaEsperaSubject],
})
export class NotificacionesModule implements OnModuleInit {
  constructor(
    private readonly listaEspera: ListaEsperaSubject,
    private readonly inApp: InAppObserver,
    private readonly log: LogObserver,
    private readonly emailSimulado: EmailSimuladoObserver,
  ) {}

  onModuleInit(): void {
    this.listaEspera.attach(this.inApp);
    this.listaEspera.attach(this.log);
    this.listaEspera.attach(this.emailSimulado);
  }
}
