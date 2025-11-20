import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalRecord } from './entities/clinical-record.entity';
import { CreateClinicalRecordDto } from './dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from './dto/update-clinical-record.dto';
import { ClinicalRecordResponseDto } from './dto/clinical-record-response.dto';
import { Patient } from '../patient/entities/patient.entity';
import { TumorType } from '../tumor-type/entities/tumor-type.entity';

/**
 * Servicio ClinicalRecordService - Lógica de negocio para historias clínicas
 * 
 * ¿QUÉ HACE?
 * Maneja CRUD de historias clínicas (diagnósticos y tratamientos oncológicos)
 * 
 * DIFERENCIA CON OTROS SERVICIOS:
 * - Inyecta 3 repositorios (Clinical, Patient, TumorType)
 * - Valida referencias cruzadas (paciente existe, tumor existe)
 * - Carga relaciones en respuestas (para evitar queries N+1)
 * 
 * ¿POR QUÉ 3 repositorios?
 * ClinicalRecord depende de Patient y TumorType
 * No puedes crear historia sin paciente o sin tipo de tumor
 * Los inyectamos para validar integridad
 */
@Injectable()
export class ClinicalRecordService {
    /**
     * Constructor con inyección múltiple de dependencias
     * 
     * ¿MÚLTIPLES REPOSITORIOS?
     * En entidades complejas que relacionan varias tablas,
     * inyectamos repositorios de todas las que necesitamos validar
     * 
     * Alternativa: Podría usar @InjectRepository solo ClinicalRecord
     * y hacer eager loading, pero explícito es mejor que implícito
     */
    constructor(
        /**
         * @InjectRepository(ClinicalRecord)
         * 
         * DECORADOR: Inyecta Repository para ClinicalRecord
         * Usaremos este para operaciones CRUD principales
         */
        @InjectRepository(ClinicalRecord)
        private readonly clinicalRecordRepository: Repository<ClinicalRecord>,
        /**
         * @InjectRepository(Patient)
         * 
         * DECORADOR: Inyecta Repository para Patient
         * Usaremos para VALIDAR que paciente existe antes de crear historia
         * No para modificar pacientes, solo para validar
         */
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        /**
         * @InjectRepository(TumorType)
         * 
         * DECORADOR: Inyecta Repository para TumorType
         * Usaremos para VALIDAR que tipo de tumor existe antes de crear historia
         */
        @InjectRepository(TumorType)
        private readonly tumorTypeRepository: Repository<TumorType>,
    ) {}

    /**
     * CREATE - Crea una nueva historia clínica
     * 
     * @param createClinicalRecordDto - DTO validado con datos de la historia
     * @returns Promise<ClinicalRecordResponseDto> - Historia creada con relaciones
     * @throws NotFoundException si paciente o tumor no existen
     * 
     * FLUJO DE NEGOCIO:
     * 1. Validar que paciente existe (if no → 404)
     * 2. Validar que tipo de tumor existe (if no → 404)
     * 3. Crear record
     * 4. Cargar relaciones (patient, tumorType)
     * 5. Retornar como DTO
     * 
     * ¿POR QUÉ validamos primero?
     * - Database debería validar con FOREIGN KEYS
     * - Pero es mejor fallar rápido con 404
     * - Mensajes de error claros para API clients
     */
    async create(
        createClinicalRecordDto: CreateClinicalRecordDto,
    ): Promise<ClinicalRecordResponseDto> {
        // PASO 1: Validar que el paciente existe
        // Si patient es undefined → lanzar excepción
        const patient = await this.patientRepository.findOne({
            where: { id: createClinicalRecordDto.patientId },
        });

        if (!patient) {
            // NotFoundException → HTTP 404
            throw new NotFoundException(
                `Paciente con ID ${createClinicalRecordDto.patientId} no encontrado`,
            );
        }

        // PASO 2: Validar que el tipo de tumor existe
        const tumorType = await this.tumorTypeRepository.findOne({
            where: { id: createClinicalRecordDto.tumorTypeId },
        });

        if (!tumorType) {
            throw new NotFoundException(
                `Tipo de tumor con ID ${createClinicalRecordDto.tumorTypeId} no encontrado`,
            );
        }

        // PASO 3: Crear instancia en memoria
        // .create() asigna propiedades del DTO a la entidad
        const clinicalRecord = this.clinicalRecordRepository.create(createClinicalRecordDto);

        // PASO 4: Guardar en BD
        // .save() INSERTA el record y retorna con ID generado
        const savedRecord = await this.clinicalRecordRepository.save(clinicalRecord);

        // PASO 5: Cargar relaciones
        // Después de guardar, cargamos el record completo con relaciones
        // Esto evita queries N+1 (un query para record, otro para patient, otro para tumor)
        // Con relations: ['patient', 'tumorType'], obtenemos todo en un query con JOINs
        const recordWithRelations = await this.clinicalRecordRepository.findOne({
            where: { id: savedRecord.id },
            relations: ['patient', 'tumorType'],
        });

        if (!recordWithRelations) {
            throw new NotFoundException(
                `Historia clínica con ID ${savedRecord.id} no encontrada`,
            );
        }

        // PASO 6: Retornar como DTO
        return new ClinicalRecordResponseDto(recordWithRelations);
    }

