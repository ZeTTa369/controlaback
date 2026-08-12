import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CobrosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const cobros = await this.prisma.cobro.findMany({
      orderBy: [
      { periodo_anio: 'asc' },
      { periodo_mes: 'asc' },
    ],
    });

    if (cobros.length === 0) return [];

    const idsCobros = cobros.map((c) => c.id_cobro);

    const pagos = await this.prisma.pago.findMany({
      where: {
        id_cobro: { in: idsCobros },
      },
    });

    const pagosMap = new Map<string, any[]>();
    for (const pago of pagos) {
      if (!pago.id_cobro) continue;
      const key = pago.id_cobro.toString();
      if (!pagosMap.has(key)) {
        pagosMap.set(key, []);
      }
      pagosMap.get(key)!.push(pago);
    }

    return cobros.map((cobro) => {
      const key = cobro.id_cobro.toString();
      const pagosDelCobro = pagosMap.get(key) || [];
      const montoTotal = Number(cobro.monto || 0);
      const totalPagado = pagosDelCobro.reduce((sum, p) => sum + Number(p.monto_pagado || 0), 0);

      return {
        ...this.mapCobroResponse(cobro),
        total_pagado: totalPagado,
        saldo_pendiente: montoTotal - totalPagado,
        pagos: pagosDelCobro.map((p) => ({
          id_pago: p.id_pago.toString(),
          monto_pagado: Number(p.monto_pagado),
          metodo_pago: p.metodo_pago,
          comprobante: p.comprobante,
          fecha_pago: p.fecha_pago,
        })),
      };
    });
  }

  async findOne(id: number) {
    const idCobroBigInt = BigInt(id);

    const cobro = await this.prisma.cobro.findUnique({
      where: { id_cobro: idCobroBigInt },
    });

    if (!cobro) throw new NotFoundException(`Cobro con ID ${id} no encontrado.`);

    const pagos = await this.prisma.pago.findMany({
      where: { id_cobro: idCobroBigInt },
      orderBy: { fecha_pago: 'desc' },
    });

    const montoTotal = Number(cobro.monto || 0);
    const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto_pagado || 0), 0);

    return {
      ...this.mapCobroResponse(cobro),
      total_pagado: totalPagado,
      saldo_pendiente: montoTotal - totalPagado,
      pagos: pagos.map((p) => ({
        id_pago: p.id_pago.toString(),
        monto_pagado: Number(p.monto_pagado),
        metodo_pago: p.metodo_pago,
        comprobante: p.comprobante,
        fecha_pago: p.fecha_pago,
      })),
    };
  }

  async registrarPago(idCobro: number, monto: number, metodoPago: string, comprobante?: string) {
    const idBigInt = BigInt(idCobro);
    const cobro = await this.prisma.cobro.findUnique({ where: { id_cobro: idBigInt } });

    if (!cobro) throw new NotFoundException(`Cobro ${idCobro} no encontrado.`);

    const nuevoPago = await this.prisma.pago.create({
      data: {
        id_cobro: idBigInt,
        monto_pagado: new Prisma.Decimal(monto.toString()),
        moneda: cobro.moneda || 'BOB',
        metodo_pago: metodoPago || 'EFECTIVO',
        comprobante: comprobante || null,
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

  private mapCobroResponse(c: any) {
    return {
      id_cobro: c.id_cobro.toString(),
      id_contrato: c.id_contrato ? c.id_contrato.toString() : null,
      id_concepto: c.id_concepto,
      descripcion: c.descripcion,
      monto: Number(c.monto || 0),
      moneda: c.moneda,
      periodo_mes: c.periodo_mes,
      periodo_anio: c.periodo_anio,
      fecha_emision: c.fecha_emision,
      fecha_vencimiento: c.fecha_vencimiento,
      estado: c.estado,
    };
  }
}