import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TumorType } from './entities/tumor-type.entity';
import { CreateTumorTypeDto } from './dto/create-tumor-type.dto';
import { UpdateTumorTypeDto } from './dto/update-tumor-type.dto';
import { TumorTypeResponseDto } from './dto/tumor-type-response.dto';

/**
 * Servicio TumorTypeService - Lógica de negocio para tipos de tumor
 * 
 * ¿QUÉ HACE?
 * Maneja todas las operaciones CRUD (Create, Read, Update, Delete) para tipos de tumor
 * 
 * RESPONSABILIDADES:
 * - Validar datos (ej: no duplicar nombres)
 * - Acceder a base de datos vía Repository
 * - Transformar entidades a DTOs
 * - Lanzar excepciones apropiadas (404, 409, etc.)
 * 
 * ¿POR QUÉ separado de Controller?
 * El controlador se enfoca en HTTP, este servicio en lógica pura
 * Si cambias API (REST → GraphQL) reutilizas este servicio
 */
@Injectable()
export class TumorTypeService {
  /**
   * Constructor con inyección de dependencias
   * 
   * @InjectRepository(TumorType)
   * 
   * DECORADOR: Inyecta el repositorio de TypeORM para TumorType
   * 
   * ¿QUÉ ES Repository<TumorType>?
   * Es la interfaz para acceder a la tabla tumor_type
   * Proporciona métodos genéricos:
   * - .find() - Obtener múltiples registros
   * - .findOne() - Obtener un registro
   * - .create() - Crear instancia en memoria
   * - .save() - Insertar o actualizar
   * - .remove() - Eliminar
   * 
   * @param tumorTypeRepository - Repository inyectado por NestJS
   */
  constructor(
    @InjectRepository(TumorType)
    private readonly tumorTypeRepository: Repository<TumorType>,
  ) {}

  /**
   * CREATE - Crea un nuevo tipo de tumor
   * 
   * @param createTumorTypeDto - DTO validado con datos del nuevo tipo de tumor
   * @returns Promise<TumorTypeResponseDto> - Tipo de tumor creado
   * @throws ConflictException si ya existe tipo de tumor con ese nombre (409 Conflict)
   * 
   * FLUJO:
   * 1. Validar que nombre es único (no duplicados)
   * 2. Si existe → lanzar error 409 Conflict
   * 3. Si no existe → crear y guardar en BD
   * 4. Retornar transformado a DTO
   * 
   * ¿POR QUÉ ConflictException?
   * HTTP 409 Conflict significa: "No se puede procesar porque violaría integridad de datos"
   * Perfecto para duplicación de nombres
   */
  async create(createTumorTypeDto: CreateTumorTypeDto): Promise<TumorTypeResponseDto> {
    // PASO 1: Validar que no existe otro tipo de tumor con el mismo nombre
    // .findOne({ where: { name: ... } }) busca UN registro por nombre
    // Si no encuentra nada, retorna undefined/null
    const existing = await this.tumorTypeRepository.findOne({
      where: { name: createTumorTypeDto.name },
    });

    // PASO 2: Si ya existe, lanzar excepción
    // ConflictException → HTTP 409
    if (existing) {
      throw new ConflictException(
        `Ya existe un tipo de tumor con el nombre "${createTumorTypeDto.name}"`,
      );
    }

    // PASO 3: Crear instancia en memoria (NO en BD todavía)
    // .create() asigna propiedades del DTO a la entidad
    // Es más eficiente que: new TumorType() + Object.assign()
    const tumorType = this.tumorTypeRepository.create(createTumorTypeDto);
    
    // PASO 4: Guardar en la BD
    // .save() INSERTA si no existe el ID, ACTUALIZA si existe
    // En SQL internamente hace: INSERT INTO tumor_type (name, system_affected) VALUES (?, ?);
    // ID se genera automáticamente (autoincrement)
    const savedTumorType = await this.tumorTypeRepository.save(tumorType);
    
    // PASO 5: Retornar transformado a DTO
    // DTOs ocultan detalles internos, exponen solo lo que cliente necesita
    return new TumorTypeResponseDto(savedTumorType);
  }

