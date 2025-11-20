import { ApiProperty } from '@nestjs/swagger';
import { ClinicalRecord } from '../entities/clinical-record.entity';
import { PatientResponseDto } from '../../patient/dto/patient-response.dto';
import { TumorTypeResponseDto } from '../../tumor-type/dto/tumor-type-response.dto';

/**
 * DTO para la respuesta al cliente con los datos de la historia clínica
 */
export class ClinicalRecordResponseDto {
  /**
   * Identificador único de la historia clínica
   */
  @ApiProperty({
    description: 'Identificador único de la historia clínica (UUID)',
    example: '660f9500-f39c-51e5-b827-557766550111',
  })
  id: string;

  /**
   * UUID del paciente
   */
  @ApiProperty({
    description: 'UUID del paciente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  patientId: string;

  /**
   * ID del tipo de tumor
   */
  @ApiProperty({
    description: 'ID del tipo de tumor',
    example: 1,
  })
  tumorTypeId: number;

  /**
   * Fecha del diagnóstico
   */
  @ApiProperty({
    description: 'Fecha del diagnóstico',
    example: '2024-01-15',
  })
  diagnosisDate: Date;

  /**
   * Estadio del tumor
   */
  @ApiProperty({
    description: 'Estadio del tumor',
    example: 'III',
    nullable: true,
  })
  stage: string | null;

  /**
   * Protocolo de tratamiento
   */
  @ApiProperty({
    description: 'Protocolo de tratamiento aplicado',
    example: 'Quimioterapia FOLFOX + Radioterapia',
    nullable: true,
  })
  treatmentProtocol: string | null;

  /**
   * Fecha de creación del registro
   */
  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  /**
   * Información del paciente (opcional, cuando se incluyen relaciones)
   */
  @ApiProperty({
    description: 'Información del paciente',
    type: () => PatientResponseDto,
    required: false,
  })
  patient?: PatientResponseDto;

  /**
   * Información del tipo de tumor (opcional, cuando se incluyen relaciones)
   */
  @ApiProperty({
    description: 'Información del tipo de tumor',
    type: () => TumorTypeResponseDto,
    required: false,
  })
  tumorType?: TumorTypeResponseDto;

  /**
   * Constructor que transforma una entidad ClinicalRecord en ClinicalRecordResponseDto
   * @param clinicalRecord - Entidad de la historia clínica
   */
  constructor(clinicalRecord: ClinicalRecord) {
    this.id = clinicalRecord.id;
    this.patientId = clinicalRecord.patientId;
    this.tumorTypeId = clinicalRecord.tumorTypeId;
    this.diagnosisDate = clinicalRecord.diagnosisDate;
    this.stage = clinicalRecord.stage;
    this.treatmentProtocol = clinicalRecord.treatmentProtocol;
    this.createdAt = clinicalRecord.createdAt;

    // Incluir información del paciente si está cargada
    if (clinicalRecord.patient) {
      this.patient = new PatientResponseDto(clinicalRecord.patient);
    }

    // Incluir información del tipo de tumor si está cargada
    if (clinicalRecord.tumorType) {
      this.tumorType = new TumorTypeResponseDto(clinicalRecord.tumorType);
    }
  }
}