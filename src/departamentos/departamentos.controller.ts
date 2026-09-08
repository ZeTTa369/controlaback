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

@Controller('departamentos')
export class DepartamentosController {
  constructor(
    private readonly departamentosService: DepartamentosService,
    private readonly uploadService: UploadService,
  ) {}

  // PÚBLICO: Listado de unidades para el catálogo
  @Get()
  findAll() {
    return this.departamentosService.findAll();
  }

  // PÚBLICO: Detalle de una unidad
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.findOne(id);
  }

  // PÚBLICO: Ver las fotos del departamento en el catálogo
  @Get(':id/fotos')
  obtenerFotos(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.obtenerFotosPorDepartamento(id);
  }

  // PROTEGIDO: Crear departamento
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDepartamentoDto: CreateDepartamentoDto) {
    return this.departamentosService.create(createDepartamentoDto);
  }

  // PROTEGIDO: Actualizar departamento
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartamentoDto: UpdateDepartamentoDto,
  ) {
    return this.departamentosService.update(id, updateDepartamentoDto);
  }

  // PROTEGIDO: Eliminar departamento
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.remove(id);
  }

  // ================= ENDPOINTS DE FOTOS =================

  // PROTEGIDO: Subir fotos a Cloudinary
  @UseGuards(JwtAuthGuard)
  @Post(':id/fotos')
  @UseInterceptors(FilesInterceptor('fotos', 10))
  async subirFotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const fotosSubidas = await this.uploadService.uploadMultipleImages(files, 'departamentos');
    return this.departamentosService.guardarFotos(id, fotosSubidas);
  }

  // PROTEGIDO: Eliminar foto
  @UseGuards(JwtAuthGuard)
  @Delete('fotos/:idFoto')
  eliminarFoto(@Param('idFoto', ParseIntPipe) idFoto: number) {
    return this.departamentosService.eliminarFoto(idFoto);
  }
}