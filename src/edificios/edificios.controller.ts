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

@UseGuards(JwtAuthGuard)
@Controller('edificios')
export class EdificiosController {
  constructor(private readonly edificiosService: EdificiosService) {}

  @Post()
  create(@Body() createEdificioDto: CreateEdificioDto) {
    return this.edificiosService.create(createEdificioDto);
  }

  @Get()
  findAll() {
    return this.edificiosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.edificiosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEdificioDto: UpdateEdificioDto,
  ) {
    return this.edificiosService.update(id, updateEdificioDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.edificiosService.remove(id);
  }
}