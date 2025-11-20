import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO (Data Transfer Object) genérico para respuestas estandarizadas de la API
 * 
 * ¿POR QUÉ? Un DTO proporciona un contrato consistente entre el backend y frontend,
 * definiendo exactamente qué datos se envían y cómo se formatean.
 * 
 * <T = any> es un genérico que permite reutilizar esta clase con cualquier tipo de dato.
 * Ejemplo: ApiResponseDto<PatientResponseDto>, ApiResponseDto<string>, etc.
 */
export class ApiResponseDto<T = any> {
  /**
   * @ApiProperty() - Decorador de Swagger/NestJS que documenta propiedades en la API
   * 
   * ¿POR QUÉ? Permite que Swagger genere documentación automática sobre los campos
   * que devuelve la API, con ejemplos y descripciones.
   * 
   * Propiedades del decorador:
   * - description: Texto explicativo que aparece en Swagger
   * - example: Valor de ejemplo que mostrará Swagger
   * - nullable: Permite que el campo sea null
   * - type: Especifica el tipo de dato (string, number, boolean, etc.)
   */
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo de la operación realizada',
    example: 'Operación completada exitosamente',
    type: String,
  })
  message: string;

  @ApiProperty({
    description: 'Datos de la respuesta (puede ser null cuando no hay datos)',
    nullable: true,
    type: 'object',
  })
  data: T | null;

  @ApiProperty({
    description: 'Timestamp ISO 8601 que indica cuándo se generó la respuesta',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
  })
  timestamp: Date;

  /**
   * Constructor que inicializa una respuesta estandarizada
   * 
   * @param success - Boolean indicando éxito o fallo
   * @param message - Texto descriptivo para el cliente
   * @param data - Datos opcionales a retornar (null por defecto)
   */
  constructor(success: boolean, message: string, data: T | null = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    // new Date() genera el timestamp actual en ISO 8601
    this.timestamp = new Date();
  }
}
