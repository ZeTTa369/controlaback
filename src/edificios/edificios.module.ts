import { Module } from '@nestjs/common';
import { EdificiosController } from './edificios.controller';
import { EdificiosService } from './edificios.service';
import { UploadModule } from '../upload/upload.module'; 

@Module({
  controllers: [EdificiosController],
  providers: [EdificiosService]
})
export class EdificiosModule {}
