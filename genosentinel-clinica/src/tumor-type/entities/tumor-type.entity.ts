import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ClinicalRecord } from '../../clinical-record/entities/clinical-record.entity';

/**
 * Entidad TumorType - Representa un tipo de tumor oncológico en la BD
 * 
 * ¿QUÉ ES?
 * Define los tipos de tumores que pueden diagnosticarse (melanoma, cáncer de pulmón, etc.)
 * Ejemplos:
 * - ID: 1, Nombre: "Melanoma", Sistema: "Piel"
 * - ID: 2, Nombre: "Cáncer de Pulmón", Sistema: "Respiratorio"
 * 
 * ¿POR QUÉ SEPARADO?
 * - Reutilizable: Múltiples pacientes pueden tener el mismo tipo de tumor
 * - Mantenimiento: Agregar nuevos tipos es fácil
 * - Integridad: Validamos que solo tipos existentes se asignen a pacientes
 */
@Entity('tumor_type')
export class TumorType {
  /**
   * @PrimaryGeneratedColumn()
   * 
   * DECORADOR: Genera ID autoincremental (1, 2, 3, ...)
   * 
   * ¿POR QUÉ number en lugar de UUID?
   * - TumorType es datos maestros (catálogo)
   * - Valores que raramente cambian
   * - IDs numéricos más legibles para catálogos
   * - Menos overhead que UUID en relaciones
   * 
   * En SQL:
   * ALTER TABLE tumor_type ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY;
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * @Column({ type: 'varchar', length: 150 })
   * 
   * DECORADOR: Define columna de tipo texto
   * 
   * Propiedades:
   * - type: 'varchar' - Texto variable (no ocupa espacio extra)
   * - length: 150 - Máximo 150 caracteres
   * 
   * Ejemplos de nombres:
   * - "Melanoma"
   * - "Carcinoma de células basales"
   * - "Sarcoma de Kaposi"
   * 
   * En SQL:
   * ALTER TABLE tumor_type ADD COLUMN name VARCHAR(150) NOT NULL;
   */
  @Column({ type: 'varchar', length: 150 })
  name: string;

  /**
   * @Column({ name: 'system_affected', type: 'varchar', length: 150 })
   * 
   * DECORADOR: Define columna para sistema corporal afectado
   * 
   * Propiedades:
   * - name: 'system_affected' - Nombre en BD (snake_case, estándar SQL)
   * - type: 'varchar' - Texto variable
   * - length: 150 - Máximo 150 caracteres
   * 
   * Ejemplos de sistemas:
   * - "Piel"
   * - "Respiratorio"
   * - "Digestivo"
   * - "Hematológico" (sangre)
   * - "Neurológico" (sistema nervioso)
   * 
   * En TypeScript accedemos como: tumorType.systemAffected
   * En SQL se guarda como: system_affected
   * 
   * En SQL:
   * ALTER TABLE tumor_type ADD COLUMN system_affected VARCHAR(150) NOT NULL;
   */
  @Column({ name: 'system_affected', type: 'varchar', length: 150 })
  systemAffected: string;

  /**
   * @OneToMany(() => ClinicalRecord, (record) => record.tumorType)
   * 
   * DECORADOR DE RELACIÓN: Define relación uno-a-muchos
   * 
   * ¿QUÉ SIGNIFICA?
   * - () => ClinicalRecord: UN TumorType tiene MUCHAS ClinicalRecords
   * - (record) => record.tumorType: Referencia inversa (cada record apunta a tumorType)
   * 
   * EJEMPLO REAL:
   * TumorType { id: 1, name: "Melanoma" }
   *   ├─ ClinicalRecord 1 → Melanoma diagnosticado a paciente A
   *   ├─ ClinicalRecord 2 → Melanoma diagnosticado a paciente B
   *   ├─ ClinicalRecord 3 → Melanoma diagnosticado a paciente C
   *   └─ ClinicalRecord 4 → Melanoma diagnosticado a paciente D
   * 
   * ¿POR QUÉ?
   * Permite:
   * const tumorType = await tumorTypeRepo.findOne({
   *   where: { id: 1 },
   *   relations: ['clinicalRecords']
   * });
   * // Acceso: tumorType.clinicalRecords[0], tumorType.clinicalRecords[1], etc.
   * 
   * Sin esto tendríamos que hacer query separada:
   * const records = await recordRepo.find({ where: { tumorTypeId: 1 } });
   * 
   * ¿CÓMO FUNCIONA EN BD?
   * - ClinicalRecord tiene columna tumor_type_id (clave foránea)
   * - TypeORM usa esa columna para establecer la relación
   * - No necesitamos especificar la columna aquí, está en ClinicalRecord
   * 
   * En SQL la relación es:
   * ClinicalRecord.tumor_type_id → TumorType.id (FK)
   */
  @OneToMany(() => ClinicalRecord, (record) => record.tumorType)
  clinicalRecords: ClinicalRecord[];
}