import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContratosService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper para serializar BigInt y Decimal en respuestas JSON
  private formatContrato(c: any) {
    if (!c) return null;
    return {
      ...c,
      id_contrato: Number(c.id_contrato),
      id_departamento: c.id_departamento ? Number(c.id_departamento) : null,
      id_usuario: c.id_usuario ? Number(c.id_usuario) : null,
      monto_renta: c.monto_renta ? Number(c.monto_renta) : 0,
      garantia: c.garantia ? Number(c.garantia) : 0,
      numero_llaves: c.numero_llaves !== null && c.numero_llaves !== undefined ? Number(c.numero_llaves) : 1,
    };
  }

  // Helper para serializar documentos de contrato
  private formatDocumento(doc: any) {
    if (!doc) return null;
    return {
      ...doc,
      id_contrato_documento: Number(doc.id_contrato_documento),
      id_contrato: doc.id_contrato ? Number(doc.id_contrato) : null,
    };
  }

  // Parsear 'YYYY-MM-DD' en hora local para evitar desfases UTC
  private parseFechaLocal(fechaStr: string | Date): Date {
    if (fechaStr instanceof Date) return fechaStr;
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day || 1);
  }

  async create(dto: CreateContratoDto) {
    const fInicio = this.parseFechaLocal(dto.fecha_inicio);
    const fFin = this.parseFechaLocal(dto.fecha_fin);

    // 1. Crear el contrato con numero_llaves
    const contrato = await this.prisma.contrato.create({
      data: {
        id_departamento: BigInt(dto.id_departamento),
        id_usuario: BigInt(dto.id_usuario),
        fecha_inicio: fInicio,
        fecha_fin: fFin,
        monto_renta: new Prisma.Decimal(dto.monto_renta.toString()),
        moneda: dto.moneda || 'BOB',
        garantia: dto.garantia ? new Prisma.Decimal(dto.garantia.toString()) : new Prisma.Decimal('0'),
        numero_llaves: dto.numero_llaves !== undefined ? Number(dto.numero_llaves) : 1,
        estado: dto.estado || 'ACTIVO',
      },
    });

    // 2. Marcar departamento como OCUPADO
    await this.prisma.departamento.update({
      where: { id_departamento: BigInt(dto.id_departamento) },
      data: { estado: 'OCUPADO' },
    });

    // 3. Generar automaticamente los cobros
    await this.generarCobrosAutomaticos(
      contrato.id_contrato,
      fInicio,
      fFin,
      dto.monto_renta,
      dto.moneda || 'BOB',
      dto.conceptosIds || [1],
    );

    return this.formatContrato(contrato);
  }

  private async generarCobrosAutomaticos(
    id_contrato: bigint,
    fechaInicio: Date,
    fechaFin: Date,
    montoRenta: number,
    moneda: string,
    conceptosIds: number[],
  ) {
    const conceptosInfo = await this.prisma.concepto.findMany({
      where: {
        id_concepto: { in: conceptosIds.map((id) => Number(id)) },
      },
    });

    const mapaConceptos = new Map<number, { nombre: string }>();
    conceptosInfo.forEach((c) => {
      mapaConceptos.set(c.id_concepto, {
        nombre: c.nombre || 'Concepto',
      });
    });

    let mesesDiferencia =
      (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 +
      (fechaFin.getMonth() - fechaInicio.getMonth());

    if (fechaFin.getDate() >= fechaInicio.getDate()) {
      mesesDiferencia += 1;
    }
    mesesDiferencia = Math.max(1, mesesDiferencia);

    const cobrosData: Prisma.cobroCreateManyInput[] = [];

    for (let i = 0; i < mesesDiferencia; i++) {
      const fechaActual = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + i, 1);
      const mes = fechaActual.getMonth() + 1;
      const anio = fechaActual.getFullYear();

      const fechaVencimiento = new Date(anio, mes - 1, 10);

      for (const idConcepto of conceptosIds) {
        const idConceptoNum = Number(idConcepto);
        const concepto = mapaConceptos.get(idConceptoNum);
        const nombreConcepto = concepto?.nombre || 'Cobro de Alquiler';

        const esRenta =
          nombreConcepto.toUpperCase().includes('RENTA') ||
          nombreConcepto.toUpperCase().includes('ALQUILER') ||
          idConceptoNum === 1;

        const montoFinal = esRenta ? montoRenta : 150;

        cobrosData.push({
          id_contrato,
          id_concepto: idConceptoNum,
          descripcion: `${nombreConcepto} Periodo ${mes}/${anio}`,
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

    await this.prisma.cobro.createMany({
      data: cobrosData,
    });
  }

  async findAll() {
    const contratos = await this.prisma.contrato.findMany({
      orderBy: { created_date: 'desc' },
    });
    return contratos.map((c) => this.formatContrato(c));
  }

  async findOne(id: number) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id_contrato: BigInt(id) },
    });
    if (!contrato) throw new NotFoundException(`Contrato con ID ${id} no encontrado.`);
    return this.formatContrato(contrato);
  }

  // ================= GESTION DE DOCUMENTOS DE RESPALDO =================

  async guardarDocumentos(
    idContrato: number,
    docsData: { url: string; id_publico: string; nombre: string; tipo_archivo: string }[],
  ) {
    await this.findOne(idContrato);

    const registros = await Promise.all(
      docsData.map((doc) =>
        this.prisma.contrato_documento.create({
          data: {
            id_contrato: BigInt(idContrato),
            nombre: doc.nombre,
            url: doc.url,
            id_publico: doc.id_publico,
            tipo_archivo: doc.tipo_archivo,
            estado: 'ACTIVO',
          },
        }),
      ),
    );

    return registros.map((r) => this.formatDocumento(r));
  }

  async obtenerDocumentosPorContrato(idContrato: number) {
    const docs = await this.prisma.contrato_documento.findMany({
      where: {
        id_contrato: BigInt(idContrato),
        estado: 'ACTIVO',
      },
      orderBy: {
        id_contrato_documento: 'desc',
      },
    });

    return docs.map((d) => this.formatDocumento(d));
  }

  async eliminarDocumento(idDocumento: number) {
    const doc = await this.prisma.contrato_documento.findUnique({
      where: { id_contrato_documento: BigInt(idDocumento) },
    });

    if (!doc) {
      throw new NotFoundException(`Documento #${idDocumento} no encontrado`);
    }

    const docActualizado = await this.prisma.contrato_documento.update({
      where: { id_contrato_documento: BigInt(idDocumento) },
      data: {
        estado: 'INACTIVO',
        updated_date: new Date(),
      },
    });

    return this.formatDocumento(docActualizado);
  }

  // Finalizar contrato anticipadamente, liberar unidad y depurar cuotas futuras
  async finalizarContrato(idContrato: number, fechaFinStr: string) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id_contrato: BigInt(idContrato) },
    });

    if (!contrato) {
      throw new NotFoundException(`Contrato con ID ${idContrato} no encontrado.`);
    }

    const fechaFinReal = this.parseFechaLocal(fechaFinStr);
    const anioCorte = fechaFinReal.getFullYear();
    const mesCorte = fechaFinReal.getMonth() + 1;

    await this.prisma.$transaction(async (tx) => {
      // 1. Actualizar estado y fecha_fin real del contrato
      await tx.contrato.update({
        where: { id_contrato: BigInt(idContrato) },
        data: {
          estado: 'FINALIZADO',
          fecha_fin: fechaFinReal,
          updated_date: new Date(),
        },
      });

      // 2. Liberar el departamento a DISPONIBLE
      if (contrato.id_departamento) {
        await tx.departamento.update({
          where: { id_departamento: contrato.id_departamento },
          data: {
            estado: 'DISPONIBLE',
            updated_date: new Date(),
          },
        });
      }

      // 3. Eliminar cobros PENDIENTES posteriores al mes/anio de finalizacion
      await tx.cobro.deleteMany({
        where: {
          id_contrato: BigInt(idContrato),
          estado: { not: 'PAGADO' },
          OR: [
            { periodo_anio: { gt: anioCorte } },
            {
              periodo_anio: anioCorte,
              periodo_mes: { gt: mesCorte },
            },
          ],
        },
      });
    });

    return {
      message: 'Contrato finalizado, unidad liberada y cuotas futuras depuradas correctamente',
      id_contrato: Number(idContrato),
      fecha_fin: fechaFinReal,
    };
  }
  
}