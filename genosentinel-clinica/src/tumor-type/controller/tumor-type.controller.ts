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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TumorTypeService } from '../service/tumor-type.service';
import { CreateTumorTypeDto } from '../dto/create-tumor-type.dto';
import { UpdateTumorTypeDto } from '../dto/update-tumor-type.dto';
import { TumorTypeResponseDto } from '../dto/tumor-type-response.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

// Controlador REST para gestión de tipos de tumor
@ApiTags('tumor-types')
@Controller('tumor-types')
export class TumorTypeController {
  constructor(private readonly tumorTypeService: TumorTypeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tipo de tumor' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de tumor creado exitosamente',
    type: TumorTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe un tipo de tumor con ese nombre' })
  create(@Body() createTumorTypeDto: CreateTumorTypeDto): Promise<TumorTypeResponseDto> {
    return this.tumorTypeService.create(createTumorTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de tumor' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de tumor obtenida exitosamente',
    type: [TumorTypeResponseDto],
  })
  findAll(): Promise<TumorTypeResponseDto[]> {
    return this.tumorTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de tumor por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo de tumor', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tipo de tumor encontrado',
    type: TumorTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tipo de tumor no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TumorTypeResponseDto> {
    return this.tumorTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de tumor existente' })
  @ApiParam({ name: 'id', description: 'ID del tipo de tumor', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tipo de tumor actualizado exitosamente',
    type: TumorTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tipo de tumor no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe un tipo de tumor con ese nombre' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTumorTypeDto: UpdateTumorTypeDto,
  ): Promise<TumorTypeResponseDto> {
    return this.tumorTypeService.update(id, updateTumorTypeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un tipo de tumor' })
  @ApiParam({ name: 'id', description: 'ID del tipo de tumor', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tipo de tumor eliminado exitosamente',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tipo de tumor no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseDto> {
    await this.tumorTypeService.remove(id);
    return new ApiResponseDto(true, 'Tipo de tumor eliminado exitosamente', null);
  }
}