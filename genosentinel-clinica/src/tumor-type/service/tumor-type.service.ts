import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TumorType } from '../entities/tumor-type.entity';
import { CreateTumorTypeDto } from '../dto/create-tumor-type.dto';
import { UpdateTumorTypeDto } from '../dto/update-tumor-type.dto';
import { TumorTypeResponseDto } from '../dto/tumor-type-response.dto';

// Lógica de negocio para gestión de tipos de tumor
@Injectable()
export class TumorTypeService {
  constructor(
    @InjectRepository(TumorType)
    private readonly tumorTypeRepository: Repository<TumorType>,
  ) {}

  async create(createTumorTypeDto: CreateTumorTypeDto): Promise<TumorTypeResponseDto> {
    // Validar nombre único
    const existing = await this.tumorTypeRepository.findOne({
      where: { name: createTumorTypeDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un tipo de tumor con el nombre "${createTumorTypeDto.name}"`,
      );
    }

    const tumorType = this.tumorTypeRepository.create(createTumorTypeDto);
    const savedTumorType = await this.tumorTypeRepository.save(tumorType);
    return new TumorTypeResponseDto(savedTumorType);
  }

  async findAll(): Promise<TumorTypeResponseDto[]> {
    // Ordenar alfabéticamente para mejor UX
    const tumorTypes = await this.tumorTypeRepository.find({
      order: { name: 'ASC' },
    });
    return tumorTypes.map(tumorType => new TumorTypeResponseDto(tumorType));
  }

  async findOne(id: number): Promise<TumorTypeResponseDto> {
    const tumorType = await this.tumorTypeRepository.findOne({ where: { id } });

    if (!tumorType) {
      throw new NotFoundException(`Tipo de tumor con ID ${id} no encontrado`);
    }

    return new TumorTypeResponseDto(tumorType);
  }

  async update(
    id: number,
    updateTumorTypeDto: UpdateTumorTypeDto,
  ): Promise<TumorTypeResponseDto> {
    const tumorType = await this.tumorTypeRepository.findOne({ where: { id } });
    
    if (!tumorType) {
      throw new NotFoundException(`Tipo de tumor con ID ${id} no encontrado`);
    }

    // Validar nombre único si se está cambiando
    if (
      updateTumorTypeDto.name &&
      updateTumorTypeDto.name !== tumorType.name
    ) {
      const existing = await this.tumorTypeRepository.findOne({
        where: { name: updateTumorTypeDto.name },
      });
      
      if (existing) {
        throw new ConflictException(
          `Ya existe un tipo de tumor con el nombre "${updateTumorTypeDto.name}"`,
        );
      }
    }

    Object.assign(tumorType, updateTumorTypeDto);
    const updatedTumorType = await this.tumorTypeRepository.save(tumorType);
    return new TumorTypeResponseDto(updatedTumorType);
  }

  /**
   * DELETE - Elimina un tipo de tumor
   * 
   * @param id - ID del tipo de tumor a eliminar
   * @returns Promise<void> - Se resuelve cuando eliminación es exitosa
   * @throws NotFoundException si no existe
   * 
   * CONSIDERACIONES:
   * - Si hay ClinicalRecords con este tipo de tumor, TypeORM lanzará error
   * - Configuración en Entity con onDelete: 'RESTRICT' lo previene
   * - Alternativamente onDelete: 'CASCADE' eliminaría registros asociados (peligroso)
   * 
   * ¿HARD DELETE vs SOFT DELETE?
   * - Hard delete (aquí): Elimina físicamente de BD (no recuperable)
   * - Soft delete: Marca como eliminado pero mantiene datos (recuperable)
   * 
   * Para datos médicos, soft delete es más recomendado por auditoría
   */
  async remove(id: number) {
  try {
    await this.tumorTypeRepository.delete(id);
    return { message: "Tipo de tumor eliminado correctamente" };
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new ConflictException(
        "No se puede eliminar el tipo de tumor porque está asociado a historias clínicas."
      );
    }
    throw error;
  }
}

}