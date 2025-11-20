import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateClinicalRecordDto } from './create-clinical-record.dto';

/**
 * DTO para actualizar una historia clínica
 * Omite los campos patientId y tumorTypeId ya que no deberían modificarse
 */
export class UpdateClinicalRecordDto extends PartialType(
  OmitType(CreateClinicalRecordDto, ['patientId', 'tumorTypeId'] as const),
) {}