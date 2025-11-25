import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalRecord } from '../entities/clinical-record.entity';
import { CreateClinicalRecordDto } from '../dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from '../dto/update-clinical-record.dto';
import { ClinicalRecordResponseDto } from '../dto/clinical-record-response.dto';
import { Patient } from '../../patient/entities/patient.entity';
import { TumorType } from '../../tumor-type/entities/tumor-type.entity';

// Lógica de negocio para gestión de historias clínicas
@Injectable()
export class ClinicalRecordService {
  // Inyectar 3 repositorios: validar referencias cruzadas (patient, tumorType)
  constructor(
    @InjectRepository(ClinicalRecord)
    private readonly clinicalRecordRepository: Repository<ClinicalRecord>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(TumorType)
    private readonly tumorTypeRepository: Repository<TumorType>,
  ) {}

  async create(
    createClinicalRecordDto: CreateClinicalRecordDto,
  ): Promise<ClinicalRecordResponseDto> {
    // Validar que paciente y tipo de tumor existen
    const patient = await this.patientRepository.findOne({
      where: { id: createClinicalRecordDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException(
        `Paciente con ID ${createClinicalRecordDto.patientId} no encontrado`,
      );
    }

    const tumorType = await this.tumorTypeRepository.findOne({
      where: { id: createClinicalRecordDto.tumorTypeId },
    });

    if (!tumorType) {
      throw new NotFoundException(
        `Tipo de tumor con ID ${createClinicalRecordDto.tumorTypeId} no encontrado`,
      );
    }

    const clinicalRecord = this.clinicalRecordRepository.create(createClinicalRecordDto);
    const savedRecord = await this.clinicalRecordRepository.save(clinicalRecord);

    // Cargar relaciones para evitar queries N+1
    const recordWithRelations = await this.clinicalRecordRepository.findOne({
      where: { id: savedRecord.id },
      relations: ['patient', 'tumorType'],
    });

    if (!recordWithRelations) {
      throw new NotFoundException(
        `Historia clínica con ID ${savedRecord.id} no encontrada`,
      );
    }

    return new ClinicalRecordResponseDto(recordWithRelations);
  }

  async findAll(): Promise<ClinicalRecordResponseDto[]> {
    const clinicalRecords = await this.clinicalRecordRepository.find({
      relations: ['patient', 'tumorType'],
      order: { createdAt: 'DESC' },
    });
    return clinicalRecords.map(record => new ClinicalRecordResponseDto(record));
  }

  async findOne(id: string): Promise<ClinicalRecordResponseDto> {
    const clinicalRecord = await this.clinicalRecordRepository.findOne({
      where: { id },
      relations: ['patient', 'tumorType'],
    });

    if (!clinicalRecord) {
      throw new NotFoundException(
        `Historia clínica con ID ${id} no encontrada`,
      );
    }

    return new ClinicalRecordResponseDto(clinicalRecord);
  }

  async findByPatient(patientId: string): Promise<ClinicalRecordResponseDto[]> {
    // Validar que el paciente existe
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(
        `Paciente con ID ${patientId} no encontrado`,
      );
    }

    const clinicalRecords = await this.clinicalRecordRepository.find({
      where: { patientId },
      relations: ['tumorType'],
      order: { diagnosisDate: 'DESC' },
    });

    return clinicalRecords.map(record => new ClinicalRecordResponseDto(record));
  }

  // TODO: Auditar cambios (quién, cuándo, qué cambió)
  async update(
    id: string,
    updateClinicalRecordDto: UpdateClinicalRecordDto,
  ): Promise<ClinicalRecordResponseDto> {
    const clinicalRecord = await this.clinicalRecordRepository.findOne({
      where: { id },
    });

    if (!clinicalRecord) {
      throw new NotFoundException(
        `Historia clínica con ID ${id} no encontrada`,
      );
    }

    Object.assign(clinicalRecord, updateClinicalRecordDto);
    const updatedRecord = await this.clinicalRecordRepository.save(clinicalRecord);

    const recordWithRelations = await this.clinicalRecordRepository.findOne({
      where: { id: updatedRecord.id },
      relations: ['patient', 'tumorType'],
    });

    if (!recordWithRelations) {
      throw new NotFoundException(
        `Historia clínica con ID ${updatedRecord.id} no encontrada`,
      );
    }

    return new ClinicalRecordResponseDto(recordWithRelations);
  }

  // TODO: Cambiar a soft delete con columna deletedAt (requiere auditoría legal)
  async remove(id: string): Promise<void> {
    const clinicalRecord = await this.clinicalRecordRepository.findOne({
      where: { id },
    });

    if (!clinicalRecord) {
      throw new NotFoundException(
        `Historia clínica con ID ${id} no encontrada`,
      );
    }

    await this.clinicalRecordRepository.remove(clinicalRecord);
  }
}