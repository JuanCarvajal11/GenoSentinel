import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Inicializar aplicación con validación global y documentación Swagger
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('clinica');

  // Validar DTOs: rechaza propiedades no definidas y transforma tipos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar documentación Swagger
  const config = new DocumentBuilder()
    .setTitle('Microservicio de Gestión Clínica - GenoSentinel')
    .setDescription('Gestión de pacientes, tipos de tumor e historias clínicas')
    .setVersion('1.0')
    .addTag('patients', 'Operaciones con pacientes')
    .addTag('tumor-types', 'Operaciones con tipos de tumor')
    .addTag('clinical-records', 'Operaciones con historias clínicas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log('Aplicación corriendo en: http://localhost:3000');
  console.log('Documentación Swagger: http://localhost:3000/api/docs');
}

bootstrap();