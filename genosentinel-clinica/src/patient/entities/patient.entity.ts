import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ClinicalRecord } from '../../clinical-record/entities/clinical-record.entity';

/**
 * Enumeración para el género del paciente
 * 
 * ¿POR QUÉ? Enum limita los valores posibles a opciones predefinidas.
 * Previene errores de tipeo y asegura consistencia en la base de datos.
 */
export enum Gender {
  MALE = 'M',      // Representa masculino
  FEMALE = 'F',    // Representa femenino
  OTHER = 'Otro',  // Otras opciones
}

/**
 * Enumeración para el estado del paciente
 * 
 * ¿POR QUÉ? Define el ciclo de vida del paciente en el sistema.
 * Permite búsquedas y reportes por estado.
 */
export enum PatientStatus {
  ACTIVE = 'Activo',           // Paciente en tratamiento activo
  FOLLOW_UP = 'Seguimiento',   // Paciente en seguimiento post-tratamiento
  INACTIVE = 'Inactivo',       // Paciente desactivado
}

/**
 * Entidad Patient - Representa un paciente oncológico en la base de datos
 * 
 * ¿QUÉ ES UNA ENTIDAD?
 * Una entidad es la representación de una tabla en la base de datos.
 * TypeORM convierte esta clase en una tabla SQL automáticamente.
 * 
 * ¿POR QUÉ USAMOS ENTIDADES?
 * - Abstracción: No escribimos SQL directamente
 * - Type-safe: TypeScript valida tipos automáticamente
 * - Relaciones: Manejo automático de relaciones entre tablas
 * - Migraciones: Control de versiones de esquema DB
 */
@Entity('patient')
export class Patient {
  /**
   * @PrimaryGeneratedColumn('uuid')
   * 
   * DECORADOR: Marca esta columna como clave primaria con UUID generado automáticamente
   * 
   * ¿POR QUÉ UUID y no auto-increment?
   * - UUID es único globalmente (mejor para microservicios)
   * - No expone información de cantidad de registros
   * - Compatible con replicación de BD
   * - Es imposible predecir el siguiente ID
   * 
   * Generará UUIDs como: 550e8400-e29b-41d4-a716-446655440000
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * @Column({ name: 'first_name', type: 'varchar', length: 100 })
   * 
   * DECORADOR: Define una columna en la tabla
   * 
   * Propiedades:
   * - name: nombre de la columna en la BD (snake_case es estándar SQL)
   * - type: tipo de dato SQL ('varchar', 'int', 'date', 'enum', etc.)
   * - length: máximo de caracteres permitidos (100 caracteres)
   * 
   * En SQL se crearía así:
   * ALTER TABLE patient ADD COLUMN first_name VARCHAR(100);
   */
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  /**
   * @Column({ name: 'last_name', type: 'varchar', length: 100 })
   * 
   * DECORADOR: Define columna para apellidos
   * 
   * Mismo patrón que firstName pero para apellidos
   */
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  /**
   * @Column({ name: 'birth_date', type: 'date' })
   * 
   * DECORADOR: Define columna de tipo fecha
   * 
   * type: 'date' almacena solo la fecha (YYYY-MM-DD) sin hora
   * En SQL: DATE - stored as YYYY-MM-DD
   */
  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  /**
   * @Column({ type: 'enum', enum: Gender })
   * 
   * DECORADOR: Define columna de tipo ENUM
   * 
   * type: 'enum' restringe los valores a los definidos en el enum Gender
   * enum: Gender vincula el TypeScript enum con SQL ENUM
   * 
   * En MySQL se crearía así:
   * ALTER TABLE patient ADD COLUMN gender ENUM('M', 'F', 'Otro');
   * 
   * ¿POR QUÉ usar ENUM en lugar de VARCHAR?
   * - Ocupa menos espacio (1 byte vs varios)
   * - Búsquedas más rápidas
   * - Valida automáticamente valores permitidos
   */
  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  /**
   * @Column({ type: 'enum', enum: PatientStatus, default: PatientStatus.ACTIVE })
   * 
   * DECORADOR: Define columna ENUM con valor por defecto
   * 
   * default: PatientStatus.ACTIVE - Cuando se crea un paciente sin especificar estado,
   * automáticamente se asigna 'Activo'
   * 
   * En SQL:
   * ALTER TABLE patient ADD COLUMN status ENUM(...) DEFAULT 'Activo';
   */
  @Column({
    type: 'enum',
    enum: PatientStatus,
    default: PatientStatus.ACTIVE,
  })
  status: PatientStatus;

  /**
   * @CreateDateColumn({ name: 'created_at' })
   * 
   * DECORADOR ESPECIAL: Registra automáticamente cuándo se crea el registro
   * 
   * ¿QUÉ HACE?
   * - TypeORM inserta automáticamente NOW() al crear el registro
   * - Nunca se actualiza (solo en creación)
   * - Útil para auditoría y análisis históricos
   * 
   * En SQL:
   * ALTER TABLE patient ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * @OneToMany(() => ClinicalRecord, (record) => record.patient)
   * 
   * DECORADOR DE RELACIÓN: Define relación uno-a-muchos
   * 
   * ¿QUÉ SIGNIFICA?
   * - () => ClinicalRecord: Un paciente tiene MUCHAS historias clínicas
   * - (record) => record.patient: La relación inversa (historia clínica pertenece a paciente)
   * 
   * ¿POR QUÉ?
   * Permite:
   * - const patient = await patientRepo.findOne({relations: ['clinicalRecords']})
   * - Acceder automáticamente a todas las historias clínicas: patient.clinicalRecords
   * - Sin esto tendríamos que hacer queries adicionales
   * 
   * En la BD: ClinicalRecord tiene columna `patientId` (clave foránea)
   * En la entidad: No necesitamos especificar la foreign key, TypeORM lo maneja
   */
  @OneToMany(() => ClinicalRecord, (record) => record.patient)
  clinicalRecords: ClinicalRecord[];
}