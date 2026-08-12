import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { RefaccionesService } from './refacciones.service';
import { CreateRefaccionDto } from './dto/create-refaccion.dto';
import { UpdateRefaccionDto } from './dto/update-refaccion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('refacciones')
export class RefaccionesController {
  constructor(private readonly refaccionesService: RefaccionesService) {}

  @Post()
  @Roles(1, 2, 3) // Todos los roles pueden registrar un reporte de refacción
  create(@Body() createRefaccionDto: CreateRefaccionDto) {
    return this.refaccionesService.create(createRefaccionDto);
  }

  @Get()
  @Roles(1, 2, 3)
  findAll() {
    return this.refaccionesService.findAll();
  }

  @Patch(':id')
  @Roles(1, 2) // Solo ADMIN y CONSERJE_JEFE actualizan costos reales y estados
  update(@Param('id') id: string, @Body() updateRefaccionDto: UpdateRefaccionDto) {
    return this.refaccionesService.update(+id, updateRefaccionDto);
  }
}