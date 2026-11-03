import { Injectable, Logger } from '@nestjs/common';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from './repository.error';
import { SupabaseService } from './supabase.service';

type SupabaseResult<R> = { data: R | null; error: PostgrestError | null };

/**
 * Plantilla del patrón Repository sobre la API de Supabase.
 * Cada repositorio de dominio extiende esta clase, define `table` y agrega
 * sus consultas propias usando `from()`, `rpc()` y `unwrap()`.
 * Ninguna otra capa debe usar el cliente de Supabase directamente.
 * `@Injectable()` es necesario para que Nest inyecte `SupabaseService`
 * en las subclases que no declaran constructor.
 */
@Injectable()
export abstract class SupabaseRepository<T> {
  protected abstract readonly table: string;
  protected readonly logger = new Logger(this.constructor.name);

  constructor(private readonly supabase: SupabaseService) {}

  protected get client(): SupabaseClient {
    return this.supabase.getClient();
  }

  protected from() {
    return this.client.from(this.table);
  }

  async findAll(): Promise<T[]> {
    return this.unwrap<T[]>(await this.from().select('*'), 'findAll');
  }

  async findById(id: string): Promise<T | null> {
    return this.unwrap<T | null>(
      await this.from().select('*').eq('id', id).maybeSingle(),
      'findById',
    );
  }

  protected async rpc<R>(fn: string, args?: Record<string, unknown>): Promise<R> {
    return this.unwrap<R>(await this.client.rpc(fn, args), `rpc ${fn}`);
  }

  protected unwrap<R>({ data, error }: SupabaseResult<R>, operacion: string): R {
    if (error) {
      this.logger.error(
        `${this.table}.${operacion}: ${error.code ?? 'sin código'} ${error.message}`,
      );
      throw new RepositoryError(error.message, error.code, error.details);
    }
    return data as R;
  }
}
