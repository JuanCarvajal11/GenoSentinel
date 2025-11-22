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

/**
 * Controlador REST para gestionar operaciones relacionadas con pacientes
 * 
 * ¿QUÉ ES UN CONTROLADOR?
 * Es el responsable de:
 * 1. Recibir HTTP requests
 * 2. Validar entrada con DTOs
 * 3. Llamar al servicio para lógica
 * 4. Retornar HTTP responses
 * 
 * ¿POR QUÉ no accedemos directamente a BD desde aquí?
 * Mantiene responsabilidades separadas:
 * - Controller: HTTP, validación, ruteo
 * - Service: Lógica de negocio, BD
 * - Entity: Estructura de datos
 * 
 * PATRÓN REST:
 * POST   /pacientes      → Create (201)
 * GET    /pacientes      → Read all (200)
 * GET    /pacientes/:id  → Read one (200)
 * PATCH  /pacientes/:id  → Update (200)
 * DELETE /pacientes/:id  → Delete (200 o 204)
 */
@Controller('patients') // Ruta base: http://localhost:3000/patients
export class PatientController {
  /**
   * @ApiTags('patients')
   * 
   * DECORADOR SWAGGER: Agrupa todos estos endpoints bajo la etiqueta 'patients' en Swagger UI
   * En Swagger aparecerá: [▼ patients] con todos los métodos de este controlador
   * Ayuda a organizar documentación cuando hay muchos controladores
   */
  // Nota: @ApiTags va al nivel de la clase, no de métodos

  /**
   * Constructor con inyección de dependencias
   * 
   * Inyecta PatientService automáticamente (NestJS contenedor de DI)
   * @param patientService - Servicio con lógica de negocio de pacientes
   */
  constructor(private readonly patientService: PatientService) {}

