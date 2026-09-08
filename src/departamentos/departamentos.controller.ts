import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, 
  UseGuards,
  UseInterceptors,
  UploadedFiles
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from '../upload/upload.service';

@UseGuards(JwtAuthGuard)
@Controller('departamentos')
export class DepartamentosController {
  constructor(
    private readonly departamentosService: DepartamentosService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  create(@Body() createDepartamentoDto: CreateDepartamentoDto) {
    return this.departamentosService.create(createDepartamentoDto);
  }

  @Get()
  findAll() {
    return this.departamentosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartamentoDto: UpdateDepartamentoDto,
  ) {
    return this.departamentosService.update(id, updateDepartamentoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.remove(id);
  }

  // ================= ENDPOINTS DE FOTOS =================

  // 1. Subir lote de fotos a Cloudinary y guardar referencias
  @Post(':id/fotos')
  @UseInterceptors(FilesInterceptor('fotos', 10)) // hasta 10 fotos por tanda
  async subirFotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const fotosSubidas = await this.uploadService.uploadMultipleImages(files, 'departamentos');
    return this.departamentosService.guardarFotos(id, fotosSubidas);
  }

  // 2. Obtener galería de fotos activas de un departamento
  @Get(':id/fotos')
  obtenerFotos(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.obtenerFotosPorDepartamento(id);
  }

  // 3. Eliminar (baja lógica) una foto específica
  @Delete('fotos/:idFoto')
  eliminarFoto(@Param('idFoto', ParseIntPipe) idFoto: number) {
    return this.departamentosService.eliminarFoto(idFoto);
  }
}