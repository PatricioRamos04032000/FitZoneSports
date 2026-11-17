import {
  ComprobantePdfTemplate,
  DatosBaseComprobante,
} from './comprobante-pdf.template';

export interface DatosComprobanteMembresia extends DatosBaseComprobante {
  membresiaId: string | null;
  plan: string;
  vigenteDesde: string | null;
  vigenteHasta: string | null;
  estadoMembresia: string | null;
}

export class ComprobanteMembresiaPdf extends ComprobantePdfTemplate<DatosComprobanteMembresia> {
  protected tituloDetalle(): string {
    return 'Detalle de la membresía';
  }

  protected dibujarDetalle(
    doc: PDFKit.PDFDocument,
    datos: DatosComprobanteMembresia,
  ): void {
    if (datos.membresiaId) {
      doc.text(`Membresía N°: ${datos.membresiaId}`);
    }
    doc.text(`Plan contratado: ${this.capitalizar(datos.plan)}`);

    if (datos.vigenteDesde && datos.vigenteHasta) {
      doc.text(
        `Vigencia: ${this.formatearFechaCalendario(datos.vigenteDesde)} al ${this.formatearFechaCalendario(datos.vigenteHasta)}`,
      );
    }
    if (datos.estadoMembresia) {
      doc.text(`Estado: ${this.capitalizar(datos.estadoMembresia)}`);
    }
  }

  private capitalizar(valor: string): string {
    return valor ? valor.charAt(0).toUpperCase() + valor.slice(1) : valor;
  }

  private formatearFechaCalendario(fechaIso: string): string {
    const partes = fechaIso.split('-');
    if (partes.length !== 3) {
      return fechaIso;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
}