  /**
   * POST /patients - Crear un nuevo paciente
   * 
   * @Post() - DECORADOR HTTP: Marca que este método responde a POST requests
   * En HTTP, POST es para CREAR nuevos recursos (no es idempotente)
   * 
   * ¿QUÉ HACE ESTE ENDPOINT?
   * 1. Cliente envía: POST /patients + JSON body con datos del paciente
   * 2. NestJS valida JSON contra CreatePatientDto (schema validation)
   * 3. Si inválido → 400 Bad Request
   * 4. Si válido → Llamamos this.patientService.create()
   * 5. Servicio inserta en BD
   * 6. Retornamos: 201 Created + JSON con paciente creado
   */
  @Post()
  /**
   * @HttpCode(HttpStatus.CREATED)
   * 
   * DECORADOR: Especifica código HTTP de respuesta exitosa
   * HttpStatus.CREATED = 201 (creación exitosa)
   * Por defecto POST retorna 200, aquí lo cambiamos a 201 (más semántico)
   * 
   * Códigos HTTP comunes:
   * - 200 OK: Operación exitosa
   * - 201 Created: Recurso creado
   * - 204 No Content: Exitoso pero sin body
   * - 400 Bad Request: Datos inválidos
   * - 404 Not Found: No existe
   * - 500 Server Error: Error interno
   */
  @HttpCode(HttpStatus.CREATED)
  /**
   * @ApiOperation({ summary: '...' })
   * 
   * DECORADOR SWAGGER: Documentación de qué hace este endpoint
   * Aparece en Swagger como el título/descripción del endpoint
   */
  @ApiOperation({ summary: 'Crear un nuevo paciente' })
  /**
   * @ApiResponse({ status: 201, description: '...', type: PatientResponseDto })
   * 
   * DECORADOR SWAGGER: Documenta posibles respuestas
   * - status: código HTTP
   * - description: qué significa esa respuesta
   * - type: TypeScript class que define la estructura JSON
   * 
   * En Swagger UI, el usuario ve:
   * ✓ 201: Paciente creado exitosamente
   *   {
   *     "id": "uuid",
   *     "firstName": "string",
   *     ...
   *   }
   */
  @ApiResponse({
    status: 201,
    description: 'Paciente creado exitosamente',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  /**
   * Parámetro del método: @Body() createPatientDto: CreatePatientDto
   * 
   * @Body() - DECORADOR: Extrae JSON del request body
   * createPatientDto - Variable local que recibe los datos
   * : CreatePatientDto - TypeScript type que valida la estructura
   * 
   * NestJS automáticamente:
   * 1. Lee JSON del body
   * 2. Valida contra decoradores en CreatePatientDto (class-validator)
   * 3. Si inválido: 400 Bad Request
   * 4. Si válido: Pasa el objeto createPatientDto a la función
   * 
   * Ejemplo request:
   * POST /patients
   * Content-Type: application/json
   * 
   * {
   *   "firstName": "Juan",
   *   "lastName": "Pérez",
   *   "birthDate": "1990-01-15",
   *   "gender": "M",
   *   "status": "Activo"
   * }
   */
  create(@Body() createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    // Llamamos el servicio que ejecuta lógica de negocio y BD
    // El servicio retorna Promise<PatientResponseDto>
    // NestJS automáticamente:
    // 1. Espera la Promise
    // 2. Convierte el objeto PatientResponseDto a JSON
    // 3. Envía HTTP response 201 con el JSON
    return this.patientService.create(createPatientDto);
  }

  /**
   * GET /patients - Obtener todos los pacientes
   * 
   * @Get() - DECORADOR HTTP: Responde a GET requests
   * GET es IDEMPOTENTE (llamarlo 100 veces = misma respuesta)
   * GET nunca debe modificar datos
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los pacientes' })
  /**
   * @ApiResponse({ status: 200, description: '...', type: [PatientResponseDto] })
   * 
   * type: [PatientResponseDto] - Arrays se indican con [ ]
   * En Swagger muestra un array de objetos PatientResponseDto
   */
  @ApiResponse({
    status: 200,
    description: 'Lista de pacientes obtenida exitosamente',
    type: [PatientResponseDto],
  })
  findAll(): Promise<PatientResponseDto[]> {
    return this.patientService.findAll();
  }

  /**
   * GET /patients/:id - Obtener un paciente específico por ID
   * 
   * @Get(':id') - DECORADOR HTTP: ':id' es un path parameter
   * Si cliente llama GET /patients/550e8400-e29b-41d4-a716-446655440000
   * El :id se reemplaza por ese UUID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un paciente por ID' })
  /**
   * @ApiParam({ name: 'id', description: '...' })
   * 
   * DECORADOR SWAGGER: Documenta los path parameters
   * En Swagger muestra un input donde puedes ingresar el :id
   */
  @ApiParam({ name: 'id', description: 'UUID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Paciente encontrado',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  /**
   * Parámetro: @Param('id') id: string
   * 
   * @Param() - DECORADOR: Extrae path parameter :id
   * @Param('id') - Especifica cuál parámetro extraer (por nombre)
   * id: string - Variable local que recibe el valor del :id
   */
  findOne(@Param('id') id: string): Promise<PatientResponseDto> {
    return this.patientService.findOne(id);
  }

  /**
   * PATCH /patients/:id - Actualizar un paciente existente
   * 
   * @Patch() - DECORADOR HTTP: PATCH es para actualizaciones parciales
   * 
   * PATCH vs PUT:
   * - PUT: Reemplaza recurso completo (envía todos los campos)
   * - PATCH: Actualiza parcialmente (envías solo lo que cambias)
   * 
   * En nuestro caso usamos PATCH porque UpdatePatientDto tiene @IsOptional()
   * en todos los campos.
   */
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
  /**
   * Parámetros:
   * @Param('id') id: string - Path parameter :id
   * @Body() updatePatientDto: UpdatePatientDto - JSON body con campos a actualizar
   */
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientService.update(id, updatePatientDto);
  }

  /**
   * DELETE /patients/:id - Desactivar un paciente (soft delete)
   * 
   * @Delete() - DECORADOR HTTP: Responde a DELETE requests
   * DELETE es para eliminar/desactivar recursos
   * 
   * NOTA: Implementamos soft delete (cambiar estado a Inactivo)
   * En lugar de hard delete (eliminar físicamente)
   * Por razones de auditoría y cumplimiento legal
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  /**
   * @HttpCode(HttpStatus.OK)
   * 
   * Por defecto DELETE retorna 204 No Content (exitoso, sin body)
   * Aquí retornamos 200 OK porque devolvemos datos (paciente desactivado)
   * Si no devolviéramos datos, usaríamos 204 No Content
   */
  @ApiOperation({ summary: 'Desactivar un paciente (cambiar estado a Inactivo)' })
  @ApiParam({ name: 'id', description: 'UUID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Paciente desactivado exitosamente',
    type: ApiResponseDto<PatientResponseDto>,
  })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  /**
   * async - Marca que esta función retorna Promise
   * Necesario porque usamos await internamente
   */
  async deactivate(@Param('id') id: string): Promise<ApiResponseDto<PatientResponseDto>> {
    const patient = await this.patientService.deactivate(id);
    // Retornamos respuesta estandarizada con contexto
    return new ApiResponseDto(true, 'Paciente desactivado exitosamente', patient);
  }
}