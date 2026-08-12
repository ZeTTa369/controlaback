import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CobrosService } from './cobros.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cobros')
export class CobrosController {
  constructor(private readonly cobrosService: CobrosService) {}

  @Get()
  @Roles(1, 2, 3)
  findAll() {
    return this.cobrosService.findAll();
  }

  @Get(':id')
  @Roles(1, 2, 3)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cobrosService.findOne(id);
  }

  @Post(':id/pagar')
  @Roles(1, 2, 3)
  registrarPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { monto: number; metodo_pago: string; comprobante?: string },
  ) {
    return this.cobrosService.registrarPago(id, body.monto, body.metodo_pago, body.comprobante);
  }
}