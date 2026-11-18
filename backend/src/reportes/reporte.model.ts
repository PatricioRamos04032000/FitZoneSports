/** Fila de la vista `reporte_resumen_sede`. No es una entidad de reserva. */
export interface FilaReporteSede {
  id: string;
  nombre: string;
  activa: boolean;
  aforo_max: number;
  ocupacion: number;
  reservas_del_dia: number;
  clases_del_dia: number;
  fecha: string;
}
