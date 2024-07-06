import './utils/instrument';
import * as Sentry from '@sentry/nestjs';
import {
  NestFactory,
  BaseExceptionFilter,
  HttpAdapterHost,
} from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  Sentry.setupNestErrorHandler(app, new BaseExceptionFilter(httpAdapter));

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
