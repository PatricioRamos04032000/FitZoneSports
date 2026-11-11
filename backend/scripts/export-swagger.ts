/**
 * Exporta la especificación OpenAPI del backend a backend/swagger.json (C-09).
 * No requiere conexión a Supabase ni levantar el servidor HTTP.
 *
 * Uso: npm run swagger:export  (desde backend/)
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { createSwaggerDocument } from '../src/swagger';

process.env.SUPABASE_URL ??= 'http://127.0.0.1:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'swagger-export-service-role-key';
process.env.SUPABASE_ANON_KEY ??= 'swagger-export-anon-key';

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = createSwaggerDocument(app);
  const outputPath = resolve(__dirname, '../swagger.json');

  writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  await app.close();

  console.log(`Especificación OpenAPI exportada en ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
