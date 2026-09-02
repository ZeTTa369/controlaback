import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefaccionDto } from './dto/create-refaccion.dto';
import { UpdateRefaccionDto } from './dto/update-refaccion.dto';

@Injectable()
export class RefaccionesService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper para convertir BigInt y Decimal a tipos primitivos seguros en JSON
  private formatRefaccion(item: any) {
    if (!item) return null;
    return {
      ...item,
      id_refaccion: Number(item.id_refaccion),
      id_edificio: item.id_edificio ? Number(item.id_edificio) : null,
      id_departamento: item.id_departamento ? Number(item.id_departamento) : null,
      id_usuario: item.id_usuario ? Number(item.id_usuario) : null,
      costo_mano_obra: item.costo_mano_obra ? Number(item.costo_mano_obra) : 0,
      costo_material: item.costo_material ? Number(item.costo_material) : 0,
      costo_total: item.costo_total ? Number(item.costo_total) : 0,
    };
  }

  /**
   * Crear nueva refacción
   */
  async create(dto: CreateRefaccionDto) {
    const manoObra = Number(dto.costo_mano_obra) || 0;
    const material = Number(dto.costo_material) || 0;
    const totalCalculado = dto.costo_total !== undefined ? Number(dto.costo_total) : (manoObra + material);

    const refaccion = await this.prisma.refaccion.create({
      data: {
        id_edificio: dto.id_edificio ? Number(dto.id_edificio) : null,
        id_departamento: dto.id_departamento ? BigInt(dto.id_departamento) : null,
        id_usuario: dto.id_usuario ? BigInt(dto.id_usuario) : null,
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion?.trim() || null,
        tipo: dto.tipo || 'GENERAL',
        prioridad: dto.prioridad || 'MEDIA',
        costo_mano_obra: manoObra,
        costo_material: material,
        costo_total: totalCalculado,
        moneda: dto.moneda || 'BOB',
        proveedor: dto.proveedor?.trim() || null,
        fecha_solicitud: dto.fecha_solicitud ? new Date(dto.fecha_solicitud) : new Date(),
        fecha_inicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : null,
        fecha_fin: dto.fecha_fin ? new Date(dto.fecha_fin) : null,
        estado: dto.estado || 'PENDIENTE',
      },
    });

    return this.formatRefaccion(refaccion);
  }

  /**
   * Listar todas las refacciones con filtros opcionales
   */
  async findAll(query?: { id_edificio?: number; id_departamento?: number; estado?: string }) {
    const where: any = {};

    if (query?.id_edificio) where.id_edificio = Number(query.id_edificio);
    if (query?.id_departamento) where.id_departamento = BigInt(query.id_departamento);
    if (query?.estado) where.estado = query.estado;

    const list = await this.prisma.refaccion.findMany({
      where,
      orderBy: { created_date: 'desc' },
    });

    return list.map(item => this.formatRefaccion(item));
  }

  /**
   * Buscar una refacción por ID
   */
  async findOne(id: number) {
    const refaccion = await this.prisma.refaccion.findUnique({
      where: { id_refaccion: BigInt(id) },
    });

    if (!refaccion) {
      throw new NotFoundException(`Refacción con ID ${id} no encontrada`);
    }

    return this.formatRefaccion(refaccion);
  }

  /**
   * Actualizar refacción
   */
  async update(id: number, dto: UpdateRefaccionDto) {
    const actual = await this.findOne(id);

    const manoObra = dto.costo_mano_obra !== undefined ? Number(dto.costo_mano_obra) : actual.costo_mano_obra;
    const material = dto.costo_material !== undefined ? Number(dto.costo_material) : actual.costo_material;
    const totalCalculado = dto.costo_total !== undefined ? Number(dto.costo_total) : (manoObra + material);

    const updated = await this.prisma.refaccion.update({
      where: { id_refaccion: BigInt(id) },
      data: {
        ...(dto.id_edificio !== undefined && { id_edificio: dto.id_edificio ? Number(dto.id_edificio) : null }),
        ...(dto.id_departamento !== undefined && { id_departamento: dto.id_departamento ? BigInt(dto.id_departamento) : null }),
        ...(dto.id_usuario !== undefined && { id_usuario: dto.id_usuario ? BigInt(dto.id_usuario) : null }),
        ...(dto.titulo && { titulo: dto.titulo.trim() }),
        ...(dto.descripcion !== undefined && { descripcion: dto.descripcion?.trim() || null }),
        ...(dto.tipo && { tipo: dto.tipo }),
        ...(dto.prioridad && { prioridad: dto.prioridad }),
        costo_mano_obra: manoObra,
        costo_material: material,
        costo_total: totalCalculado,
        ...(dto.moneda && { moneda: dto.moneda }),
        ...(dto.proveedor !== undefined && { proveedor: dto.proveedor?.trim() || null }),
        ...(dto.fecha_solicitud && { fecha_solicitud: new Date(dto.fecha_solicitud) }),
        ...(dto.fecha_inicio !== undefined && { fecha_inicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : null }),
        ...(dto.fecha_fin !== undefined && { fecha_fin: dto.fecha_fin ? new Date(dto.fecha_fin) : null }),
        ...(dto.estado && { estado: dto.estado }),
        updated_date: new Date(),
      },
    });

    return this.formatRefaccion(updated);
  }

  /**
   * Eliminar refacción
   */
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.refaccion.delete({
      where: { id_refaccion: BigInt(id) },
    });
    return { message: `Refacción #${id} eliminada exitosamente` };
  }
}