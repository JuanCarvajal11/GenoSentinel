import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { PatientService } from './service/patient.service';
import { PatientController } from './controller/patient.controller';

/**
 * Módulo que agrupa toda la funcionalidad relacionada con pacientes
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Patient]), // Registra el repositorio de Patient
  ],
  controllers: [PatientController], // Registra el controlador
  providers: [PatientService], // Registra el servicio
  exports: [PatientService], // Exporta el servicio para uso en otros módulos
})
export class PatientModule {}