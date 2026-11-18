import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import { FilaReporteSede } from './reporte.model';

/**
 * Puerto de lectura del dashboard. Lee la vista `reporte_resumen_sede`.
 * No usa ReservasCanchaRepository, ClasesRepository ni AccesoRepository.
 */
@Injectable()
export class ReportesResumenRepository extends SupabaseRepository<FilaReporteSede> {
  protected readonly table = 'reporte_resumen_sede';

  async listar(): Promise<FilaReporteSede[]> {
    return this.unwrap<FilaReporteSede[]>(
      await this.from().select('*').order('nombre'),
      'listar',
    );
  }
}
