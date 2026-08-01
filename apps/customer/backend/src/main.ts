import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix for API
  app.setGlobalPrefix('api');
  
  // Enable CORS for frontend
  app.enableCors();

  const port = process.env.PORT || 3001; // Running on 3001 for now to not clash with main server if started separately
  await app.listen(port, '0.0.0.0');
  
  Logger.log(`NestJS Boilerplate Application is running on: http://0.0.0.0:${port}/api`);
}

bootstrap();
