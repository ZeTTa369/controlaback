import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  registrarPago(@Body() createPagoDto: any) {
    return this.pagosService.registrarPago(createPagoDto);
  }
}