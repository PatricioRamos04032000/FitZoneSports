import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import {
  Membresia,
  NuevaMembresiaRow,
  PlanMembresia,
  PlanMembresiaFila,
} from './membresia.model';

@Injectable()
export class MembresiasRepository extends SupabaseRepository<Membresia> {
  protected readonly table = 'membresias';

  async findActivaPorPerfil(perfilId: string): Promise<Membresia | null> {
    return this.unwrap<Membresia | null>(
      await this.from()
        .select('*')
        .eq('perfil_id', perfilId)
        .eq('estado', 'activo')
        .maybeSingle(),
      'findActivaPorPerfil',
    );
  }

  async findUltimaPorPerfil(perfilId: string): Promise<Membresia | null> {
    return this.unwrap<Membresia | null>(
      await this.from()
        .select('*')
        .eq('perfil_id', perfilId)
        .order('vigente_hasta', { ascending: false })
        .limit(1)
        .maybeSingle(),
      'findUltimaPorPerfil',
    );
  }

  async findPlanesActivos(): Promise<PlanMembresiaFila[]> {
    const filas = this.unwrap<PlanMembresiaFila[]>(
      await this.client
        .from('planes_membresia')
        .select('*')
        .eq('activo', true)
        .order('duracion_meses', { ascending: true }),
      'findPlanesActivos',
    );
    return filas.map((f) => ({ ...f, precio: Number(f.precio) }));
  }

  async findPlanActivo(plan: PlanMembresia): Promise<PlanMembresiaFila | null> {
    const fila = this.unwrap<PlanMembresiaFila | null>(
      await this.client
        .from('planes_membresia')
        .select('*')
        .eq('plan', plan)
        .eq('activo', true)
        .maybeSingle(),
      'findPlanActivo',
    );
    return fila ? { ...fila, precio: Number(fila.precio) } : null;
  }

  /**
   * Decisión D1: el índice parcial `membresias_una_activa_por_perfil` admite
   * a lo sumo una fila en estado `'activo'` por socio. Al renovar se cierra la anterior.
   */
  async cerrarActivasPorPerfil(perfilId: string): Promise<void> {
    this.unwrap(
      await this.from()
        .update({ estado: 'vencido' })
        .eq('perfil_id', perfilId)
        .eq('estado', 'activo'),
      'cerrarActivasPorPerfil',
    );
  }

  async crear(nueva: NuevaMembresiaRow): Promise<Membresia> {
    return this.unwrap<Membresia>(
      await this.from().insert(nueva).select('*').single(),
      'crear',
    );
  }
}
