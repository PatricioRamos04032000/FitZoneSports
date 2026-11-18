import { Injectable } from '@nestjs/common';
import { ResumenCadenaDto, ResumenReporteDto, ResumenSedeDto } from './reporte.dto';
import { FilaReporteSede } from './reporte.model';
import { ReportesResumenRepository } from './reportes-resumen.repository';

const ZONA = 'America/Argentina/Buenos_Aires';

@Injectable()
export class ReportesService {
  constructor(private readonly reportes: ReportesResumenRepository) {}

  async resumen(): Promise<ResumenReporteDto> {
    const filas = await this.reportes.listar();
    const sedes = filas.map((fila) => this.aSede(fila));
    return {
      fecha: filas[0] ? this.fechaDe(filas[0].fecha) : this.fechaSinSedes(),
      sedes,
      cadena: this.sumar(sedes),
    };
  }

  private aSede(fila: FilaReporteSede): ResumenSedeDto {
    return {
      id: fila.id,
      nombre: fila.nombre,
      activa: fila.activa,
      aforo_max: this.entero(fila.aforo_max),
      ocupacion: this.entero(fila.ocupacion),
      reservas_del_dia: this.entero(fila.reservas_del_dia),
      clases_del_dia: this.entero(fila.clases_del_dia),
    };
  }

  private sumar(sedes: ResumenSedeDto[]): ResumenCadenaDto {
    return sedes.reduce<ResumenCadenaDto>(
      (total, sede) => ({
        ocupacion: total.ocupacion + sede.ocupacion,
        aforo_max: total.aforo_max + sede.aforo_max,
        reservas_del_dia: total.reservas_del_dia + sede.reservas_del_dia,
        clases_del_dia: total.clases_del_dia + sede.clases_del_dia,
      }),
      { ocupacion: 0, aforo_max: 0, reservas_del_dia: 0, clases_del_dia: 0 },
    );
  }

  private entero(valor: unknown): number {
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
  }

  private fechaDe(valor: unknown): string {
    if (typeof valor === 'string' && valor.length >= 10) {
      return valor.slice(0, 10);
    }
    return this.fechaSinSedes();
  }

  /** Solo si la vista no devolvió filas: no hay sede de la que copiar el día. */
  private fechaSinSedes(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date());
  }
}
