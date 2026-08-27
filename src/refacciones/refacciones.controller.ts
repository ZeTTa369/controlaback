import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  ParseIntPipe 
} from '@nestjs/common';
import { RefaccionesService } from './refacciones.service';
import { CreateRefaccionDto } from './dto/create-refaccion.dto';
import { UpdateRefaccionDto } from './dto/update-refaccion.dto';

@Controller('refacciones')
export class RefaccionesController {
  constructor(private readonly refaccionesService: RefaccionesService) {}

  @Post()
  create(@Body() createRefaccionDto: CreateRefaccionDto) {
    return this.refaccionesService.create(createRefaccionDto);
  }

  @Get()
  findAll(
    @Query('id_edificio') id_edificio?: number,
    @Query('id_departamento') id_departamento?: number,
    @Query('estado') estado?: string,
  ) {
    return this.refaccionesService.findAll({ id_edificio, id_departamento, estado });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.refaccionesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateRefaccionDto: UpdateRefaccionDto
  ) {
    return this.refaccionesService.update(id, updateRefaccionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.refaccionesService.remove(id);
  }
}