import { Module } from '@nestjs/common';
import { HabitantesService } from './habitantes.service';
import { HabitantesController } from './habitantes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HabitantesController],
  providers: [HabitantesService],
  exports: [HabitantesService],
})
export class HabitantesModule {}