import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalRecord } from './entities/clinical-record.entity';
import { Patient } from '../patient/entities/patient.entity';
import { TumorType } from '../tumor-type/entities/tumor-type.entity';
import { ClinicalRecordService } from './service/clinical-record.service';
import { ClinicalRecordController } from './controller/clinical-record.controller';

// Módulo para gestión de historias clínicas
@Module({
  imports: [TypeOrmModule.forFeature([ClinicalRecord, Patient, TumorType])],
  controllers: [ClinicalRecordController],
  providers: [ClinicalRecordService],
  exports: [ClinicalRecordService],
})
export class ClinicalRecordModule {}