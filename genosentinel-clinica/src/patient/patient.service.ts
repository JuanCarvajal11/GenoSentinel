import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient, PatientStatus } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';

/**
 * Servicio que maneja la lógica de negocio relacionada con pacientes
 * 
 * ¿QUÉ ES UN SERVICIO?
 * Un servicio es donde implementamos la lógica de negocio (CRUD, validaciones, transformaciones).
 * Los controladores llaman a servicios, no acceden directamente a la BD.
 * 
 * PATRÓN: Separación de responsabilidades
 * - Controller: Recibe requests, valida, llama servicios, envía responses
 * - Service: Lógica de negocio, acceso a BD, transformaciones
 * - Entity: Estructura de datos en BD
 * 
 * ¿POR QUÉ?
 * - Código limpio y reutilizable
 * - Fácil de testear
 * - Fácil de mantener y escalar
 */
@Injectable()
export class PatientService {
  /**
   * Constructor con inyección de dependencias
   * 
   * @Injectable() - Decorador que marca esta clase como inyectable en NestJS
   * ¿QUÉ HACE? Registra la clase en el contenedor de inyección de dependencias.
   * Permite que NestJS instancie automáticamente esta clase cuando se necesite.
   * 
   * ¿POR QUÉ inyección de dependencias?
   * - Desacoplamiento: No creamos Repository manualmente
   * - Testeable: En tests podemos pasar un mock del Repository
   * - Centralizado: NestJS gestiona ciclo de vida de instancias
   */
  constructor(
    /**
     * @InjectRepository(Patient)
     * 
     * DECORADOR: Inyecta el repositorio de TypeORM para la entidad Patient
     * 
     * ¿QUÉ ES UN REPOSITORIO?
     * El repositorio es la interfaz entre nuestra aplicación y la BD.
     * Proporciona métodos para CRUD (Create, Read, Update, Delete):
     * - find() : Obtener múltiples registros
     * - findOne(): Obtener un registro
     * - save(): Insertar o actualizar
     * - remove(): Eliminar
     * - delete(): Eliminar (forma diferente)
     * 
     * Es como un DAL (Data Access Layer) automático que evita escribir SQL.
     * TypeORM traduce métodos como find() a SELECT * automáticamente.
     */
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  /**
   * Crea un nuevo paciente en la base de datos
   * 
   * @param createPatientDto - DTO con datos del paciente a crear
   * @returns Promise<PatientResponseDto> - Paciente creado (DTO de respuesta)
   * 
   * FLUJO:
   * 1. Recibir datos validados del controller
   * 2. Crear instancia de entidad Patient
   * 3. Guardar en BD
   * 4. Transformar a DTO de respuesta
   * 5. Retornar al controller
   * 
   * ¿POR QUÉ async/await?
   * Las operaciones de BD son asincrónicas (lleva tiempo conectar y consultar).
   * async marca que retorna Promise, await pausa hasta que BD responda.
   */
  async create(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    // patientRepository.create() crea INSTANCIA EN MEMORIA (no en BD)
    // Útil para configuraciones/validaciones antes de guardar
    const patient = this.patientRepository.create(createPatientDto);
    
    // .save() INSERTA en la BD y retorna el objeto guardado
    // En SQL internamente hace: INSERT INTO patient (...) VALUES (...);
    const savedPatient = await this.patientRepository.save(patient);
    
    // Transformar entidad a DTO de respuesta
    // DTOs exponen solo los campos que queremos enviar al cliente
    return new PatientResponseDto(savedPatient);
  }

  /**
   * Obtiene todos los pacientes de la base de datos
   * 
   * @returns Promise<PatientResponseDto[]> - Array de pacientes (DTO de respuesta)
   * 
   * NOTA: En aplicaciones grandes, aquí iríamos agregando:
   * - Paginación: limit(10).offset(0)
   * - Búsqueda: where({ firstName: Like('%Juan%') })
   * - Filtros: where({ status: PatientStatus.ACTIVE })
   * - Relaciones: relations(['clinicalRecords'])
   */
  async findAll(): Promise<PatientResponseDto[]> {
    // .find() obtiene todos los registros
    // { order: { createdAt: 'DESC' } } ordena por fecha (más nuevos primero)
    // En SQL: SELECT * FROM patient ORDER BY created_at DESC;
    const patients = await this.patientRepository.find({
      order: { createdAt: 'DESC' },
    });
    
    // .map() transforma cada paciente a DTO
    // Convierte Array<Patient> en Array<PatientResponseDto>
    return patients.map(patient => new PatientResponseDto(patient));
  }

  /**
   * Busca un paciente específico por su ID
   * 
   * @param id - UUID del paciente a buscar
   * @returns Promise<PatientResponseDto> - Paciente encontrado (DTO de respuesta)
   * @throws NotFoundException si el paciente no existe
   * 
   * ¿POR QUÉ throw NotFoundException?
   * - HTTP 404 es el código estándar para "no encontrado"
   * - El usuario sabe que el recurso no existe
   * - Better que devolver null (ambiguo)
   * 
   * En el controlador, NestJS automáticamente:
   * - Detecta la excepción
   * - Convierte a HTTP 404
   * - Envía JSON: { statusCode: 404, message: "..." }
   */
  async findOne(id: string): Promise<PatientResponseDto> {
    // .findOne() obtiene UN registro
    // { where: { id } } filtra por ID (en SQL: WHERE id = ?)
    // relations: ['clinicalRecords'] carga también las historias clínicas del paciente
    // En SQL hace un JOIN internamente
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['clinicalRecords'],
    });

