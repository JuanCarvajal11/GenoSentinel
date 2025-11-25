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
import { ClinicalRecordService } from '../service/clinical-record.service';
import { CreateClinicalRecordDto } from '../dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from '../dto/update-clinical-record.dto';
import { ClinicalRecordResponseDto } from '../dto/clinical-record-response.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

// Controlador REST para gestión de historias clínicas
@ApiTags('clinical-records')
@Controller('clinical-records')
export class ClinicalRecordController {
  constructor(private readonly clinicalRecordService: ClinicalRecordService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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

  // Obtener todas las historias de un paciente
  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Obtener historias clínicas de un paciente' })
  @ApiParam({ name: 'patientId', description: 'UUID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Historias obtenidas exitosamente',
    type: [ClinicalRecordResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  findByPatient(@Param('patientId') patientId: string): Promise<ClinicalRecordResponseDto[]> {
    return this.clinicalRecordService.findByPatient(patientId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una historia clínica' })
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