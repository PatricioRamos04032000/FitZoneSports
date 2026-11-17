import PDFDocument from 'pdfkit';

const ZONA_ARGENTINA = 'America/Argentina/Buenos_Aires';

export interface DatosBaseComprobante {
  pagoId: string;
  fechaPagoIso: string;
  monto: number;
  tokenPasarela: string | null;
  titularNombre: string;
  titularDni: string | null;
}

/**
 * Template Method (GoF) para emitir comprobantes PDF no fiscales (RF-14).
 * Fija encabezado, titular, monto y pie; cada subclase dibuja su detalle.
 */
export abstract class ComprobantePdfTemplate<T extends DatosBaseComprobante> {
  async generar(datos: T): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      this.dibujarEncabezado(doc, datos);
      this.dibujarTitular(doc, datos);
      this.dibujarSeccionDetalle(doc, datos);
      this.dibujarResumenPago(doc, datos);
      this.dibujarPie(doc);

      doc.end();
    });
  }

  protected abstract tituloDetalle(): string;

  protected abstract dibujarDetalle(doc: PDFKit.PDFDocument, datos: T): void;

  protected dibujarEncabezado(doc: PDFKit.PDFDocument, datos: T): void {
    doc
      .fontSize(20)
      .fillColor('#0f172a')
      .text('FitZone Sports', { align: 'left' });

    doc
      .fontSize(12)
      .fillColor('#0369a1')
      .text('Comprobante de pago', { align: 'left' });

    doc
      .fontSize(9)
      .fillColor('#64748b')
      .text('Documento interno no válido como factura fiscal');

    doc.moveDown(0.75);
    this.dibujarLinea(doc);
    doc.moveDown(0.75);

    doc.fontSize(10).fillColor('#0f172a');
    doc.text(`Comprobante N°: ${datos.pagoId}`);
    doc.text(`Fecha de emisión: ${this.formatearFechaHoraAr(datos.fechaPagoIso)}`);
    doc.text('Estado del pago: APROBADO');
    doc.moveDown(0.75);
  }

  protected dibujarTitular(doc: PDFKit.PDFDocument, datos: T): void {
    doc
      .fontSize(11)
      .fillColor('#0369a1')
      .text('Titular');
    doc.moveDown(0.25);

    doc.fontSize(10).fillColor('#0f172a');
    doc.text(`Socio: ${datos.titularNombre}`);
    if (datos.titularDni) {
      doc.text(`DNI: ${datos.titularDni}`);
    }
    doc.moveDown(0.75);
  }

  private dibujarSeccionDetalle(doc: PDFKit.PDFDocument, datos: T): void {
    doc
      .fontSize(11)
      .fillColor('#0369a1')
      .text(this.tituloDetalle());
    doc.moveDown(0.25);

    doc.fontSize(10).fillColor('#0f172a');
    this.dibujarDetalle(doc, datos);
    doc.moveDown(0.75);
  }

  protected dibujarResumenPago(doc: PDFKit.PDFDocument, datos: T): void {
    this.dibujarLinea(doc);
    doc.moveDown(0.75);

    doc
      .fontSize(13)
      .fillColor('#0f172a')
      .text(`Total abonado: ${this.formatearMonedaArs(datos.monto)}`);

    doc
      .fontSize(9)
      .fillColor('#475569')
      .text('Medio: Pasarela simulada FitZone');

    if (datos.tokenPasarela) {
      doc.text(`Referencia de operación: ${datos.tokenPasarela}`);
    }
    doc.moveDown(1.25);
  }

  protected dibujarPie(doc: PDFKit.PDFDocument): void {
    this.dibujarLinea(doc);
    doc.moveDown(0.5);
    doc
      .fontSize(8)
      .fillColor('#64748b')
      .text(
        'Comprobante emitido por FitZone Sports (RF-14). No almacena ni imprime datos de tarjeta (RNF-02).',
      );
  }

  protected dibujarLinea(doc: PDFKit.PDFDocument): void {
    const xInicio = doc.page.margins.left;
    const xFin = doc.page.width - doc.page.margins.right;
    const y = doc.y;
    doc
      .strokeColor('#cbd5e1')
      .lineWidth(1)
      .moveTo(xInicio, y)
      .lineTo(xFin, y)
      .stroke();
  }

  protected formatearMonedaArs(monto: number): string {
    return monto.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    });
  }

  protected formatearFechaHoraAr(iso: string): string {
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) {
      return iso;
    }
    return fecha.toLocaleString('es-AR', {
      timeZone: ZONA_ARGENTINA,
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
}
