import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TumorType } from './entities/tumor-type.entity';
import { TumorTypeService } from './service/tumor-type.service';
import { TumorTypeController } from './controller/tumor-type.controller';

/**
 * Módulo que agrupa toda la funcionalidad relacionada con tipos de tumor
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([TumorType]), // Registra el repositorio de TumorType
  ],
  controllers: [TumorTypeController], // Registra el controlador
  providers: [TumorTypeService], // Registra el servicio
  exports: [TumorTypeService], // Exporta el servicio para uso en otros módulos
})
export class TumorTypeModule {}