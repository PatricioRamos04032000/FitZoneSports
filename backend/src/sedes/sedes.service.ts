import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SedesService {
  
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    // esto hace un SELECT * FROM sedes usando la API de Supabase
    const { data, error } = await this.supabase.getClient()
      .from('sedes')
      .select('*');

    if (error) {
      throw new InternalServerErrorException('Error al obtener las sedes desde Supabase');
    }

    return data;
  }
}