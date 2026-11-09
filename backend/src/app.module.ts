import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './usuarios/auth/auth.module';
import { HealthModule } from './health/health.module';
import { SedesModule } from './usuarios/sedes/sedes.module';
import { NotificacionesModule } from './clases/notificaciones/notificaciones.module';
import { MembresiasModule } from './usuarios/membresias/membresias.module';
import { ClasesModule } from './clases/clases.module';
import { PreciosModule } from './canchas/precios/precios.module';
import { ReservasCanchaModule } from './canchas/reservas/reservas-cancha.module';
import { CanchasModule } from './canchas/canchas.module';
import { PagosModule } from './pagos/pagos.module';
import { PerfilesModule } from './usuarios/perfiles/perfiles.module';
import { AccesoModule } from './acceso/acceso.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    SupabaseModule,
    HealthModule,
    AuthModule,
    SedesModule,
    PerfilesModule,
    NotificacionesModule,
    MembresiasModule,
    ClasesModule,
    PreciosModule,
    PagosModule,
    ReservasCanchaModule,
    CanchasModule,
    AccesoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
