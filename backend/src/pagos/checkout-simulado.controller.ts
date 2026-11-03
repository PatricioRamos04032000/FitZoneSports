import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Redirect,
  forwardRef,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { ReservasCanchaService } from '../canchas/reservas/reservas-cancha.service';
import { PagosRepository } from './pagos.repository';
import {
  PASARELA_PAGO,
  TARJETA_PRUEBA_FAIL,
  TARJETA_PRUEBA_OK,
  type PasarelaPago,
} from './pasarela-pago';

/**
 * Checkout HTML público (estilo MercadoPago). Sin JWT de FitZone.
 * No persiste PAN/CVV (RNF-02).
 */
@ApiExcludeController()
@Controller('pasarela-simulada')
export class CheckoutSimuladoController {
  constructor(
    private readonly pagos: PagosRepository,
    @Inject(PASARELA_PAGO) private readonly pasarela: PasarelaPago,
    @Inject(forwardRef(() => ReservasCanchaService))
    private readonly reservas: ReservasCanchaService,
  ) {}

  @Get('checkout/:pagoId')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async checkout(@Param('pagoId') pagoId: string): Promise<string> {
    const pago = await this.pagos.findById(pagoId);
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }
    if (pago.estado !== 'pendiente') {
      const dest =
        pago.estado === 'aprobado'
          ? `/pasarela-simulada/resultado/success?reservaId=${pago.reserva_cancha_id ?? ''}`
          : `/pasarela-simulada/resultado/failure?reservaId=${pago.reserva_cancha_id ?? ''}`;
      return this.htmlRedirect(dest);
    }

