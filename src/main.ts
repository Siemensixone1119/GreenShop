import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupApp } from './setup-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  await app.listen(process.env.PORT ?? 1119);
}
void bootstrap();
