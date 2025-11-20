import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { TumorType } from '../../tumor-type/entities/tumor-type.entity';

/**
 * Entidad ClinicalRecord - Representa una historia clínica oncológica en la BD
 * 
 * ¿QUÉ ES?
 * Documento que registra el diagnóstico y tratamiento de un tumor en un paciente
 * 
 * ¿RELACIÓN CON OTRAS TABLAS?
 * Patient (1) ─────────┬───── ClinicalRecord (Muchos)
 *                      │
 * TumorType (1) ────────┘
 * 
 * Ejemplo:
 * - Paciente "Juan" puede tener MÚLTIPLES historias clínicas
 *   - Historia 1: Melanoma diagnosticado 2023
 *   - Historia 2: Cáncer de pulmón diagnosticado 2024
 * 
 * - Un "Melanoma" (TumorType) puede aparecer en MÚLTIPLES historias
 *   - Paciente Juan tiene Melanoma
 *   - Paciente María tiene Melanoma
 *   - Paciente Carlos tiene Melanoma
 * 
 * ¿POR QUÉ separar Patient, TumorType, ClinicalRecord?
 * - Reutilización: Pacientes iguales, tumores iguales
 * - Normalización: Elimina redundancia en BD
 * - Integridad: Validamos que datos referenciados existen
 * - Queries: Búsquedas complejas (ej: "todos los Melanomas en 2024")
 */
@Entity('clinical_record')
export class ClinicalRecord {
  /**
   * @PrimaryGeneratedColumn('uuid')
   * 
   * DECORADOR: Genera ID único universalmente (UUID)
   * 
   * ¿POR QUÉ UUID aquí y no en TumorType?
   * - ClinicalRecord es transaccional (cambia frecuentemente)
   * - Distribuido (puede provenir de diferentes clínicas)
   * - Identificación global única (mejor para microservicios)
   * 
   * Ejemplos de UUID:
   * - 550e8400-e29b-41d4-a716-446655440000
   * - 6ba7b810-9dad-11d1-80b4-00c04fd430c8
   * 
   * En SQL:
   * ALTER TABLE clinical_record ADD COLUMN id CHAR(36) PRIMARY KEY;
   * (UUID se almacena como string de 36 caracteres con guiones)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * @Column({ name: 'patient_id', type: 'char', length: 36 })
   * 
   * DECORADOR: Define columna para ID del paciente (clave foránea)
   * 
   * Propiedades:
   * - name: 'patient_id' - Nombre en BD
   * - type: 'char' - Carácter de longitud fija (UUID es siempre 36 chars)
   * - length: 36 - UUID con guiones: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   * 
   * ¿POR QUÉ char en lugar de varchar?
   * UUIDs siempre tienen 36 caracteres, no varían
   * char(36) es más eficiente que varchar(36)
   * 
   * NOTA: Esta columna es clave foránea
   * Definida aquí como columna regular
   * La relación está en @ManyToOne y @JoinColumn
   * 
   * En SQL:
   * ALTER TABLE clinical_record ADD COLUMN patient_id CHAR(36) NOT NULL;
   * ALTER TABLE clinical_record ADD CONSTRAINT fk_patient 
   *   FOREIGN KEY (patient_id) REFERENCES patient(id);
   */
  @Column({ name: 'patient_id', type: 'char', length: 36 })
  patientId: string;

  /**
   * @Column({ name: 'tumor_type_id', type: 'int' })
   * 
   * DECORADOR: Define columna para ID del tipo de tumor (clave foránea)
   * 
   * Propiedades:
   * - name: 'tumor_type_id' - Nombre en BD
   * - type: 'int' - Entero (TumorType.id es autoincrement)
   * 
   * Ejemplos de valores:
   * - 1 = Melanoma
   * - 2 = Cáncer de Pulmón
   * - 3 = Cáncer de Colon
   * 
   * En SQL:
   * ALTER TABLE clinical_record ADD COLUMN tumor_type_id INT NOT NULL;
   * ALTER TABLE clinical_record ADD CONSTRAINT fk_tumor_type 
   *   FOREIGN KEY (tumor_type_id) REFERENCES tumor_type(id);
   */
  @Column({ name: 'tumor_type_id', type: 'int' })
  tumorTypeId: number;

