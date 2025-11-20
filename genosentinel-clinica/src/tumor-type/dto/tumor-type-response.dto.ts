import { ApiProperty } from '@nestjs/swagger';
import { TumorType } from '../entities/tumor-type.entity';

/**
 * DTO para la respuesta al cliente con los datos del tipo de tumor
 */
export class TumorTypeResponseDto {
  /**
   * Identificador único del tipo de tumor
   */
  @ApiProperty({
    description: 'Identificador único del tipo de tumor',
    example: 1,
  })
  id: number;

  /**
   * Nombre del tipo de tumor
   */
  @ApiProperty({
    description: 'Nombre del tipo de tumor',
    example: 'Adenocarcinoma de pulmón',
  })
  name: string;

  /**
   * Sistema corporal afectado
   */
  @ApiProperty({
    description: 'Sistema corporal afectado',
    example: 'Sistema respiratorio',
  })
  systemAffected: string;

  /**
   * Constructor que transforma una entidad TumorType en TumorTypeResponseDto
   * @param tumorType - Entidad del tipo de tumor
   */
  constructor(tumorType: TumorType) {
    this.id = tumorType.id;
    this.name = tumorType.name;
    this.systemAffected = tumorType.systemAffected;
  }
}