import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * DTO para la creación de un tipo de tumor
 */
export class CreateTumorTypeDto {
  /**
   * Nombre del tipo de tumor
   */
  @ApiProperty({
    description: 'Nombre del tipo de tumor',
    example: 'Adenocarcinoma de pulmón',
    maxLength: 150,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name: string;

  /**
   * Sistema corporal afectado
   */
  @ApiProperty({
    description: 'Sistema corporal afectado por el tumor',
    example: 'Sistema respiratorio',
    maxLength: 150,
  })
  @IsString({ message: 'El sistema afectado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El sistema afectado es obligatorio' })
  @MaxLength(150, { message: 'El sistema afectado no puede exceder 150 caracteres' })
  systemAffected: string;
}