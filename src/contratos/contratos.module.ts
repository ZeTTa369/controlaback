import { Module } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContratosController],
  providers: [ContratosService, TasksService], // <-- Agregar aquí
  exports: [ContratosService, TasksService],
})
export class ContratosModule {}