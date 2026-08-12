import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Manejo global para serialización de BigInt en respuestas JSON
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validaciones globales estrictas DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de CORS habilitada para producción (Vercel)
  app.enableCors({
  origin: [
    'https://controlafront.vercel.app', // Tu dominio exacto de Vercel
    'http://localhost:5173',            // Para desarrollo local con Vite
    'http://localhost:3000',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
  allowedHeaders: 'Content-Type, Accept, Authorization',
});

  // Configuración de Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('ControlaBack API - Gestión Residencial')
    .setDescription('Documentación de la API para gestión de edificios, departamentos, contratos y cobros')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Puerto dinámico asignado por Railway o fallback a 3000 local
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`ControlaBack API ejecutándose en el puerto ${port}`);
  console.log(`Documentación Swagger disponible en: http://localhost:${port}/api`);
}
bootstrap();