  /**
   * @Column({ name: 'diagnosis_date', type: 'date' })
   * 
   * DECORADOR: Fecha del diagnóstico
   * 
   * Propiedades:
   * - name: 'diagnosis_date' - Nombre en BD
   * - type: 'date' - Solo fecha, sin hora (YYYY-MM-DD)
   * 
   * Ejemplos:
   * - 2024-01-15 (15 de enero de 2024)
   * - 2023-06-22 (22 de junio de 2023)
   * 
   * En SQL:
   * ALTER TABLE clinical_record ADD COLUMN diagnosis_date DATE NOT NULL;
   */
  @Column({ name: 'diagnosis_date', type: 'date' })
  diagnosisDate: Date;

  /**
   * @Column({ type: 'varchar', length: 10, nullable: true })
   * 
   * DECORADOR: Estadio del tumor (opcional)
   * 
   * Propiedades:
   * - type: 'varchar' - Texto
   * - length: 10 - Máximo 10 caracteres
   * - nullable: true - PUEDE SER NULL (es opcional)
   * 
   * Estadios de tumor (TNM):
   * - "I" - Tumor pequeño, localizado
   * - "II" - Tumor más grande, nódulos linfáticos cercanos sin metástasis
   * - "III" - Tumor avanzado, nódulos linfáticos comprometidos
   * - "IV" - Metástasis distante (cáncer en otras partes del cuerpo)
   * 
   * ¿POR QUÉ nullable?
   * Al momento del diagnóstico, el estadio puede no estar determinado
   * Se clasifica después de más pruebas
   * 
   * En SQL:
   * ALTER TABLE clinical_record ADD COLUMN stage VARCHAR(10) NULL;
   */
  @Column({ type: 'varchar', length: 10, nullable: true })
  stage: string;

  /**
   * @Column({ name: 'treatment_protocol', type: 'varchar', length: 255, nullable: true })
   * 
   * DECORADOR: Protocolo de tratamiento (opcional)
   * 
   * Propiedades:
   * - name: 'treatment_protocol' - Nombre en BD
   * - type: 'varchar' - Texto variable
   * - length: 255 - Máximo 255 caracteres (puede ser largo)
   * - nullable: true - Opcional, se define después del diagnóstico
   * 
   * Ejemplos de protocolos:
   * - "Quimioterapia + Radioterapia"
   * - "Cirugía + Inmunoterapia"
   * - "Observación y seguimiento"
   * - "Tratamiento paliativo"
   * 
   * ¿POR QUÉ nullable?
   * Al principio del diagnóstico, el plan de tratamiento puede estar en revisión
   * Se define después de evaluación multidisciplinaria
   * 
   * En SQL:
   * ALTER TABLE clinical_record ADD COLUMN treatment_protocol VARCHAR(255) NULL;
   */
  @Column({ name: 'treatment_protocol', type: 'varchar', length: 255, nullable: true })
  treatmentProtocol: string;

