import { Test } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { SedesRepository } from './sedes.repository';

describe('SedesRepository', () => {
  it('consulta la tabla sedes', async () => {
    const select = jest.fn().mockResolvedValue({ data: [], error: null });
    const client = { from: jest.fn(() => ({ select })) };

    const module = await Test.createTestingModule({
      providers: [
        SedesRepository,
        { provide: SupabaseService, useValue: { getClient: () => client } },
      ],
    }).compile();

    await module.get(SedesRepository).findAll();

    expect(client.from).toHaveBeenCalledWith('sedes');
  });
});
