import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  async registrarPago(dto: any) {
    const idBigInt = BigInt(dto.id_cobro);
    const cobro = await this.prisma.cobro.findUnique({ where: { id_cobro: idBigInt } });

    if (!cobro) throw new NotFoundException(`Cobro ${dto.id_cobro} no encontrado.`);

    const nuevoPago = await this.prisma.pago.create({
      data: {
        id_cobro: idBigInt,
        monto_pagado: new Prisma.Decimal(dto.monto.toString()),
        moneda: cobro.moneda || 'BOB',
        metodo_pago: dto.metodo_pago || 'EFECTIVO',
        comprobante: dto.comprobante || null,
        fecha_pago: new Date(),
        estado: 'COMPLETADO',
      },
    });

    const pagos = await this.prisma.pago.findMany({ where: { id_cobro: idBigInt } });
    const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto_pagado || 0), 0);
    const montoTotal = Number(cobro.monto || 0);

    if (totalPagado >= montoTotal) {
      await this.prisma.cobro.update({
        where: { id_cobro: idBigInt },
        data: { estado: 'PAGADO', updated_date: new Date() },
      });
    }

    return nuevoPago;
  }
}