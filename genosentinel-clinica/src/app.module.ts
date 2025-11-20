import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PatientModule } from './patient/patient.module';
import { TumorTypeModule } from './tumor-type/tumor-type.module';
import { ClinicalRecordModule } from './clinical-record/clinical-record.module';

/**
 * Módulo principal que configura la aplicación
 */
@Module({
  imports: [
    // Módulo de configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles globalmente
    }),

    // Configuración de TypeORM para conexión a la base de datos
    TypeOrmModule.forRoot({
      type: 'mysql', // Tipo de base de datos
      host: process.env.DB_HOST || 'localhost', // Host de la BD
      port: parseInt(process.env.DB_PORT ?? '3306'), // Puerto de la BD
      username: process.env.DB_USER || 'root', // Usuario de la BD
      password: process.env.DB_PASSWORD || '', // Contraseña de la BD
      database: process.env.DB_NAME || 'genosentinel_db', // Nombre de la BD
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Ubicación de las entidades
      synchronize: false, // NO sincronizar automáticamente en producción
      logging: true, // Habilitar logging de queries SQL
    }),

    // Módulos de funcionalidad
    PatientModule,
    TumorTypeModule,
    ClinicalRecordModule,
  ],
})
export class AppModule {}