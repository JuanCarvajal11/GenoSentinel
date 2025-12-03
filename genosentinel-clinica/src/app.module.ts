import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PatientModule } from './patient/patient.module';
import { TumorTypeModule } from './tumor-type/tumor-type.module';
import { ClinicalRecordModule } from './clinical-record/clinical-record.module';

// Módulo raíz: configura variables de entorno, BD y módulos funcionales
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a BD (configuración desde .env)
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '12345678',
      database: process.env.DB_DATABASE || 'genosentinel_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: true,
    }),

    PatientModule,
    TumorTypeModule,
    ClinicalRecordModule,
  ],
})
export class AppModule {}