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
import { ConceptosService } from './conceptos.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conceptos')
export class ConceptosController {
  constructor(private readonly conceptosService: ConceptosService) {}

  @Post()
  @Roles(1) // Solo Administradores
  create(@Body() dto: CreateConceptoDto) {
    return this.conceptosService.create(dto);
  }

  @Get()
  @Roles(1, 2, 3)
  findAll() {
    return this.conceptosService.findAll();
  }

  @Get(':id')
  @Roles(1, 2, 3)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.conceptosService.findOne(id);
  }

  @Patch(':id')
  @Roles(1)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateConceptoDto) {
    return this.conceptosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(1)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.conceptosService.remove(id);
  }
}