    return this.htmlCheckout(pago.id, Number(pago.monto), pago.concepto);
  }

  @Post('checkout/:pagoId')
  @HttpCode(302)
  @Redirect()
  async pagar(
    @Param('pagoId') pagoId: string,
    @Body()
    body: {
      numero?: string;
      nombre?: string;
      vencimiento?: string;
      cvv?: string;
    },
  ) {
    // nombre/vencimiento/cvv solo validan presencia en el form; no se persisten ni loguean.
    void body.nombre;
    void body.vencimiento;
    void body.cvv;

    const pago = await this.pagos.findById(pagoId);
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }
    if (pago.estado !== 'pendiente') {
      throw new BadRequestException('El pago ya fue procesado');
    }
    if (!pago.reserva_cancha_id) {
      throw new BadRequestException('Pago sin reserva vinculada');
    }

    const numero = (body.numero ?? '').replace(/\s+/g, '');
    const aprobado = numero === TARJETA_PRUEBA_OK;

    await this.pasarela.confirmarPago(pagoId, {
      aprobado,
      token: aprobado ? `sim-${randomUUID()}` : undefined,
      motivo: aprobado
        ? undefined
        : numero === TARJETA_PRUEBA_FAIL
          ? 'Tarjeta de prueba rechazada'
          : 'Usá las tarjetas de prueba documentadas (4111… aprueba, 4000… rechaza)',
    });

    await this.reservas.aplicarResultadoPago(pago.reserva_cancha_id, aprobado);

    return {
      url: aprobado
        ? `/pasarela-simulada/resultado/success?reservaId=${pago.reserva_cancha_id}`
        : `/pasarela-simulada/resultado/failure?reservaId=${pago.reserva_cancha_id}`,
      statusCode: 302,
    };
  }

  @Get('resultado/success')
  @Header('Content-Type', 'text/html; charset=utf-8')
  success(@Query('reservaId') _reservaId?: string): string {
    return this.htmlResultado(true);
  }

  @Get('resultado/failure')
  @Header('Content-Type', 'text/html; charset=utf-8')
  failure(@Query('reservaId') _reservaId?: string): string {
    return this.htmlResultado(false);
  }

  private htmlCheckout(pagoId: string, monto: number, concepto: string): string {
    const montoFmt = monto.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pasarela FitZone — simulada</title>
  <style>
    :root { font-family: system-ui, sans-serif; color: #0f172a; background: #e2e8f0; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; }
    .card { background: #fff; width: min(420px, 92vw); padding: 1.75rem; border-radius: 12px;
      box-shadow: 0 12px 40px rgba(15,23,42,.12); }
    h1 { font-size: 1.15rem; margin: 0 0 .25rem; color: #0369a1; }
    .brand { font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: #64748b; }
    .monto { font-size: 1.75rem; font-weight: 700; margin: 1rem 0; }
    label { display: block; font-size: .8rem; margin: .65rem 0 .25rem; color: #475569; }
    input { width: 100%; box-sizing: border-box; padding: .55rem .65rem; border: 1px solid #cbd5e1;
      border-radius: 8px; font-size: 1rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    button { margin-top: 1.25rem; width: 100%; padding: .75rem; border: 0; border-radius: 8px;
      background: #0284c7; color: #fff; font-weight: 600; font-size: 1rem; cursor: pointer; }
    button:hover { background: #0369a1; }
    .hint { margin-top: 1rem; font-size: .75rem; color: #64748b; line-height: 1.4; }
    code { background: #f1f5f9; padding: .1rem .3rem; border-radius: 4px; }
  </style>
</head>
<body>
  <form class="card" method="post" action="/pasarela-simulada/checkout/${pagoId}" autocomplete="off">
    <div class="brand">Pasarela FitZone — simulada</div>
    <h1>Checkout de pago</h1>
    <p style="margin:0;color:#64748b;font-size:.9rem">${concepto.replace(/_/g, ' ')}</p>
    <div class="monto">${montoFmt}</div>
    <label for="numero">Número de tarjeta</label>
    <input id="numero" name="numero" inputmode="numeric" placeholder="4111 1111 1111 1111" required />
    <label for="nombre">Nombre en la tarjeta</label>
    <input id="nombre" name="nombre" placeholder="Como figura en la tarjeta" required />
    <div class="row">
      <div>
        <label for="vencimiento">Vencimiento</label>
        <input id="vencimiento" name="vencimiento" placeholder="MM/AA" required />
      </div>
      <div>
        <label for="cvv">CVV</label>
        <input id="cvv" name="cvv" inputmode="numeric" placeholder="123" required />
      </div>
    </div>
    <button type="submit">Pagar</button>
    <p class="hint">
      Demo: <code>${TARJETA_PRUEBA_OK}</code> aprueba;
      <code>${TARJETA_PRUEBA_FAIL}</code> rechaza.
      Los datos de tarjeta <strong>no se guardan</strong> (RNF-02).
    </p>
  </form>
</body>
</html>`;
  }

  private htmlResultado(ok: boolean): string {
    const titulo = ok ? 'Pago aprobado' : 'Pago rechazado';
    const color = ok ? '#15803d' : '#b91c1c';
    const msg = ok
      ? 'Tu reserva quedó confirmada. Ya podés cerrar esta ventana y volver a FitZone.'
      : 'No se confirmó la reserva. Podés reintentar el pago desde FitZone si el hold sigue vigente.';
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${titulo} — Pasarela FitZone</title>
  <style>
    body { margin:0; min-height:100vh; display:grid; place-items:center;
      font-family:system-ui,sans-serif; background:#e2e8f0; color:#0f172a; }
    .card { background:#fff; padding:2rem; border-radius:12px; width:min(420px,92vw);
      box-shadow:0 12px 40px rgba(15,23,42,.12); text-align:center; }
    h1 { color:${color}; font-size:1.35rem; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:#64748b">
      Pasarela FitZone — simulada
    </div>
    <h1>${titulo}</h1>
    <p>${msg}</p>
  </div>
</body>
</html>`;
  }

  private htmlRedirect(path: string): string {
    return `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${path}" /></head>
<body>Redirigiendo…</body></html>`;
  }
}
