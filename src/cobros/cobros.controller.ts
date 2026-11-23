import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  ParseIntPipe, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CobrosService } from './cobros.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadService } from '../upload/upload.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cobros')
export class CobrosController {
  constructor(
    private readonly cobrosService: CobrosService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @Roles(1, 2, 3)
  findAll() {
    return this.cobrosService.findAll();
  }

  @Get(':id')
  @Roles(1, 2, 3)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cobrosService.findOne(id);
  }

  @Post(':id/pagar')
  @Roles(1, 2, 3)
  registrarPago(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      monto: number;
      metodo_pago: string;
      comprobante?: string;
      nuevo_monto?: number;
      motivo_ajuste?: string;
    },
  ) {
    return this.cobrosService.registrarPago(id, body);
  }

  @Post('subir-recibo-pdf')
  @Roles(1, 2, 3)
  @UseInterceptors(FileInterceptor('recibo'))
  async subirReciboPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió el archivo PDF del recibo');
    }

    const resultados = await this.uploadService.uploadMultipleFiles([file], 'recibos');
    const subido = resultados[0];

    return {
      url: subido.url,
      id_publico: subido.id_publico,
    };
  }

  @Patch('actualizar-lote')
  @Roles(1, 2, 3)
  actualizarMontosLote(
    @Body('items')
    items: { id_cobro: number; monto: number; motivo_ajuste?: string }[],
  ) {
    return this.cobrosService.actualizarMontosLote(items);
  }
}