    // Validación: si findOne() retorna undefined, el registro no existe
    if (!patient) {
      // NotFoundException es de @nestjs/common
      // Automáticamente se convierte a HTTP 404
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    return new PatientResponseDto(patient);
  }

  /**
   * Actualiza los datos de un paciente existente
   * 
   * @param id - UUID del paciente a actualizar
   * @param updatePatientDto - DTO con datos a actualizar (campos opcionales)
   * @returns Promise<PatientResponseDto> - Paciente actualizado
   * @throws NotFoundException si el paciente no existe
   * 
   * NOTA: UpdatePatientDto tiene todos los campos @IsOptional()
   * Así el cliente solo envía lo que quiere cambiar, no todo.
   */
  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<PatientResponseDto> {
    // Primero verificar que el paciente existe
    const patient = await this.patientRepository.findOne({ where: { id } });
    
    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    // Object.assign() copia propiedades del DTO al paciente
    // Ejemplo: si DTO tiene { firstName: 'Carlos' }, paciente.firstName se actualiza
    // Las propiedades que NO están en DTO se mantienen igual
    Object.assign(patient, updatePatientDto);
    
    // .save() ACTUALIZA en la BD (detecta que ya existe por el ID)
    // En SQL internamente hace: UPDATE patient SET ... WHERE id = ?;
    const updatedPatient = await this.patientRepository.save(patient);
    
    return new PatientResponseDto(updatedPatient);
  }

  /**
   * Desactiva un paciente (soft delete)
   * 
   * ¿SOFT DELETE? Cambiar estado a 'Inactivo' en lugar de eliminar físicamente
   * ¿POR QUÉ? En sistemas médicos, NO se deben eliminar registros.
   * Auditoría, trazabilidad, cumplimiento legal (HIPAA, GDPR).
   * 
   * @param id - UUID del paciente a desactivar
   * @returns Promise<PatientResponseDto> - Paciente desactivado
   * @throws NotFoundException si el paciente no existe
   */
  async deactivate(id: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    
    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    // Cambiar estado a Inactivo (definido en enum PatientStatus)
    patient.status = PatientStatus.INACTIVE;
    
    // .save() ACTUALIZA el estado
    // En SQL: UPDATE patient SET status = 'Inactivo' WHERE id = ?;
    const deactivatedPatient = await this.patientRepository.save(patient);
    
    return new PatientResponseDto(deactivatedPatient);
  }
}