  /**
   * READ ALL - Obtiene todos los tipos de tumor
   * 
   * @returns Promise<TumorTypeResponseDto[]> - Array de tipos de tumor
   * 
   * ¿CASO DE USO?
   * - Endpoints de búsqueda
   * - Cargar catálogos en frontend
   * - Obtener lista para select/dropdown
   * 
   * ORDEN: Alfabético por nombre (más intuitivo para usuarios)
   */
  async findAll(): Promise<TumorTypeResponseDto[]> {
    // PASO 1: Consultar todos los tipos de tumor
    // .find() sin where retorna TODO
    // { order: { name: 'ASC' } } ordena alfabéticamente ascendente
    // En SQL: SELECT * FROM tumor_type ORDER BY name ASC;
    const tumorTypes = await this.tumorTypeRepository.find({
      order: { name: 'ASC' },
    });
    
    // PASO 2: Transformar cada entidad a DTO
    // .map() itera sobre array y retorna nuevo array
    // Cada TumorType se convierte a TumorTypeResponseDto
    return tumorTypes.map(tumorType => new TumorTypeResponseDto(tumorType));
  }

  /**
   * READ ONE - Obtiene un tipo de tumor específico por ID
   * 
   * @param id - ID numérico del tipo de tumor (autoincremental)
   * @returns Promise<TumorTypeResponseDto> - Tipo de tumor encontrado
   * @throws NotFoundException si no existe (404 Not Found)
   * 
   * EJEMPLO:
   * GET /tumor-types/1 → Busca tipo de tumor con id=1
   */
  async findOne(id: number): Promise<TumorTypeResponseDto> {
    // PASO 1: Buscar tipo de tumor por ID
    // .findOne({ where: { id } }) es equivalente a WHERE id = ?
    // Retorna un registro o undefined
    const tumorType = await this.tumorTypeRepository.findOne({ where: { id } });

    // PASO 2: Validar que existe
    if (!tumorType) {
      // NotFoundException → HTTP 404
      throw new NotFoundException(`Tipo de tumor con ID ${id} no encontrado`);
    }

    // PASO 3: Retornar transformado a DTO
    return new TumorTypeResponseDto(tumorType);
  }

  /**
   * UPDATE - Actualiza un tipo de tumor existente
   * 
   * @param id - ID del tipo de tumor a actualizar
   * @param updateTumorTypeDto - DTO con campos a actualizar (PARCIALES)
   * @returns Promise<TumorTypeResponseDto> - Tipo de tumor actualizado
   * @throws NotFoundException si no existe
   * @throws ConflictException si el nuevo nombre ya existe en otro registro
   * 
   * NOTA: Usa PATCH (actualización parcial), no PUT (reemplazo total)
   * El DTO tiene @IsOptional() en todos los campos
   * Cliente solo envía lo que quiere cambiar
   */
  async update(
    id: number,
    updateTumorTypeDto: UpdateTumorTypeDto,
  ): Promise<TumorTypeResponseDto> {
    // PASO 1: Verificar que el tipo de tumor existe
    const tumorType = await this.tumorTypeRepository.findOne({ where: { id } });
    
    if (!tumorType) {
      throw new NotFoundException(`Tipo de tumor con ID ${id} no encontrado`);
    }

    // PASO 2: Si se está cambiando el nombre, validar que es único
    // Lógica: Si hay nuevo nombre Y es diferente del actual
    // Entonces verificar que no existe otro con ese nombre
    if (
      updateTumorTypeDto.name &&
      updateTumorTypeDto.name !== tumorType.name
    ) {
      // Buscar si existe otro registro con el nuevo nombre
      const existing = await this.tumorTypeRepository.findOne({
        where: { name: updateTumorTypeDto.name },
      });
      
      // Si existe otro (diferente al actual), es conflicto
      if (existing) {
        throw new ConflictException(
          `Ya existe un tipo de tumor con el nombre "${updateTumorTypeDto.name}"`,
        );
      }
    }

    // PASO 3: Aplicar cambios
    // Object.assign(target, source) copia propiedades de source a target
    // Ejemplo: Si DTO tiene { name: 'Nuevo Nombre' }
    // → tumorType.name se actualiza a 'Nuevo Nombre'
    // Las propiedades no en DTO se mantienen igual
    Object.assign(tumorType, updateTumorTypeDto);
    
    // PASO 4: Guardar en BD
    // .save() detecta que existe (por el ID) y ACTUALIZA
    // En SQL: UPDATE tumor_type SET name=?, system_affected=? WHERE id=?;
    const updatedTumorType = await this.tumorTypeRepository.save(tumorType);
    
    // PASO 5: Retornar transformado a DTO
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
  async remove(id: number): Promise<void> {
    // PASO 1: Verificar que existe
    const tumorType = await this.tumorTypeRepository.findOne({ where: { id } });
    
    if (!tumorType) {
      throw new NotFoundException(`Tipo de tumor con ID ${id} no encontrado`);
    }

    // PASO 2: Eliminar
    // .remove() elimina físicamente de la BD
    // En SQL: DELETE FROM tumor_type WHERE id=?;
    await this.tumorTypeRepository.remove(tumorType);
  }
}