import { Module } from '@nestjs/common';
import { CobrosService } from './cobros.service';
import { CobrosController } from './cobros.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CobrosController],
  providers: [CobrosService],
  exports: [CobrosService],
})
export class CobrosModule {}