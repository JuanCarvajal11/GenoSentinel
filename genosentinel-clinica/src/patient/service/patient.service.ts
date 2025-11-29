import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient, PatientStatus } from '../entities/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { PatientResponseDto } from '../dto/patient-response.dto';

// Lógica de negocio para gestión de pacientes
@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    const patient = this.patientRepository.create(createPatientDto);
    const savedPatient = await this.patientRepository.save(patient);
    return new PatientResponseDto(savedPatient);
  }

  async findAll(): Promise<PatientResponseDto[]> {
    // TODO: Agregar paginación, búsqueda y filtros
    const patients = await this.patientRepository.find({
      order: { createdAt: 'DESC' },
    });
    return patients.map(patient => new PatientResponseDto(patient));
  }

  async findOne(id: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['clinicalRecords'],
    });

    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    return new PatientResponseDto(patient);
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    
    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    Object.assign(patient, updatePatientDto);
    const updatedPatient = await this.patientRepository.save(patient);
    return new PatientResponseDto(updatedPatient);
  }

  // Soft delete: cambiar estado a Inactivo (requerimiento legal)
  async deactivate(id: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    
    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    patient.status = PatientStatus.INACTIVE;
    const deactivatedPatient = await this.patientRepository.save(patient);
    return new PatientResponseDto(deactivatedPatient);
  }
}