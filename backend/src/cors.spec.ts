import { DEFAULT_CORS_ORIGIN, parseCorsOrigins } from './cors';

describe('parseCorsOrigins', () => {
  it('usa el origen de Vite si la variable no está definida', () => {
    expect(parseCorsOrigins(undefined)).toEqual([DEFAULT_CORS_ORIGIN]);
    expect(parseCorsOrigins('')).toEqual([DEFAULT_CORS_ORIGIN]);
  });

  it('separa por coma, recorta espacios y la barra final', () => {
    expect(
      parseCorsOrigins('https://fitzone.vercel.app/ , http://localhost:5173,'),
    ).toEqual(['https://fitzone.vercel.app', 'http://localhost:5173']);
  });
});
