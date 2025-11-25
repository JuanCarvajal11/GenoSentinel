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
import { PatientService } from '../service/patient.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { PatientResponseDto } from '../dto/patient-response.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

// Controlador REST para gestión de pacientes
@ApiTags('patients')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo paciente' })
  @ApiResponse({
    status: 201,
    description: 'Paciente creado exitosamente',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    return this.patientService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los pacientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacientes obtenida exitosamente',
    type: [PatientResponseDto],
  })
  findAll(): Promise<PatientResponseDto[]> {
    return this.patientService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un paciente por ID' })
  @ApiParam({ name: 'id', description: 'UUID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Paciente encontrado',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  findOne(@Param('id') id: string): Promise<PatientResponseDto> {
    return this.patientService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un paciente existente' })
  @ApiParam({ name: 'id', description: 'UUID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Paciente actualizado exitosamente',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientService.update(id, updatePatientDto);
  }

  // Soft delete: cambiar estado a Inactivo (por auditoría)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar un paciente' })
  @ApiParam({ name: 'id', description: 'UUID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Paciente desactivado exitosamente',
    type: ApiResponseDto<PatientResponseDto>,
  })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async deactivate(@Param('id') id: string): Promise<ApiResponseDto<PatientResponseDto>> {
    const patient = await this.patientService.deactivate(id);
    return new ApiResponseDto(true, 'Paciente desactivado exitosamente', patient);
  }
}