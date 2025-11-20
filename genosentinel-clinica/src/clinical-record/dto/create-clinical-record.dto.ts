import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  IsDateString,
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

/**
 * DTO para la creación de una historia clínica
 */
export class CreateClinicalRecordDto {
  /**
   * UUID del paciente
   */
  @ApiProperty({
    description: 'UUID del paciente al que pertenece esta historia clínica',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  patientId: string;

  /**
   * ID del tipo de tumor
   */
  @ApiProperty({
    description: 'ID del tipo de tumor diagnosticado',
    example: 1,
  })
  @IsInt({ message: 'El ID del tipo de tumor debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del tipo de tumor es obligatorio' })
  tumorTypeId: number;

  /**
   * Fecha del diagnóstico en formato ISO (YYYY-MM-DD)
   */
  @ApiProperty({
    description: 'Fecha del diagnóstico',
    example: '2024-01-15',
    type: String,
  })
  @IsDateString({}, { message: 'La fecha de diagnóstico debe estar en formato válido (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de diagnóstico es obligatoria' })
  diagnosisDate: string;

  /**
   * Estadio del tumor (opcional)
   */
  @ApiProperty({
    description: 'Estadio del tumor',
    example: 'III',
    maxLength: 10,
    required: false,
  })
  @IsString({ message: 'El estadio debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(10, { message: 'El estadio no puede exceder 10 caracteres' })
  stage?: string;

  /**
   * Protocolo de tratamiento (opcional)
   */
  @ApiProperty({
    description: 'Protocolo de tratamiento aplicado',
    example: 'Quimioterapia FOLFOX + Radioterapia',
    maxLength: 255,
    required: false,
  })
  @IsString({ message: 'El protocolo de tratamiento debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(255, { message: 'El protocolo de tratamiento no puede exceder 255 caracteres' })
  treatmentProtocol?: string;
}