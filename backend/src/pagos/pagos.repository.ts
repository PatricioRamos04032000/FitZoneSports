import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import type { PlanMembresia } from '../usuarios/membresias/membresia.model';
import {
  EstadoPago,
  MembresiaComprobante,
  NuevoPago,
  Pago,
  ReservaComprobante,
  TitularComprobante,
} from './pago.model';

interface ReservaFila {
  id: string;
  cancha_id: string;
  perfil_id: string;
  inicio: string;
  fin: string;
  precio: number;
  estado: string;
  detalle: Record<string, unknown> | null;
}

interface CanchaFila {
  id: string;
  sede_id: string;
  nombre: string;
  tipo: string;
}

interface SedeFila {
  id: string;
  nombre: string;
  direccion: string | null;
}

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

  async findAprobadoPorReserva(reservaCanchaId: string): Promise<Pago | null> {
    return this.unwrap(
      await this.from()
        .select('*')
        .eq('reserva_cancha_id', reservaCanchaId)
        .eq('estado', 'aprobado')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      'findAprobadoPorReserva',
    );
  }

  async findAprobadosPorPerfil(perfilId: string): Promise<Pago[]> {
    return this.unwrap(
      await this.from()
        .select('*')
        .eq('perfil_id', perfilId)
        .eq('estado', 'aprobado')
        .order('created_at', { ascending: false }),
      'findAprobadosPorPerfil',
    );
  }

  async findPerfilComprobante(
    perfilId: string,
  ): Promise<TitularComprobante | null> {
    return this.unwrap<TitularComprobante | null>(
      await this.client
        .from('perfiles')
        .select('id, nombre, apellido, dni')
        .eq('id', perfilId)
        .maybeSingle(),
      'findPerfilComprobante',
    );
  }

  async findReservaComprobante(
    reservaId: string,
  ): Promise<ReservaComprobante | null> {
    const reserva = this.unwrap<ReservaFila | null>(
      await this.client
        .from('reservas_cancha')
        .select('id, cancha_id, perfil_id, inicio, fin, precio, estado, detalle')
        .eq('id', reservaId)
        .maybeSingle(),
      'findReservaComprobante',
    );
    if (!reserva) {
      return null;
    }

    const cancha = this.unwrap<CanchaFila | null>(
      await this.client
        .from('canchas')
        .select('id, sede_id, nombre, tipo')
        .eq('id', reserva.cancha_id)
        .maybeSingle(),
      'findCanchaComprobante',
    );

    const sede = cancha
      ? this.unwrap<SedeFila | null>(
          await this.client
            .from('sedes')
            .select('id, nombre, direccion')
            .eq('id', cancha.sede_id)
            .maybeSingle(),
          'findSedeComprobante',
        )
      : null;

    return {
      id: reserva.id,
      cancha_id: reserva.cancha_id,
      perfil_id: reserva.perfil_id,
      inicio: reserva.inicio,
      fin: reserva.fin,
      precio: Number(reserva.precio),
      estado: reserva.estado,
      detalle: reserva.detalle ?? {},
      canchaNombre: cancha?.nombre ?? 'Cancha FitZone',
      canchaTipo: cancha?.tipo ?? 'cancha',
      sedeNombre: sede?.nombre ?? 'Sede FitZone',
      sedeDireccion: sede?.direccion ?? null,
    };
  }

  async findMembresiaComprobante(
    membresiaId: string,
  ): Promise<MembresiaComprobante | null> {
    return this.unwrap<MembresiaComprobante | null>(
      await this.client
        .from('membresias')
        .select('id, plan, vigente_desde, vigente_hasta, estado')
        .eq('id', membresiaId)
        .maybeSingle(),
      'findMembresiaComprobante',
    );
  }
}
