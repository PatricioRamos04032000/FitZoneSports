import { INestApplication } from '@nestjs/common';

export const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';

/** `CORS_ORIGIN` admite varios orígenes separados por coma. */
export function parseCorsOrigins(value: string | undefined): string[] {
  return (value || DEFAULT_CORS_ORIGIN)
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export function setupCors(app: INestApplication): void {
  app.enableCors({ origin: parseCorsOrigins(process.env.CORS_ORIGIN) });
}
