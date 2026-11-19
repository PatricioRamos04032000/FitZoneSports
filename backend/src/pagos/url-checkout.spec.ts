import { baseDeCheckout, checkoutAlcanzable, origenDelPedido } from './url-checkout';

describe('url de checkout', () => {
  it('en Render usa el host reenviado aunque APP_PUBLIC_URL sea localhost', () => {
    const headers = {
      host: 'fitzonesports-gnoi.onrender.com',
      'x-forwarded-proto': 'https',
    };

    expect(origenDelPedido(headers)).toBe(
      'https://fitzonesports-gnoi.onrender.com',
    );
    expect(
      checkoutAlcanzable(
        'http://localhost:3000/pasarela-simulada/checkout/pago-1',
        headers,
        'http',
        'http://localhost:3000',
      ),
    ).toBe('https://fitzonesports-gnoi.onrender.com/pasarela-simulada/checkout/pago-1');
  });

  it('en local conserva localhost', () => {
    const headers = { host: 'localhost:3000' };

    expect(baseDeCheckout('http://localhost:3000', origenDelPedido(headers))).toBe(
      'http://localhost:3000',
    );
    expect(
      checkoutAlcanzable(
        'http://localhost:3000/pasarela-simulada/checkout/pago-1',
        headers,
        'http',
        'http://localhost:3000',
      ),
    ).toBe('http://localhost:3000/pasarela-simulada/checkout/pago-1');
  });
});
