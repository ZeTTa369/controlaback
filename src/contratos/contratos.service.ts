import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContratosService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper para serializar BigInt y Decimal en respuestas JSON
  private formatContrato(c: any, habitantes: any[] = []) {
    if (!c) return null;
    return {
      ...c,
      id_contrato: Number(c.id_contrato),
      id_departamento: c.id_departamento ? Number(c.id_departamento) : null,
      id_usuario: c.id_usuario ? Number(c.id_usuario) : null,
      monto_renta: c.monto_renta ? Number(c.monto_renta) : 0,
      garantia: c.garantia ? Number(c.garantia) : 0,
      numero_llaves:
        c.numero_llaves !== null && c.numero_llaves !== undefined
          ? Number(c.numero_llaves)
          : 1,
      habitantes: habitantes.map((h) => this.formatHabitante(h)),
    };
  }

  private formatHabitante(h: any) {
    if (!h) return null;
    return {
      ...h,
      id_habitante: Number(h.id_habitante),
      id_contrato: h.id_contrato ? Number(h.id_contrato) : null,
      id_departamento: h.id_departamento ? Number(h.id_departamento) : null,
      observaciones: h.observaciones || '',
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

  private parseFechaLocal(fechaStr: string | Date): Date {
    if (fechaStr instanceof Date) return fechaStr;
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day || 1);
  }

  private calcularDiaLimiteFin(fechaInicio: Date): number {
    const diaInicio = fechaInicio.getDate();
    const diasEnElMes = new Date(
      fechaInicio.getFullYear(),
      fechaInicio.getMonth() + 1,
      0,
    ).getDate();

    if (diaInicio >= 30) {
      return 5;
    }

    let diaFin = Math.ceil(diaInicio / 5) * 5;
    if (diaFin === diaInicio) {
      diaFin = diaInicio + 5;
    }
    if (diaFin > diasEnElMes) {
      diaFin = diasEnElMes;
    }
    return diaFin;
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
        garantia: dto.garantia
          ? new Prisma.Decimal(dto.garantia.toString())
          : new Prisma.Decimal('0'),
        numero_llaves:
          dto.numero_llaves !== undefined ? Number(dto.numero_llaves) : 1,
        estado: dto.estado || 'ACTIVO',
      },
    });

    // 2. Guardar habitantes/ocupantes censados si vienen en el DTO
    let habitantesCreados: any[] = [];
    if (Array.isArray(dto.habitantes) && dto.habitantes.length > 0) {
      const habitantesData = dto.habitantes.map((h) => ({
        id_contrato: contrato.id_contrato,
        id_departamento: BigInt(dto.id_departamento),
        nombres: (h.nombres || h.nombre || '').trim() || null,
        primer_apellido: (h.primer_apellido || '').trim() || null,
        segundo_apellido: (h.segundo_apellido || '').trim() || null,
        ci_nit: (h.ci_nit || h.ci || '').trim() || null,
        parentesco: (h.parentesco || '').trim() || null,
        telefono: (h.telefono || '').trim() || null,
        es_titular: h.es_titular || 'NO',
        nacionalidad: (h.nacionalidad || 'Boliviana').trim(),
        observaciones: (h.observaciones || '').trim() || null,
        estado: 'ACTIVO',
      }));

      await this.prisma.habitante.createMany({
        data: habitantesData,
      });

      habitantesCreados = await this.prisma.habitante.findMany({
        where: { id_contrato: contrato.id_contrato, estado: 'ACTIVO' },
      });
    }

    // 3. Marcar departamento como OCUPADO
    await this.prisma.departamento.update({
      where: { id_departamento: BigInt(dto.id_departamento) },
      data: { estado: 'OCUPADO' },
    });

    // 4. Generar automaticamente los cobros respetando los montos individuales y dia limite
    await this.generarCobrosAutomaticos(
      contrato.id_contrato,
      fInicio,
      fFin,
      dto.monto_renta,
      dto.moneda || 'BOB',
      dto.conceptosIds || [],
      dto.conceptosDetalle || [],
      dto.dia_limite_fin,
    );

    return this.formatContrato(contrato, habitantesCreados);
  }

  async update(
    idContrato: number,
    dto: {
      fecha_inicio?: string;
      fecha_fin?: string;
      monto_renta?: number;
      garantia?: number;
      numero_llaves?: number;
      estado?: string;
    },
  ) {
    const existente = await this.prisma.contrato.findUnique({
      where: { id_contrato: BigInt(idContrato) },
    });

    if (!existente) {
      throw new NotFoundException(`Contrato con ID ${idContrato} no encontrado.`);
    }

    const actualizado = await this.prisma.contrato.update({
      where: { id_contrato: BigInt(idContrato) },
      data: {
        ...(dto.fecha_inicio
          ? { fecha_inicio: this.parseFechaLocal(dto.fecha_inicio) }
          : {}),
        ...(dto.fecha_fin
          ? { fecha_fin: this.parseFechaLocal(dto.fecha_fin) }
          : {}),
        ...(dto.monto_renta !== undefined
          ? { monto_renta: new Prisma.Decimal(dto.monto_renta.toString()) }
          : {}),
        ...(dto.garantia !== undefined
          ? { garantia: new Prisma.Decimal(dto.garantia.toString()) }
          : {}),
        ...(dto.numero_llaves !== undefined
          ? { numero_llaves: Number(dto.numero_llaves) }
          : {}),
        ...(dto.estado ? { estado: dto.estado } : {}),
        updated_date: new Date(),
      },
    });

    if (
      dto.estado &&
      ['FINALIZADO', 'CANCELADO'].includes(dto.estado.toUpperCase()) &&
      existente.id_departamento
    ) {
      await this.prisma.departamento.update({
        where: { id_departamento: existente.id_departamento },
        data: { estado: 'DISPONIBLE', updated_date: new Date() },
      });
    }

    return this.formatContrato(actualizado);
  }

  private async generarCobrosAutomaticos(
    id_contrato: bigint,
    fechaInicio: Date,
    fechaFin: Date,
    montoRenta: number,
    moneda: string,
    conceptosIds: number[],
    conceptosDetalle: { id_concepto: number; monto: number }[] = [],
    diaLimiteFin?: number,
  ) {
    const conceptosInfo = await this.prisma.concepto.findMany({
      where: {
        id_concepto: { in: conceptosIds.map((id) => Number(id)) },
      },
    });

    const mapaConceptos = new Map<number, { nombre: string }>();
    conceptosInfo.forEach((c) => {
      mapaConceptos.set(Number(c.id_concepto), {
        nombre: c.nombre || 'Concepto',
      });
    });

    const mapaMontosDetalle = new Map<number, number>();
    conceptosDetalle.forEach((item) => {
      mapaMontosDetalle.set(Number(item.id_concepto), Number(item.monto));
    });

    let mesesDiferencia =
      (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 +
      (fechaFin.getMonth() - fechaInicio.getMonth());

    if (fechaFin.getDate() >= fechaInicio.getDate()) {
      mesesDiferencia += 1;
    }
    mesesDiferencia = Math.max(1, mesesDiferencia);

    const diaLimite = diaLimiteFin
      ? Number(diaLimiteFin)
      : this.calcularDiaLimiteFin(fechaInicio);
    const cobrosData: Prisma.cobroCreateManyInput[] = [];

    for (let i = 0; i < mesesDiferencia; i++) {
      const fechaActual = new Date(
        fechaInicio.getFullYear(),
        fechaInicio.getMonth() + i,
        1,
      );
      const mes = fechaActual.getMonth() + 1;
      const anio = fechaActual.getFullYear();

      const ultimoDiaMes = new Date(anio, mes, 0).getDate();
      const diaVencimientoReal = Math.min(diaLimite, ultimoDiaMes);
      const fechaVencimiento = new Date(anio, mes - 1, diaVencimientoReal);

      for (const idConcepto of conceptosIds) {
        const idConceptoNum = Number(idConcepto);
        const concepto = mapaConceptos.get(idConceptoNum);
        const nombreConcepto = concepto?.nombre || 'Cobro';

        const esRenta =
          nombreConcepto.toUpperCase().includes('RENTA') ||
          nombreConcepto.toUpperCase().includes('ALQUILER') ||
          nombreConcepto.toUpperCase().includes('CANON');

        const montoFinal = mapaMontosDetalle.has(idConceptoNum)
          ? mapaMontosDetalle.get(idConceptoNum)!
          : esRenta
          ? montoRenta
          : 0;

        if (montoFinal > 0) {
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
    }

    if (cobrosData.length > 0) {
      await this.prisma.cobro.createMany({
        data: cobrosData,
      });
    }
  }

  async findAll() {
    const contratos = await this.prisma.contrato.findMany({
      orderBy: { created_date: 'desc' },
    });

    if (contratos.length === 0) return [];

    const idsContratos = contratos.map((c) => c.id_contrato);
    const habitantes = await this.prisma.habitante.findMany({
      where: {
        id_contrato: { in: idsContratos },
        estado: 'ACTIVO',
      },
      orderBy: { id_habitante: 'asc' },
    });

    const habMap = new Map<string, any[]>();
    for (const h of habitantes) {
      if (!h.id_contrato) continue;
      const key = h.id_contrato.toString();
      if (!habMap.has(key)) habMap.set(key, []);
      habMap.get(key)!.push(h);
    }

    return contratos.map((c) =>
      this.formatContrato(c, habMap.get(c.id_contrato.toString()) || []),
    );
  }

  async findOne(id: number) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id_contrato: BigInt(id) },
    });
    if (!contrato)
      throw new NotFoundException(`Contrato con ID ${id} no encontrado.`);

    const habitantes = await this.prisma.habitante.findMany({
      where: { id_contrato: BigInt(id), estado: 'ACTIVO' },
      orderBy: { id_habitante: 'asc' },
    });

    return this.formatContrato(contrato, habitantes);
  }

  async obtenerHabitantesPorContrato(idContrato: number) {
    const habitantes = await this.prisma.habitante.findMany({
      where: {
        id_contrato: BigInt(idContrato),
        estado: 'ACTIVO',
      },
      orderBy: { id_habitante: 'asc' },
    });

    return habitantes.map((h) => this.formatHabitante(h));
  }

  async obtenerTodosHabitantes() {
    const habitantes = await this.prisma.habitante.findMany({
      where: { estado: 'ACTIVO' },
      orderBy: { id_habitante: 'asc' },
    });

    return habitantes.map((h) => this.formatHabitante(h));
  }

  async remove(idContrato: number) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id_contrato: BigInt(idContrato) },
    });

    if (!contrato) {
      throw new NotFoundException(`Contrato con ID ${idContrato} no encontrado.`);
    }

    await this.prisma.$transaction(async (tx) => {
      const cobros = await tx.cobro.findMany({
        where: { id_contrato: BigInt(idContrato) },
        select: { id_cobro: true },
      });
      const idsCobros = cobros.map((c) => c.id_cobro);

      if (idsCobros.length > 0) {
        await tx.pago.deleteMany({
          where: { id_cobro: { in: idsCobros } },
        });
      }

      await tx.cobro.deleteMany({
        where: { id_contrato: BigInt(idContrato) },
      });

      await tx.habitante.deleteMany({
        where: { id_contrato: BigInt(idContrato) },
      });

      await tx.contrato_documento.deleteMany({
        where: { id_contrato: BigInt(idContrato) },
      });

      if (contrato.id_departamento) {
        await tx.departamento.update({
          where: { id_departamento: contrato.id_departamento },
          data: {
            estado: 'DISPONIBLE',
            updated_date: new Date(),
          },
        });
      }

      await tx.contrato.delete({
        where: { id_contrato: BigInt(idContrato) },
      });
    });

    return {
      message: 'Contrato y registros asociados eliminados correctamente',
      id_contrato: Number(idContrato),
    };
  }

  // ================= GESTION DE DOCUMENTOS DE RESPALDO =================

  async guardarDocumentos(
    idContrato: number,
    docsData: {
      url: string;
      id_publico: string;
      nombre: string;
      tipo_archivo: string;
    }[],
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
      await tx.contrato.update({
        where: { id_contrato: BigInt(idContrato) },
        data: {
          estado: 'FINALIZADO',
          fecha_fin: fechaFinReal,
          updated_date: new Date(),
        },
      });

      if (contrato.id_departamento) {
        await tx.departamento.update({
          where: { id_departamento: contrato.id_departamento },
          data: {
            estado: 'DISPONIBLE',
            updated_date: new Date(),
          },
        });
      }

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

      await tx.habitante.updateMany({
        where: {
          id_contrato: BigInt(idContrato),
          estado: 'ACTIVO',
        },
        data: {
          estado: 'INACTIVO',
          updated_date: new Date(),
        },
      });
    });

    return {
      message:
        'Contrato finalizado, unidad liberada y cuotas futuras depuradas correctamente',
      id_contrato: Number(idContrato),
      fecha_fin: fechaFinReal,
    };
  }

  async agregarHabitanteAContrato(idContrato: number, dto: any) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id_contrato: BigInt(idContrato) },
    });

    if (!contrato) {
      throw new NotFoundException(`Contrato con ID ${idContrato} no encontrado.`);
    }

    const nuevo = await this.prisma.habitante.create({
      data: {
        id_contrato: BigInt(idContrato),
        id_departamento: contrato.id_departamento,
        nombres: (dto.nombres || dto.nombre || '').trim() || null,
        primer_apellido: (dto.primer_apellido || '').trim() || null,
        segundo_apellido: (dto.segundo_apellido || '').trim() || null,
        ci_nit: (dto.ci_nit || dto.ci || '').trim() || null,
        parentesco: (dto.parentesco || 'Familiar').trim(),
        telefono: (dto.telefono || '').trim() || null,
        es_titular: dto.es_titular || 'NO',
        nacionalidad: (dto.nacionalidad || 'Boliviana').trim(),
        observaciones: (dto.observaciones || '').trim() || null,
        estado: 'ACTIVO',
      },
    });

    return this.formatHabitante(nuevo);
  }

  async actualizarHabitante(idHabitante: number, dto: any) {
    const existente = await this.prisma.habitante.findUnique({
      where: { id_habitante: BigInt(idHabitante) },
    });

    if (!existente) {
      throw new NotFoundException(`Habitante #${idHabitante} no encontrado.`);
    }

    const actualizado = await this.prisma.habitante.update({
      where: { id_habitante: BigInt(idHabitante) },
      data: {
        ...(dto.nombres !== undefined || dto.nombre !== undefined
          ? { nombres: (dto.nombres || dto.nombre || '').trim() || null }
          : {}),
        ...(dto.primer_apellido !== undefined
          ? { primer_apellido: (dto.primer_apellido || '').trim() || null }
          : {}),
        ...(dto.segundo_apellido !== undefined
          ? { segundo_apellido: (dto.segundo_apellido || '').trim() || null }
          : {}),
        ...(dto.ci_nit !== undefined || dto.ci !== undefined
          ? { ci_nit: (dto.ci_nit || dto.ci || '').trim() || null }
          : {}),
        ...(dto.parentesco !== undefined
          ? { parentesco: (dto.parentesco || '').trim() || null }
          : {}),
        ...(dto.telefono !== undefined
          ? { telefono: (dto.telefono || '').trim() || null }
          : {}),
        ...(dto.nacionalidad !== undefined
          ? { nacionalidad: (dto.nacionalidad || 'Boliviana').trim() }
          : {}),
        ...(dto.es_titular !== undefined ? { es_titular: dto.es_titular } : {}),
        ...(dto.observaciones !== undefined
          ? { observaciones: (dto.observaciones || '').trim() || null }
          : {}),
        updated_date: new Date(),
      },
    });

    return this.formatHabitante(actualizado);
  }

  async eliminarHabitante(idHabitante: number) {
    const existente = await this.prisma.habitante.findUnique({
      where: { id_habitante: BigInt(idHabitante) },
    });

    if (!existente) {
      throw new NotFoundException(`Habitante #${idHabitante} no encontrado.`);
    }

    await this.prisma.habitante.update({
      where: { id_habitante: BigInt(idHabitante) },
      data: {
        estado: 'INACTIVO',
        updated_date: new Date(),
      },
    });

    return {
      message: 'Habitante dado de baja correctamente',
      id_habitante: Number(idHabitante),
    };
  }
  
}