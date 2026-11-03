import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import { Membresia } from './membresia.model';

@Injectable()
export class MembresiasRepository extends SupabaseRepository<Membresia> {
  
  protected readonly table = 'membresias';

  // método para buscar la membresía activa de un socio específico
  async findActivaPorPerfil(perfilId: string): Promise<Membresia | null> {
    return this.unwrap<Membresia | null>(
      await this.from()
        .select('*')
        .eq('perfil_id', perfilId)
        .eq('estado', 'activo')
        .maybeSingle(),
      'findActivaPorPerfil'
    );
  }
}