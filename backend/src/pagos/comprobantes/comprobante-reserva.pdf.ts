import {
  ComprobantePdfTemplate,
  DatosBaseComprobante,
} from './comprobante-pdf.template';

const ZONA_ARGENTINA = 'America/Argentina/Buenos_Aires';

export interface DatosComprobanteReserva extends DatosBaseComprobante {
  reservaId: string;
  sedeNombre: string;
  sedeDireccion: string | null;
  canchaNombre: string;
  canchaTipo: string;
  inicioIso: string;
  finIso: string;
  precioBase: number | null;
  reglasAplicadas: string[];
}

export class ComprobanteReservaPdf extends ComprobantePdfTemplate<DatosComprobanteReserva> {
  protected tituloDetalle(): string {
    return 'Detalle de la reserva';
  }

  protected dibujarDetalle(
    doc: PDFKit.PDFDocument,
    datos: DatosComprobanteReserva,
  ): void {
    doc.text(`Reserva N°: ${datos.reservaId}`);
    doc.text(
      `Sede: ${datos.sedeNombre}${datos.sedeDireccion ? ` (${datos.sedeDireccion})` : ''}`,
    );
    doc.text(`Cancha: ${datos.canchaNombre} (${datos.canchaTipo})`);
    doc.text(`Fecha: ${this.formatearFechaAr(datos.inicioIso)}`);
    doc.text(
      `Horario: ${this.formatearHoraAr(datos.inicioIso)} a ${this.formatearHoraAr(datos.finIso)} hs`,
    );

    if (datos.precioBase !== null) {
      doc.text(`Tarifa base: ${this.formatearMonedaArs(datos.precioBase)}`);
    }
    if (datos.reglasAplicadas.length > 0) {
      doc.text(`Reglas aplicadas: ${datos.reglasAplicadas.join(', ')}`);
    }
  }

  private formatearFechaAr(iso: string): string {
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) {
      return iso;
    }
    return fecha.toLocaleDateString('es-AR', {
      timeZone: ZONA_ARGENTINA,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  private formatearHoraAr(iso: string): string {
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) {
      return iso;
    }
    return fecha.toLocaleTimeString('es-AR', {
      timeZone: ZONA_ARGENTINA,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
  }
}
