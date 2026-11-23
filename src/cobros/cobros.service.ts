import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { generarCodigoDepartamento } from '../departamentos/utils/codigo-departamento.utils';

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
  numero_recibo: true,
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

  /**
   * Genera u obtiene el numero de recibo correlativo por edificio y anio.
   * Formato: [Codigo Unidad][Correlativo 4 digitos] -> Ej. L11SB0001 / CC25I0001.
   * Se reinicia automaticamente a 0001 cada inicio de anio por cada edificio.
   */
  private async obtenerOGenerarNumeroRecibo(cobro: any): Promise<string | null> {
    if (cobro.numero_recibo) {
      return cobro.numero_recibo;
    }

    if (!cobro.id_contrato) return null;

    // 1. Verificar si ya existe un numero_recibo asignado en otro concepto del mismo periodo
    if (cobro.periodo_mes && cobro.periodo_anio) {
      const otroCobroDelPeriodo = await this.prisma.cobro.findFirst({
        where: {
          id_contrato: cobro.id_contrato,
          periodo_mes: cobro.periodo_mes,
          periodo_anio: cobro.periodo_anio,
          numero_recibo: { not: null },
        },
        select: { numero_recibo: true },
      });

      if (otroCobroDelPeriodo?.numero_recibo) {
        return otroCobroDelPeriodo.numero_recibo;
      }
    }

    // 2. Obtener contrato -> departamento -> edificio
    const contrato = await this.prisma.contrato.findUnique({
      where: { id_contrato: cobro.id_contrato },
    });

    if (!contrato?.id_departamento) return null;

    const depto = await this.prisma.departamento.findUnique({
      where: { id_departamento: contrato.id_departamento },
    });

    if (!depto) return null;

    const edificio = depto.id_edificio
      ? await this.prisma.edificio.findUnique({
          where: { id_edificio: depto.id_edificio },
        })
      : null;

    const codigoUnidad =
      depto.codigo ||
      generarCodigoDepartamento({
        nombreEdificio: edificio?.nombre,
        piso: depto.piso,
        numeroDepartamento: depto.numero_departamento,
        bloque: depto.bloque,
      });

    // 3. Buscar todos los departamentos y contratos de ese mismo edificio para contar recibos del anio
    const anioActual = new Date().getFullYear();
    const inicioAnio = new Date(anioActual, 0, 1);
    const finAnio = new Date(anioActual + 1, 0, 1);

    let maxCorrelativoEdificio = 0;

    if (depto.id_edificio) {
      const deptosEdificio = await this.prisma.departamento.findMany({
        where: { id_edificio: depto.id_edificio },
        select: { id_departamento: true },
      });
      const idsDeptos = deptosEdificio.map((d) => d.id_departamento);

      const contratosEdificio = await this.prisma.contrato.findMany({
        where: { id_departamento: { in: idsDeptos } },
        select: { id_contrato: true },
      });
      const idsContratos = contratosEdificio.map((c) => c.id_contrato);

      if (idsContratos.length > 0) {
        // Recibos emitidos en este edificio durante el anio en curso
        const cobrosConRecibo = await this.prisma.cobro.findMany({
          where: {
            id_contrato: { in: idsContratos },
            numero_recibo: { not: null },
            updated_date: {
              gte: inicioAnio,
              lt: finAnio,
            },
          },
          select: { numero_recibo: true },
        });

        for (const item of cobrosConRecibo) {
          if (!item.numero_recibo) continue;
          const match = item.numero_recibo.match(/(\d{4})$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxCorrelativoEdificio) {
              maxCorrelativoEdificio = num;
            }
          }
        }
      }
    }

    const siguienteCorrelativo = String(maxCorrelativoEdificio + 1).padStart(4, '0');
    return `${codigoUnidad}${siguienteCorrelativo}`;
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

    // 4. Si queda PAGADO, obtener o generar el numero de recibo correlativo por edificio y anio
    let numeroReciboFinal = cobro.numero_recibo || null;
    if (estadoFinal === 'PAGADO') {
      numeroReciboFinal = await this.obtenerOGenerarNumeroRecibo(cobro);
    }

    const cobroActualizado = await this.prisma.cobro.update({
      where: { id_cobro: idBigInt },
      data: { 
        estado: estadoFinal,
        ...(numeroReciboFinal ? { numero_recibo: numeroReciboFinal } : {}),
        updated_date: new Date(),
        id_usuario: idUsuario ? BigInt(idUsuario) : cobro.id_usuario,
      },
      select: COBRO_SELECT_FIELDS,
    });

    // Propagar el mismo numero_recibo al resto de conceptos del mismo periodo mensual
    if (numeroReciboFinal && cobro.id_contrato && cobro.periodo_mes && cobro.periodo_anio) {
      await this.prisma.cobro.updateMany({
        where: {
          id_contrato: cobro.id_contrato,
          periodo_mes: cobro.periodo_mes,
          periodo_anio: cobro.periodo_anio,
          numero_recibo: null,
        },
        data: {
          numero_recibo: numeroReciboFinal,
        },
      });
    }

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
      numero_recibo: c.numero_recibo || null,
    };
  }

  async actualizarMontosLote(
    items: { id_cobro: number; monto: number; motivo_ajuste?: string }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const resultados = [];

      for (const item of items) {
        const actual = await tx.cobro.findUnique({
          where: { id_cobro: BigInt(item.id_cobro) },
        });

        if (!actual || actual.estado === 'PAGADO') continue;

        const nuevoMonto = new Prisma.Decimal(item.monto);
        const updated = await tx.cobro.update({
          where: { id_cobro: BigInt(item.id_cobro) },
          data: {
            monto: nuevoMonto,
            monto_original: actual.monto_original ?? actual.monto,
            motivo_ajuste: item.motivo_ajuste || 'Ajuste mensual de tarifa',
            updated_date: new Date(),
          },
        });

        resultados.push({
          ...updated,
          id_cobro: Number(updated.id_cobro),
          id_contrato: updated.id_contrato ? Number(updated.id_contrato) : null,
          id_usuario: updated.id_usuario ? Number(updated.id_usuario) : null,
          monto: Number(updated.monto),
          monto_original: updated.monto_original ? Number(updated.monto_original) : null,
        });
      }

      return resultados;
    });
  }
}