import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import { EstadoPago, NuevoPago, Pago } from './pago.model';

@Injectable()
export class PagosRepository extends SupabaseRepository<Pago> {
  protected readonly table = 'pagos';

  async registrarCobro(nuevo: NuevoPago): Promise<Pago> {
    return this.unwrap(
      await this.from().insert(nuevo).select().single(),
      'registrarCobro',
    );
  }

  async findPendientePorReserva(reservaCanchaId: string): Promise<Pago | null> {
    return this.unwrap(
      await this.from()
        .select('*')
        .eq('reserva_cancha_id', reservaCanchaId)
        .eq('estado', 'pendiente')
        .maybeSingle(),
      'findPendientePorReserva',
    );
  }

  async actualizarEstado(
    pagoId: string,
    cambios: {
      estado: EstadoPago;
      token_pasarela: string | null;
    },
  ): Promise<Pago> {
    return this.unwrap(
      await this.from()
        .update(cambios)
        .eq('id', pagoId)
        .select()
        .single(),
      'actualizarEstado',
    );
  }
}