    /**
     * READ ALL - Obtiene todas las historias clínicas
     * 
     * @returns Promise<ClinicalRecordResponseDto[]> - Array de historias con relaciones
     * 
     * ¿CASO DE USO?
     * - Dashboard de sistemas (últimos diagnósticos)
     * - Reportes (análisis de tumores)
     * - Admin (ver todos los records)
     * 
     * NOTA: En producción, agregar paginación aquí
     * Si hay 100,000 historias, retornarlas todas es ineficiente
     * 
     * Mejora futura:
     * findAll(page: number = 1, limit: number = 20)
     * .skip((page - 1) * limit)
     * .take(limit)
     */
    async findAll(): Promise<ClinicalRecordResponseDto[]> {
        // PASO 1: Consultar todas las historias con relaciones
        // relations: ['patient', 'tumorType'] hace JOINs internamente
        // order: { createdAt: 'DESC' } muestra más nuevos primero
        const clinicalRecords = await this.clinicalRecordRepository.find({
            relations: ['patient', 'tumorType'],
            order: { createdAt: 'DESC' },
        });

        // PASO 2: Transformar cada historia a DTO
        return clinicalRecords.map(record => new ClinicalRecordResponseDto(record));
    }

    /**
     * READ ONE - Obtiene una historia clínica específica
     * 
     * @param id - UUID de la historia clínica
     * @returns Promise<ClinicalRecordResponseDto> - Historia con relaciones
     * @throws NotFoundException si no existe
     * 
     * EJEMPLO:
     * GET /clinical-records/550e8400-e29b-41d4-a716-446655440000
     */
    async findOne(id: string): Promise<ClinicalRecordResponseDto> {
        // PASO 1: Buscar historia por ID con relaciones
        // relations: ['patient', 'tumorType'] permite acceder a:
        // - record.patient.firstName, record.patient.lastName
        // - record.tumorType.name, record.tumorType.systemAffected
        const clinicalRecord = await this.clinicalRecordRepository.findOne({
            where: { id },
            relations: ['patient', 'tumorType'],
        });

        // PASO 2: Validar que existe
        if (!clinicalRecord) {
            throw new NotFoundException(
                `Historia clínica con ID ${id} no encontrada`,
            );
        }

        // PASO 3: Retornar como DTO
        return new ClinicalRecordResponseDto(clinicalRecord);
    }

    /**
     * CUSTOM READ - Obtiene todas las historias de un paciente específico
     * 
     * @param patientId - UUID del paciente
     * @returns Promise<ClinicalRecordResponseDto[]> - Array de historias del paciente
     * @throws NotFoundException si paciente no existe
     * 
     * ¿CASO DE USO?
     * - Vista de paciente: "Ver todo historial clínico de Juan"
     * - GET /clinical-records/patient/uuid-juan
     * 
     * ¿POR QUÉ validar paciente?
     * Aunque sea custom, queremos 404 si paciente no existe
     * No "silencio" retornando array vacío
     * El cliente sabe si paciente no existe (semántica clara)
     */
    async findByPatient(patientId: string): Promise<ClinicalRecordResponseDto[]> {
        // PASO 1: Validar que el paciente existe
        const patient = await this.patientRepository.findOne({
            where: { id: patientId },
        });

        if (!patient) {
            throw new NotFoundException(
                `Paciente con ID ${patientId} no encontrado`,
            );
        }

        // PASO 2: Consultar historias del paciente
        // where: { patientId } filtra solo records de ese paciente
        // relations: ['tumorType'] carga el tipo de tumor de cada historia
        // No cargamos 'patient' porque ya lo tenemos validado
        // order: { diagnosisDate: 'DESC' } muestra diagnósticos más recientes primero
        const clinicalRecords = await this.clinicalRecordRepository.find({
            where: { patientId },
            relations: ['tumorType'],
            order: { diagnosisDate: 'DESC' },
        });

        // PASO 3: Transformar a DTOs
        return clinicalRecords.map(record => new ClinicalRecordResponseDto(record));
    }

