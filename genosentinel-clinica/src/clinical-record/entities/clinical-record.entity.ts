import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { TumorType } from '../../tumor-type/entities/tumor-type.entity';

// Representa un diagnóstico y tratamiento de un tumor para un paciente
// Relación: Un paciente → Muchas historias clínicas
//           Un tipo de tumor → Muchas historias clínicas
@Entity('clinical_record')
export class ClinicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'char', length: 36 })
  patientId: string;

  @Column({ name: 'tumor_type_id', type: 'int' })
  tumorTypeId: number;

  @Column({ name: 'diagnosis_date', type: 'date' })
  diagnosisDate: Date;

  // Estadio TNM (opcional hasta que se confirme con pruebas)
  @Column({ type: 'varchar', length: 10, nullable: true })
  stage: string;

  // Plan de tratamiento (definido después del diagnóstico)
  @Column({ name: 'treatment_protocol', type: 'varchar', length: 255, nullable: true })
  treatmentProtocol: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relación con paciente (muchas historias → 1 paciente)
  @ManyToOne(() => Patient, (patient) => patient.clinicalRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // Relación con tipo de tumor (muchas historias → 1 tipo)
  @ManyToOne(() => TumorType, (tumorType) => tumorType.clinicalRecords, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tumor_type_id' })
  tumorType: TumorType;
}