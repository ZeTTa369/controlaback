import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, 
  UseGuards 
} from '@nestjs/common';
import { EdificiosService } from './edificios.service';
import { CreateEdificioDto } from './dto/create-edificio.dto';
import { UpdateEdificioDto } from './dto/update-edificio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('edificios')
export class EdificiosController {
  constructor(private readonly edificiosService: EdificiosService) {}

  // PÚBLICO: Para el catálogo de visitantes
  @Get()
  findAll() {
    return this.edificiosService.findAll();
  }

  // PÚBLICO: Para ver el detalle de un edificio
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.edificiosService.findOne(id);
  }

  // PROTEGIDO: Solo usuarios autenticados
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createEdificioDto: CreateEdificioDto) {
    return this.edificiosService.create(createEdificioDto);
  }

  // PROTEGIDO: Solo usuarios autenticados
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEdificioDto: UpdateEdificioDto,
  ) {
    return this.edificiosService.update(id, updateEdificioDto);
  }

  // PROTEGIDO: Solo usuarios autenticados
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.edificiosService.remove(id);
  }
}