    /**
     * UPDATE - Actualiza una historia clínica existente
     * 
     * @param id - UUID de la historia a actualizar
     * @param updateClinicalRecordDto - DTO con campos a actualizar (PARCIALES)
     * @returns Promise<ClinicalRecordResponseDto> - Historia actualizada
     * @throws NotFoundException si no existe
     * 
     * NOTA: Aunque sea médico, cambiar campos críticos es delicado
     * En producción, auditar QUIÉN cambió QUÉ
     * 
     * Ejemplo de cambios permitidos:
     * - stage: "I" → "III" (después de pruebas adicionales)
     * - treatmentProtocol: "..." → "nuevo protocolo"
     * - diagnosisDate: Raramente, solo si hubo error
     */
    async update(
        id: string,
        updateClinicalRecordDto: UpdateClinicalRecordDto,
    ): Promise<ClinicalRecordResponseDto> {
        // PASO 1: Verificar que la historia existe
        const clinicalRecord = await this.clinicalRecordRepository.findOne({
            where: { id },
        });

        if (!clinicalRecord) {
            throw new NotFoundException(
                `Historia clínica con ID ${id} no encontrada`,
            );
        }

        // PASO 2: Aplicar cambios
        // Object.assign copia solo propiedades del DTO (si algunas faltan, se ignoran)
        Object.assign(clinicalRecord, updateClinicalRecordDto);

        // PASO 3: Persistir cambios en BD
        // .save() detecta que existe (por ID) y ACTUALIZA
        const updatedRecord = await this.clinicalRecordRepository.save(
            clinicalRecord,
        );

        // PASO 4: Cargar relaciones para respuesta
        // Necesitamos relaciones actualizadas para el DTO
        const recordWithRelations = await this.clinicalRecordRepository.findOne({
            where: { id: updatedRecord.id },
            relations: ['patient', 'tumorType'],
        });

        if (!recordWithRelations) {
            throw new NotFoundException(
                `Historia clínica con ID ${updatedRecord.id} no encontrada`,
            );
        }

        // PASO 5: Retornar actualizado
        return new ClinicalRecordResponseDto(recordWithRelations);
    }

    /**
     * DELETE - Elimina una historia clínica
     * 
     * @param id - UUID de la historia a eliminar
     * @returns Promise<void> - Se resuelve cuando eliminación es exitosa
     * @throws NotFoundException si no existe
     * 
     * ⚠️ CONSIDERACIÓN MÉDICA IMPORTANTE:
     * ¿HARD DELETE o SOFT DELETE?
     * 
     * HARD DELETE (aquí):
     * - Elimina físicamente de BD (no recuperable)
     * - Riesgo: Perder datos médicos legalmente requeridos
     * 
     * SOFT DELETE (recomendado):
     * - Agregar columna 'deletedAt' TIMESTAMP
     * - Marcar como eliminado pero mantener datos
     * - Recuperable para auditoría
     * 
     * Para datos médicos, SOFT DELETE es más seguro
     * 
     * Mejora futura:
     * async remove(id: string): Promise<void> {
     *   const record = await this.clinicalRecordRepository.findOne({where: {id}});
     *   if (!record) throw new NotFoundException(...);
     *   record.deletedAt = new Date();
     *   await this.clinicalRecordRepository.save(record);
     * }
     */
    async remove(id: string): Promise<void> {
        // PASO 1: Verificar que existe
        const clinicalRecord = await this.clinicalRecordRepository.findOne({
            where: { id },
        });

        if (!clinicalRecord) {
            throw new NotFoundException(
                `Historia clínica con ID ${id} no encontrada`,
            );
        }

        // PASO 2: Eliminar
        // .remove() elimina físicamente de la BD
        // En SQL: DELETE FROM clinical_record WHERE id = ?;
        await this.clinicalRecordRepository.remove(clinicalRecord);
    }
}