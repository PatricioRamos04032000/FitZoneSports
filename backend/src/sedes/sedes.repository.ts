import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import { Sede } from './sede.model';

@Injectable()
export class SedesRepository extends SupabaseRepository<Sede> {
  protected readonly table = 'sedes';
}
