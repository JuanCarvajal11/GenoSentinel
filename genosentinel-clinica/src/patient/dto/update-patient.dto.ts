import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';

/**
 * DTO para actualizar un paciente
 * Hereda todas las propiedades de CreatePatientDto pero las hace opcionales
 */
export class UpdatePatientDto extends PartialType(CreatePatientDto) {}