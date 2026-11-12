import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Patch
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from '../upload/upload.service';

@UseGuards(JwtAuthGuard)
@Controller('contratos')
export class ContratosController {
  constructor(
    private readonly contratosService: ContratosService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  create(@Body() createContratoDto: CreateContratoDto) {
    return this.contratosService.create(createContratoDto);
  }

  @Get()
  findAll() {
    return this.contratosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contratosService.findOne(id);
  }

  // ================= ENDPOINTS DE DOCUMENTOS (PDF / IMAGENES) =================

  @Get(':id/documentos')
  obtenerDocumentos(@Param('id', ParseIntPipe) id: number) {
    return this.contratosService.obtenerDocumentosPorContrato(id);
  }

  @Post(':id/documentos')
  @UseInterceptors(FilesInterceptor('documentos', 10))
  async subirDocumentos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('nombres') nombresRaw?: string | string[],
  ) {
    const archivosSubidos = await this.uploadService.uploadMultipleFiles(files, 'contratos');

    // Parsear las etiquetas enviadas desde el frontend
    let nombresList: string[] = [];
    if (Array.isArray(nombresRaw)) {
      nombresList = nombresRaw;
    } else if (typeof nombresRaw === 'string') {
      try {
        const parsed = JSON.parse(nombresRaw);
        nombresList = Array.isArray(parsed) ? parsed : [nombresRaw];
      } catch {
        nombresList = [nombresRaw];
      }
    }

    const payloadBD = archivosSubidos.map((file, idx) => ({
      url: file.url,
      id_publico: file.id_publico,
      nombre: nombresList[idx] || file.originalName || `Documento_${idx + 1}`,
      tipo_archivo: file.mimetype?.includes('pdf') ? 'PDF' : 'IMAGEN',
    }));

    return this.contratosService.guardarDocumentos(id, payloadBD);
  }

  @Delete('documentos/:idDocumento')
  eliminarDocumento(@Param('idDocumento', ParseIntPipe) idDocumento: number) {
    return this.contratosService.eliminarDocumento(idDocumento);
  }

  @Patch(':id/finalizar')
  finalizar(
    @Param('id', ParseIntPipe) id: number,
    @Body('fecha_fin') fechaFin: string,
  ) {
    return this.contratosService.finalizarContrato(id, fechaFin);
  }
}