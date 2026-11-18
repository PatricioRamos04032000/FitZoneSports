import { Test } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { ReportesResumenRepository } from './reportes-resumen.repository';

describe('ReportesResumenRepository', () => {
  it('lee la vista reporte_resumen_sede ordenada por nombre', async () => {
    const order = jest.fn().mockResolvedValue({ data: [], error: null });
    const select = jest.fn(() => ({ order }));
    const client = { from: jest.fn(() => ({ select })) };

    const module = await Test.createTestingModule({
      providers: [
        ReportesResumenRepository,
        { provide: SupabaseService, useValue: { getClient: () => client } },
      ],
    }).compile();

    await module.get(ReportesResumenRepository).listar();

    expect(client.from).toHaveBeenCalledWith('reporte_resumen_sede');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('nombre');
  });
});
