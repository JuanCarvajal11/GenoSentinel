import { ApiProperty } from '@nestjs/swagger';
import { Gender, PatientStatus, Patient } from '../entities/patient.entity';

/**
 * DTO para la respuesta al cliente con los datos del paciente
 * Define cómo se expondrán los datos al exterior
 */
export class PatientResponseDto {
  /**
   * Identificador único del paciente
   */
  @ApiProperty({
    description: 'Identificador único del paciente (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  /**
   * Nombre(s) del paciente
   */
  @ApiProperty({
    description: 'Nombre(s) del paciente',
    example: 'Juan Carlos',
  })
  firstName: string;

  /**
   * Apellido(s) del paciente
   */
  @ApiProperty({
    description: 'Apellido(s) del paciente',
    example: 'Pérez García',
  })
  lastName: string;

  /**
   * Fecha de nacimiento
   */
  @ApiProperty({
    description: 'Fecha de nacimiento del paciente',
    example: '1980-05-15',
  })
  birthDate: Date;

  /**
   * Género del paciente
   */
  @ApiProperty({
    description: 'Género del paciente',
    enum: Gender,
    example: Gender.MALE,
  })
  gender: Gender;

  /**
   * Estado actual del paciente
   */
  @ApiProperty({
    description: 'Estado actual del paciente',
    enum: PatientStatus,
    example: PatientStatus.ACTIVE,
  })
  status: PatientStatus;

  /**
   * Fecha de creación del registro
   */
  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  /**
   * Constructor que transforma una entidad Patient en PatientResponseDto
   * @param patient - Entidad del paciente
   */
  constructor(patient: Patient) {
    this.id = patient.id;
    this.firstName = patient.firstName;
    this.lastName = patient.lastName;
    this.birthDate = patient.birthDate;
    this.gender = patient.gender;
    this.status = patient.status;
    this.createdAt = patient.createdAt;
  }
}