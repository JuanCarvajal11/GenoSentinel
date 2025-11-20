import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { Gender, PatientStatus } from '../entities/patient.entity';

/**
 * DTO (Data Transfer Object) para la creación de un paciente
 * Define la estructura y validaciones de los datos de entrada
 */
export class CreatePatientDto {
  /**
   * Nombre(s) del paciente
   */
  @ApiProperty({
    description: 'Nombre(s) del paciente',
    example: 'Juan Carlos',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  firstName: string;

  /**
   * Apellido(s) del paciente
   */
  @ApiProperty({
    description: 'Apellido(s) del paciente',
    example: 'Pérez García',
    maxLength: 100,
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  lastName: string;

  /**
   * Fecha de nacimiento en formato ISO (YYYY-MM-DD)
   */
  @ApiProperty({
    description: 'Fecha de nacimiento del paciente',
    example: '1980-05-15',
    type: String,
  })
  @IsDateString({}, { message: 'La fecha debe estar en formato válido (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  birthDate: string;

  /**
   * Género del paciente
   */
  @ApiProperty({
    description: 'Género del paciente',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender, { message: 'El género debe ser M, F u Otro' })
  @IsNotEmpty({ message: 'El género es obligatorio' })
  gender: Gender;

  /**
   * Estado del paciente (opcional, por defecto será 'Activo')
   */
  @ApiProperty({
    description: 'Estado del paciente',
    enum: PatientStatus,
    example: PatientStatus.ACTIVE,
    required: false,
  })
  @IsEnum(PatientStatus, { message: 'El estado debe ser Activo, Seguimiento o Inactivo' })
  status?: PatientStatus;
}