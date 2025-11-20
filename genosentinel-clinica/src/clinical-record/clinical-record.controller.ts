import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ClinicalRecordService } from './clinical-record.service';
import { CreateClinicalRecordDto } from './dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from './dto/update-clinical-record.dto';
import { ClinicalRecordResponseDto } from './dto/clinical-record-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

/**
 * Controlador REST para gestionar las operaciones relacionadas con historias clínicas
 */
@ApiTags('clinical-records') // Etiqueta para agrupar endpoints en Swagger
@Controller('clinical-records') // Ruta base: /clinical-records
export class ClinicalRecordController {
  /**
   * Constructor que inyecta el servicio de historias clínicas
   * @param clinicalRecordService - Servicio con la lógica de negocio
   */
  constructor(private readonly clinicalRecordService: ClinicalRecordService) {}

  /**
   * Endpoint POST para crear una nueva historia clínica
   * Ruta: POST /clinical-records
   */
  @Post()
  @HttpCode(HttpStatus.CREATED) // Código HTTP 201
  @ApiOperation({ summary: 'Crear una nueva historia clínica' })
  @ApiResponse({
    status: 201,
    description: 'Historia clínica creada exitosamente',
    type: ClinicalRecordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Paciente o tipo de tumor no encontrado' })
  create(
    @Body() createClinicalRecordDto: CreateClinicalRecordDto,
  ): Promise<ClinicalRecordResponseDto> {
    return this.clinicalRecordService.create(createClinicalRecordDto);
  }

  /**
   * Endpoint GET para obtener todas las historias clínicas
   * Ruta: GET /clinical-records
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las historias clínicas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de historias clínicas obtenida exitosamente',
    type: [ClinicalRecordResponseDto],
  })
  findAll(): Promise<ClinicalRecordResponseDto[]> {
    return this.clinicalRecordService.findAll();
  }

  /**
   * Endpoint GET para obtener una historia clínica por ID
   * Ruta: GET /clinical-records/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una historia clínica por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la historia clínica' })
  @ApiResponse({
    status: 200,
    description: 'Historia clínica encontrada',
    type: ClinicalRecordResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Historia clínica no encontrada' })
  findOne(@Param('id') id: string): Promise<ClinicalRecordResponseDto> {
    return this.clinicalRecordService.findOne(id);
  }

  /**
   * Endpoint GET para obtener todas las historias clínicas de un paciente
   * Ruta: GET /clinical-records/patient/:patientId
   */
  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Obtener todas las historias clínicas de un paciente' })
  @ApiParam({ name: 'patientId', description: 'UUID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Lista de historias clínicas del paciente obtenida exitosamente',
    type: [ClinicalRecordResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  findByPatient(@Param('patientId') patientId: string): Promise<ClinicalRecordResponseDto[]> {
    return this.clinicalRecordService.findByPatient(patientId);
  }

  /**
   * Endpoint PATCH para actualizar una historia clínica
   * Ruta: PATCH /clinical-records/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una historia clínica existente' })
  @ApiParam({ name: 'id', description: 'UUID de la historia clínica' })
  @ApiResponse({
    status: 200,
    description: 'Historia clínica actualizada exitosamente',
    type: ClinicalRecordResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Historia clínica no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  update(
    @Param('id') id: string,
    @Body() updateClinicalRecordDto: UpdateClinicalRecordDto,
  ): Promise<ClinicalRecordResponseDto> {
    return this.clinicalRecordService.update(id, updateClinicalRecordDto);
  }

  /**
   * Endpoint DELETE para eliminar una historia clínica
   * Ruta: DELETE /clinical-records/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una historia clínica' })
  @ApiParam({ name: 'id', description: 'UUID de la historia clínica' })
  @ApiResponse({
    status: 200,
    description: 'Historia clínica eliminada exitosamente',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Historia clínica no encontrada' })
  async remove(@Param('id') id: string): Promise<ApiResponseDto> {
    await this.clinicalRecordService.remove(id);
    return new ApiResponseDto(true, 'Historia clínica eliminada exitosamente', null);
  }
}