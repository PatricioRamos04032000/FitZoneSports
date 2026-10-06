import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupCors } from './cors';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupCors(app);
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
