import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface RegistrarPagoParams {
  monto: number;
  metodo_pago: string;
  comprobante?: string;
  nuevo_monto?: number;
  motivo_ajuste?: string;
  id_usuario?: number;
}

// Mapeo seguro de campos reales en la tabla cobro
const COBRO_SELECT_FIELDS = {
  id_cobro: true,
  id_contrato: true,
  id_concepto: true,
  descripcion: true,
  monto: true,
  monto_original: true,
  motivo_ajuste: true,
  id_usuario: true,
  moneda: true,
  periodo_mes: true,
  periodo_anio: true,
  fecha_emision: true,
  fecha_vencimiento: true,
  estado: true,
  created_date: true,
  updated_date: true,
};

@Injectable()
export class CobrosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const cobros = await this.prisma.cobro.findMany({
      select: COBRO_SELECT_FIELDS,
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
        saldo_pendiente: Math.max(0, montoTotal - totalPagado),
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
      select: COBRO_SELECT_FIELDS,
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
      saldo_pendiente: Math.max(0, montoTotal - totalPagado),
      pagos: pagos.map((p) => ({
        id_pago: p.id_pago.toString(),
        monto_pagado: Number(p.monto_pagado),
        metodo_pago: p.metodo_pago,
        comprobante: p.comprobante,
        fecha_pago: p.fecha_pago,
      })),
    };
  }

  async registrarPago(
    idCobro: number, 
    montoOPagoDto: number | RegistrarPagoParams, 
    metodoPago?: string, 
    comprobante?: string
  ) {
    const idBigInt = BigInt(idCobro);
    const cobro = await this.prisma.cobro.findUnique({ 
      where: { id_cobro: idBigInt },
      select: COBRO_SELECT_FIELDS,
    });

    if (!cobro) throw new NotFoundException(`Cobro ${idCobro} no encontrado.`);

    // Normalizar argumentos para soportar objeto o parámetros sueltos
    let montoNum: number;
    let metodo: string;
    let comp: string | null = null;
    let nuevoMonto: number | undefined;
    let motivoAjuste: string | undefined;
    let idUsuario: number | undefined;

    if (typeof montoOPagoDto === 'object' && montoOPagoDto !== null) {
      montoNum = Number(montoOPagoDto.monto);
      metodo = montoOPagoDto.metodo_pago || 'EFECTIVO';
      comp = montoOPagoDto.comprobante || null;
      nuevoMonto = montoOPagoDto.nuevo_monto !== undefined ? Number(montoOPagoDto.nuevo_monto) : undefined;
      motivoAjuste = montoOPagoDto.motivo_ajuste;
      idUsuario = montoOPagoDto.id_usuario;
    } else {
      montoNum = Number(montoOPagoDto);
      metodo = metodoPago || 'EFECTIVO';
      comp = comprobante || null;
    }

    const montoOriginalCobro = Number(cobro.monto || 0);
    let nuevoMontoFinal = montoOriginalCobro;

    // 1. Aplicar ajuste si el monto cambió o se especificó un motivo
    if (nuevoMonto !== undefined && nuevoMonto !== montoOriginalCobro) {
      nuevoMontoFinal = nuevoMonto;

      const baseDesc = cobro.descripcion || 'Servicio';
      const descConMotivo = motivoAjuste ? `${baseDesc} (${motivoAjuste})` : baseDesc;

      await this.prisma.cobro.update({
        where: { id_cobro: idBigInt },
        data: {
          monto: new Prisma.Decimal(nuevoMontoFinal.toString()),
          monto_original: cobro.monto_original ?? new Prisma.Decimal(montoOriginalCobro.toString()),
          motivo_ajuste: motivoAjuste || 'Ajuste de cuota',
          descripcion: descConMotivo,
          id_usuario: idUsuario ? BigInt(idUsuario) : cobro.id_usuario,
          updated_date: new Date(),
        },
      });
    } else if (motivoAjuste) {
      await this.prisma.cobro.update({
        where: { id_cobro: idBigInt },
        data: {
          motivo_ajuste: motivoAjuste,
          id_usuario: idUsuario ? BigInt(idUsuario) : cobro.id_usuario,
          updated_date: new Date(),
        },
      });
    }

    // 2. Registrar el pago
    const nuevoPago = await this.prisma.pago.create({
      data: {
        id_cobro: idBigInt,
        monto_pagado: new Prisma.Decimal(montoNum.toString()),
        moneda: cobro.moneda || 'BOB',
        metodo_pago: metodo,
        comprobante: comp,
        fecha_pago: new Date(),
        estado: 'COMPLETADO',
      },
    });

    // 3. Evaluar saldo restante y estado
    const pagos = await this.prisma.pago.findMany({ where: { id_cobro: idBigInt } });
    const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto_pagado || 0), 0);
    const estadoFinal = totalPagado >= nuevoMontoFinal ? 'PAGADO' : 'PENDIENTE';

    const cobroActualizado = await this.prisma.cobro.update({
      where: { id_cobro: idBigInt },
      data: { 
        estado: estadoFinal, 
        updated_date: new Date(),
        id_usuario: idUsuario ? BigInt(idUsuario) : cobro.id_usuario,
      },
      select: COBRO_SELECT_FIELDS,
    });

    return {
      pago: nuevoPago,
      cobro: {
        ...this.mapCobroResponse(cobroActualizado),
        total_pagado: totalPagado,
        saldo_pendiente: Math.max(0, nuevoMontoFinal - totalPagado),
      },
    };
  }

  private mapCobroResponse(c: any) {
    return {
      id_cobro: c.id_cobro.toString(),
      id_contrato: c.id_contrato ? c.id_contrato.toString() : null,
      id_concepto: c.id_concepto,
      descripcion: c.descripcion,
      monto: Number(c.monto || 0),
      monto_original: c.monto_original ? Number(c.monto_original) : null,
      motivo_ajuste: c.motivo_ajuste || null,
      id_usuario: c.id_usuario ? c.id_usuario.toString() : null,
      moneda: c.moneda,
      periodo_mes: c.periodo_mes,
      periodo_anio: c.periodo_anio,
      fecha_emision: c.fecha_emision,
      fecha_vencimiento: c.fecha_vencimiento,
      estado: c.estado,
    };
  }
}