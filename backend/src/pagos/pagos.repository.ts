import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import type { PlanMembresia } from '../usuarios/membresias/membresia.model';
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

  async findPendienteMembresia(
    perfilId: string,
    plan: PlanMembresia,
  ): Promise<Pago | null> {
    return this.unwrap(
      await this.from()
        .select('*')
        .eq('perfil_id', perfilId)
        .eq('concepto', 'membresia')
        .eq('plan', plan)
        .eq('estado', 'pendiente')
        .maybeSingle(),
      'findPendienteMembresia',
    );
  }

  /** Estado aprobado y membresía vinculada en el mismo update (check de pagos). */
  async aprobarMembresia(
    pagoId: string,
    membresiaId: string,
    token: string | null,
  ): Promise<Pago> {
    return this.unwrap(
      await this.from()
        .update({
          estado: 'aprobado',
          token_pasarela: token,
          membresia_id: membresiaId,
        })
        .eq('id', pagoId)
        .select()
        .single(),
      'aprobarMembresia',
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
