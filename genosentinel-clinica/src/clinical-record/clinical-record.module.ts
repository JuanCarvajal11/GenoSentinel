import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalRecord } from './entities/clinical-record.entity';
import { Patient } from '../patient/entities/patient.entity';
import { TumorType } from '../tumor-type/entities/tumor-type.entity';
import { ClinicalRecordService } from './clinical-record.service';
import { ClinicalRecordController } from './clinical-record.controller';

/**
 * Módulo que agrupa toda la funcionalidad relacionada con historias clínicas
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicalRecord, Patient, TumorType]), // Registra los repositorios necesarios
  ],
  controllers: [ClinicalRecordController], // Registra el controlador
  providers: [ClinicalRecordService], // Registra el servicio
  exports: [ClinicalRecordService], // Exporta el servicio para uso en otros módulos
})
export class ClinicalRecordModule {}