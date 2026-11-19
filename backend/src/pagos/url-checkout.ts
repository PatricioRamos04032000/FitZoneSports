type HeaderPedido = string | string[] | undefined;

export type HeadersPedido = {
  host?: HeaderPedido;
  'x-forwarded-host'?: HeaderPedido;
  'x-forwarded-proto'?: HeaderPedido;
};

function primerValor(valor: HeaderPedido): string | undefined {
  const crudo = Array.isArray(valor) ? valor[0] : valor;
  const primero = crudo?.split(',')[0]?.trim();
  return primero || undefined;
}

export function hostLocal(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

/** Origen público que llegó al proceso (Render manda el host real en los headers). */
export function origenDelPedido(
  headers: HeadersPedido,
  protocol = 'http',
): string | null {
  const host = primerValor(headers['x-forwarded-host']) || primerValor(headers.host);
  if (!host || /[\s/]/.test(host)) {
    return null;
  }
  const proto = primerValor(headers['x-forwarded-proto']) || protocol;
  if (proto !== 'http' && proto !== 'https') {
    return null;
  }
  return `${proto}://${host}`;
}

/**
 * Si el pedido entró por un host público, esa es la base del checkout.
 * `APP_PUBLIC_URL=http://localhost:3000` en Render no pisa ese host.
 */
export function baseDeCheckout(
  appPublicUrl: string | undefined,
  origenPedido: string | null,
): string {
  const pedido = origenUtil(origenPedido);
  if (pedido && !hostLocal(pedido.hostname)) {
    return pedido.origin;
  }
  const configurada = origenUtil(appPublicUrl);
  if (configurada) {
    return configurada.origin;
  }
  return pedido?.origin ?? 'http://localhost:3000';
}

export function checkoutAlcanzable(
  checkoutUrl: string,
  headers: HeadersPedido,
  protocol?: string,
  appPublicUrl: string | undefined = process.env.APP_PUBLIC_URL,
): string {
  const base = baseDeCheckout(appPublicUrl, origenDelPedido(headers, protocol));
  const destino = new URL(checkoutUrl, `${base}/`);
  const baseUrl = new URL(base);
  if (hostLocal(destino.hostname) && !hostLocal(baseUrl.hostname)) {
    destino.protocol = baseUrl.protocol;
    destino.hostname = baseUrl.hostname;
    destino.port = baseUrl.port;
  }
  return destino.toString();
}

function origenUtil(valor: string | null | undefined): URL | null {
  const texto = valor?.trim();
  if (!texto) {
    return null;
  }
  try {
    return new URL(texto);
  } catch {
    return null;
  }
}
