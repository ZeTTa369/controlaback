import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  ParseIntPipe, 
  UseGuards 
} from '@nestjs/common';
import { HabitantesService } from './habitantes.service';
import { CreateHabitanteDto } from './dto/create-habitante.dto';

@Controller('habitantes')
export class HabitantesController {
  constructor(private readonly habitantesService: HabitantesService) {}

  @Post()
  create(@Body() createHabitanteDto: CreateHabitanteDto) {
    return this.habitantesService.create(createHabitanteDto);
  }

  @Post('batch')
  createMany(@Body() dtos: CreateHabitanteDto[]) {
    return this.habitantesService.createMany(dtos);
  }

  @Get('contrato/:idContrato')
  findByContrato(@Param('idContrato', ParseIntPipe) idContrato: number) {
    return this.habitantesService.findByContrato(idContrato);
  }

  @Get('departamento/:idDepartamento')
  findByDepartamento(@Param('idDepartamento', ParseIntPipe) idDepartamento: number) {
    return this.habitantesService.findByDepartamento(idDepartamento);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.habitantesService.remove(id);
  }
}