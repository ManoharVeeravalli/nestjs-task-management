import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const port = 3000;

async function bootstrap() {
  const logger = new Logger(`bootstrap`);
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
