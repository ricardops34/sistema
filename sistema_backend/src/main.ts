import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  
  app.enableCors(); // Necessário para o Angular consumir a API
  
  console.log('🚀 Servidor NestJS (Backend) iniciando na porta 3000...');
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
