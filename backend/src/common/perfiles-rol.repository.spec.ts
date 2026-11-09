import { SupabaseService } from '../supabase/supabase.service';
import { PerfilesRolRepository } from './perfiles-rol.repository';

describe('PerfilesRolRepository', () => {
  const maybeSingle = jest.fn();
  const eq = jest.fn(() => ({ maybeSingle }));
  const select = jest.fn(() => ({ eq }));
  const client = { from: jest.fn(() => ({ select })) };
  const repository = new PerfilesRolRepository({
    getClient: () => client,
  } as unknown as SupabaseService);

  it('devuelve el rol del perfil', async () => {
    maybeSingle.mockResolvedValue({ data: { rol: 'gerente' }, error: null });

    await expect(repository.findRol('u1')).resolves.toBe('gerente');
    expect(client.from).toHaveBeenCalledWith('perfiles');
    expect(select).toHaveBeenCalledWith('rol');
    expect(eq).toHaveBeenCalledWith('id', 'u1');
  });

  it('devuelve null si el usuario no tiene perfil', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(repository.findRol('u1')).resolves.toBeNull();
  });
});