  /**
   * @CreateDateColumn({ name: 'created_at' })
   * 
   * DECORADOR ESPECIAL: Timestamp automático de creación
   * 
   * ¿QUÉ HACE?
   * - TypeORM inserta automáticamente NOW() cuando se crea el registro
   * - NUNCA se actualiza (solo en creación)
   * - Útil para auditoría temporal
   * 
   * Ejemplo de valor:
   * - 2024-01-15T10:30:45.123Z (ISO 8601 con zona horaria)
   * 
   * ¿POR QUÉ útil?
   * - Saber exactamente cuándo se registró la historia clínica
   * - Auditoría médica: "¿Cuándo se diagnosticó este paciente?"
   * - Reportes: "Historias clínicas registradas en enero 2024"
   * 
   * En SQL:
   * ALTER TABLE clinical_record 
   *   ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * @ManyToOne(() => Patient, (patient) => patient.clinicalRecords)
   * 
   * DECORADOR DE RELACIÓN: Relación muchos-a-uno con Patient
   * 
   * ¿QUÉ SIGNIFICA?
   * - () => Patient: Referencia a la entidad Patient
   * - (patient) => patient.clinicalRecords: Propiedad inversa
   * 
   * CARDINALIDAD:
   * Muchas ClinicalRecords pertenecen a UN paciente
   * 
   * ClinicalRecord.patientId → Patient.id (clave foránea)
   * 
   * EJEMPLO VISUAL:
   * Patient { id: "uuid-1", name: "Juan" }
   *   ├─ ClinicalRecord 1 → patientId: "uuid-1"
   *   ├─ ClinicalRecord 2 → patientId: "uuid-1"
   *   └─ ClinicalRecord 3 → patientId: "uuid-1"
   * 
   * ¿POR QUÉ ManyToOne?
   * De la perspectiva de ClinicalRecord:
   * - Una historia clínica pertenece a UN paciente
   * - Un paciente tiene MUCHAS historias clínicas
   * 
   * OPCIONES:
   * - onDelete: 'CASCADE' - Si se elimina paciente, se eliminan sus historias
   *   (PELIGROSO en datos médicos, nunca usar)
   * - onDelete: 'RESTRICT' - No permite eliminar paciente si tiene historias
   *   (SEGURO, protege datos médicos)
   */
  @ManyToOne(() => Patient, (patient) => patient.clinicalRecords, {
    onDelete: 'CASCADE',
  })
  /**
   * @JoinColumn({ name: 'patient_id' })
   * 
   * DECORADOR: Especifica cuál columna es la clave foránea
   * 
   * ¿QUÉ HACE?
   * Indica a TypeORM que la columna 'patient_id' (definida arriba)
   * es la que conecta con Patient.id
   * 
   * En SQL genera:
   * ALTER TABLE clinical_record ADD CONSTRAINT fk_patient
   *   FOREIGN KEY (patient_id) REFERENCES patient(id);
   * 
   * SIN @JoinColumn:
   * TypeORM crearía una tabla intermedia (join table)
   * Solo usamos eso en relaciones ManyToMany
   * 
   * CON @JoinColumn:
   * TypeORM usa la columna especificada como FK (lo que queremos)
   */
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  /**
   * @ManyToOne(() => TumorType, (tumorType) => tumorType.clinicalRecords)
   * 
   * DECORADOR DE RELACIÓN: Relación muchos-a-uno con TumorType
   * 
   * ¿QUÉ SIGNIFICA?
   * - () => TumorType: Referencia a la entidad TumorType
   * - (tumorType) => tumorType.clinicalRecords: Propiedad inversa
   * 
   * CARDINALIDAD:
   * Muchas ClinicalRecords pueden tener el mismo tipo de tumor
   * 
   * ClinicalRecord.tumorTypeId → TumorType.id (clave foránea)
   * 
   * EJEMPLO VISUAL:
   * TumorType { id: 1, name: "Melanoma" }
   *   ├─ ClinicalRecord (Juan) → tumorTypeId: 1
   *   ├─ ClinicalRecord (María) → tumorTypeId: 1
   *   └─ ClinicalRecord (Carlos) → tumorTypeId: 1
   * 
   * ¿POR QUÉ util?
   * Permite: "Dame todos los melanomas diagnosticados en 2024"
   * Sin esto tendríamos que hacer queries complejas
   * 
   * OPCIONES:
   * - onDelete: 'RESTRICT' - No permite eliminar TumorType si hay historias
   *   (RECOMENDADO, protege integridad de datos)
   * - onDelete: 'CASCADE' - Si se elimina tipo de tumor, se eliminan historias
   *   (PELIGROSO, perderías datos médicos)
   */
  @ManyToOne(() => TumorType, (tumorType) => tumorType.clinicalRecords, {
    onDelete: 'RESTRICT',
  })
  /**
   * @JoinColumn({ name: 'tumor_type_id' })
   * 
   * DECORADOR: Especifica cuál columna es la clave foránea
   * 
   * Indica que 'tumor_type_id' es la columna que conecta con TumorType.id
   */
  @JoinColumn({ name: 'tumor_type_id' })
  tumorType: TumorType;
}