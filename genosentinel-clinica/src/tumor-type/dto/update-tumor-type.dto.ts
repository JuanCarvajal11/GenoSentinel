import { PartialType } from '@nestjs/swagger';
import { CreateTumorTypeDto } from './create-tumor-type.dto';

/**
 * DTO para actualizar un tipo de tumor
 * Hereda todas las propiedades de CreateTumorTypeDto pero las hace opcionales
 */
export class UpdateTumorTypeDto extends PartialType(CreateTumorTypeDto) {}