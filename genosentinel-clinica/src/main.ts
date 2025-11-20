import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Función principal que inicializa la aplicación NestJS
 */
async function bootstrap() {
  // Crear instancia de la aplicación NestJS
  const app = await NestFactory.create(AppModule);

  // Configurar validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extras
      transform: true, // Transforma tipos automáticamente
    }),
  );

  // Configuración de Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Microservicio de Gestión Clínica - GenoSentinel')
    .setDescription('Microservicio para gestión de pacientes, tipos de tumor e historias clínicas')
    .setVersion('1.0')
    .addTag('patients', 'Operaciones relacionadas con pacientes')
    .addTag('tumor-types', 'Operaciones relacionadas con tipos de tumor')
    .addTag('clinical-records', 'Operaciones relacionadas con historias clínicas')
    .build();

  // Generar documento Swagger
  const document = SwaggerModule.createDocument(app, config);
  
  // Montar la UI de Swagger en la ruta /api/docs
  SwaggerModule.setup('api/docs', app, document);

  // Iniciar el servidor en el puerto 3000
  await app.listen(3000);
  console.log('Aplicación corriendo en: http://localhost:3000');
  console.log('Documentación Swagger: http://localhost:3000/api/docs');
}

// Ejecutar la función bootstrap
bootstrap();