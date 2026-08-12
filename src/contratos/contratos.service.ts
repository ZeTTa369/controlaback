import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContratosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContratoDto) {
    // 1. Crear el contrato
    const contrato = await this.prisma.contrato.create({
      data: {
        id_departamento: BigInt(dto.id_departamento),
        id_usuario: BigInt(dto.id_usuario),
        fecha_inicio: new Date(dto.fecha_inicio),
        fecha_fin: new Date(dto.fecha_fin),
        monto_renta: new Prisma.Decimal(dto.monto_renta.toString()),
        moneda: dto.moneda || 'BOB',
        garantia: dto.garantia ? new Prisma.Decimal(dto.garantia.toString()) : new Prisma.Decimal('0'),
        estado: 'ACTIVO',
      },
    });

    // 2. Marcar departamento como OCUPADO
    await this.prisma.departamento.update({
      where: { id_departamento: BigInt(dto.id_departamento) },
      data: { estado: 'OCUPADO' },
    });

    // 3. Generar automáticamente TODOS los cobros multiplicando (meses x conceptos)
    await this.generarCobrosAutomaticos(
      contrato.id_contrato,
      new Date(dto.fecha_inicio),
      new Date(dto.fecha_fin),
      dto.monto_renta,
      dto.moneda || 'BOB',
      dto.conceptosIds || [1],
    );

    return contrato;
  }

  private async generarCobrosAutomaticos(
    id_contrato: bigint,
    fechaInicio: Date,
    fechaFin: Date,
    montoRenta: number,
    moneda: string,
    conceptosIds: number[],
  ) {
    // 1. Obtener la lista completa de información de los conceptos seleccionados desde la BD
    const conceptosInfo = await this.prisma.concepto.findMany({
      where: {
        id_concepto: { in: conceptosIds.map((id) => Number(id)) },
      },
    });

    // Mapa para resolución rápida de nombres y montos sugeridos
    const mapaConceptos = new Map<number, { nombre: string; montoBase?: number }>();
    conceptosInfo.forEach((c) => {
      mapaConceptos.set(c.id_concepto, {
        nombre: c.nombre || 'Concepto',
      });
    });

    // 2. Calcular la cantidad exacta de meses entre fecha_inicio y fecha_fin
    let mesesDiferencia =
      (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 +
      (fechaFin.getMonth() - fechaInicio.getMonth());

    if (fechaFin.getDate() >= fechaInicio.getDate()) {
      mesesDiferencia += 1;
    }
    mesesDiferencia = Math.max(1, mesesDiferencia);

    const cobrosData: Prisma.cobroCreateManyInput[] = [];

    // 3. Iterar mes a mes usando timestamp base para evitar desfases por días de mes
    for (let i = 0; i < mesesDiferencia; i++) {
      const fechaActual = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + i, 1);
      const mes = fechaActual.getMonth() + 1;
      const anio = fechaActual.getFullYear();

      // Fecha de vencimiento: día 10 de cada mes
      const fechaVencimiento = new Date(anio, mes - 1, 10);

      // 4. MULTIPLICAR: Crear UN cobro individual por cada concepto seleccionado para este mes
      for (const idConcepto of conceptosIds) {
        const idConceptoNum = Number(idConcepto);
        const concepto = mapaConceptos.get(idConceptoNum);
        const nombreConcepto = concepto?.nombre || 'Cobro de Alquiler';

        // Asignar montoRenta al concepto de RENTA/ALQUILER y un monto predeterminado razonable si es expensas/otros
        const esRenta =
          nombreConcepto.toUpperCase().includes('RENTA') ||
          nombreConcepto.toUpperCase().includes('ALQUILER') ||
          idConceptoNum === 1;

        const montoFinal = esRenta ? montoRenta : 150; // Ajustable según el concepto

        cobrosData.push({
          id_contrato,
          id_concepto: idConceptoNum,
          descripcion: `${nombreConcepto} - Período ${mes}/${anio}`,
          monto: new Prisma.Decimal(montoFinal.toString()),
          moneda,
          periodo_mes: mes,
          periodo_anio: anio,
          fecha_emision: fechaActual,
          fecha_vencimiento: fechaVencimiento,
          estado: 'PENDIENTE',
        });
      }
    }

    // 5. Insertar todos los cobros generados de una sola vez
    await this.prisma.cobro.createMany({
      data: cobrosData,
    });
  }

  async findAll() {
    return this.prisma.contrato.findMany({
      orderBy: { created_date: 'desc' },
    });
  }

  async findOne(id: number) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id_contrato: BigInt(id) },
    });
    if (!contrato) throw new NotFoundException(`Contrato con ID ${id} no encontrado.`);
    return contrato;
  }
}