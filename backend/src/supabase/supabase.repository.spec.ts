import { Logger } from '@nestjs/common';
import { RepositoryError } from './repository.error';
import { SupabaseRepository } from './supabase.repository';
import { SupabaseService } from './supabase.service';

interface Item {
  id: string;
  nombre: string;
}

class ItemsRepository extends SupabaseRepository<Item> {
  protected readonly table = 'items';

  llamar<R>(fn: string, args?: Record<string, unknown>): Promise<R> {
    return this.rpc<R>(fn, args);
  }
}

const errorSupabase = {
  message: 'CLASE_LLENA',
  code: 'P0001',
  details: '',
  hint: '',
  name: 'PostgrestError',
};

describe('SupabaseRepository', () => {
  const maybeSingle = jest.fn();
  const eq = jest.fn(() => ({ maybeSingle }));
  const select = jest.fn();
  const client = { from: jest.fn(() => ({ select })), rpc: jest.fn() };
  let repository: ItemsRepository;
  let logError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    repository = new ItemsRepository({
      getClient: () => client,
    } as unknown as SupabaseService);
  });

  it('findAll consulta la tabla del repositorio y devuelve las filas', async () => {
    const filas = [{ id: '1', nombre: 'A' }];
    select.mockResolvedValue({ data: filas, error: null });

    await expect(repository.findAll()).resolves.toEqual(filas);
    expect(client.from).toHaveBeenCalledWith('items');
    expect(select).toHaveBeenCalledWith('*');
  });

  it('findById filtra por id y devuelve null si no existe', async () => {
    select.mockReturnValue({ eq });
    maybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(repository.findById('x')).resolves.toBeNull();
    expect(eq).toHaveBeenCalledWith('id', 'x');
  });

  it('rpc llama a la función con sus argumentos', async () => {
    client.rpc.mockResolvedValue({ data: 'ok', error: null });

    await expect(repository.llamar('fn', { a: 1 })).resolves.toBe('ok');
    expect(client.rpc).toHaveBeenCalledWith('fn', { a: 1 });
  });

  it('convierte el error de Supabase en RepositoryError y lo registra', async () => {
    client.rpc.mockResolvedValue({ data: null, error: errorSupabase });

    const promesa = repository.llamar('inscribir_en_clase');

    await expect(promesa).rejects.toBeInstanceOf(RepositoryError);
    await expect(promesa).rejects.toMatchObject({
      message: 'CLASE_LLENA',
      code: 'P0001',
    });
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining('items.rpc inscribir_en_clase: P0001 CLASE_LLENA'),
    );
  });
});
