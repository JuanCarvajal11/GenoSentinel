import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ClinicalRecord } from '../../clinical-record/entities/clinical-record.entity';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'Otro',
}

export enum PatientStatus {
  ACTIVE = 'Activo',
  FOLLOW_UP = 'Seguimiento',
  INACTIVE = 'Inactivo',
}

// Representación de un paciente en la base de datos
@Entity('patient')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: PatientStatus,
    default: PatientStatus.ACTIVE,
  })
  status: PatientStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relación con historias clínicas
  @OneToMany(() => ClinicalRecord, (record) => record.patient)
  clinicalRecords: ClinicalRecord[];
}