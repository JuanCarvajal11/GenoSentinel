import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TumorType } from './entities/tumor-type.entity';
import { TumorTypeService } from './service/tumor-type.service';
import { TumorTypeController } from './controller/tumor-type.controller';

// Módulo para gestión de tipos de tumor
@Module({
  imports: [TypeOrmModule.forFeature([TumorType])],
  controllers: [TumorTypeController],
  providers: [TumorTypeService],
  exports: [TumorTypeService],
})
export class TumorTypeModule {}