import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper para convertir BigInt y Decimal a tipos JSON compatibles
  private formatDepartamento(dep: any) {
    if (!dep) return null;
    return {
      ...dep,
      id_departamento: Number(dep.id_departamento),
      id_edificio: dep.id_edificio ? Number(dep.id_edificio) : null,
      precio_alquiler: dep.precio_alquiler ? Number(dep.precio_alquiler) : 0,
      banos: dep.banos ? Number(dep.banos) : 1,
      habitaciones: dep.habitaciones ? Number(dep.habitaciones) : 1,
      piso: dep.piso ? Number(dep.piso) : 1,
    };
  }

  async create(dto: CreateDepartamentoDto) {
    const departamento = await this.prisma.departamento.create({
      data: {
        id_edificio: dto.id_edificio ? Number(dto.id_edificio) : null,
        piso: dto.piso !== undefined ? Number(dto.piso) : 1,
        numero_departamento: dto.numero_departamento.trim(),
        bloque: dto.bloque || null,
        medidor_agua: dto.medidor_agua || 'NO_TIENE',
        medidor_luz: dto.medidor_luz || 'NO_TIENE',
        tipo_inmueble: dto.tipo_inmueble || 'DEPARTAMENTO',
        estado: dto.estado || 'DISPONIBLE',
        habitaciones: dto.habitaciones !== undefined ? Number(dto.habitaciones) : 1,
        banos: dto.banos !== undefined ? Number(dto.banos) : 1,
        precio_alquiler: dto.precio_alquiler !== undefined ? Number(dto.precio_alquiler) : 0,
        observaciones: dto.observaciones?.trim() || null,
      },
    });

    return this.formatDepartamento(departamento);
  }

  async findAll(idEdificio?: number) {
    const where: any = {};
    if (idEdificio) {
      where.id_edificio = Number(idEdificio);
    }

    const deptos = await this.prisma.departamento.findMany({
      where,
      orderBy: [
        { piso: 'asc' },
        { numero_departamento: 'asc' },
      ],
    });

    return deptos.map(d => this.formatDepartamento(d));
  }

  async findOne(id: number) {
    const depto = await this.prisma.departamento.findUnique({
      where: { id_departamento: BigInt(id) },
    });

    if (!depto) {
      throw new NotFoundException(`Departamento #${id} no encontrado`);
    }

    return this.formatDepartamento(depto);
  }

  async update(id: number, dto: UpdateDepartamentoDto) {
    await this.findOne(id);

    const updated = await this.prisma.departamento.update({
      where: { id_departamento: BigInt(id) },
      data: {
        ...(dto.id_edificio !== undefined && { id_edificio: Number(dto.id_edificio) }),
        ...(dto.piso !== undefined && { piso: Number(dto.piso) }),
        ...(dto.numero_departamento && { numero_departamento: dto.numero_departamento.trim() }),
        ...(dto.bloque !== undefined && { bloque: dto.bloque }),
        ...(dto.medidor_agua !== undefined && { medidor_agua: dto.medidor_agua }),
        ...(dto.medidor_luz !== undefined && { medidor_luz: dto.medidor_luz }),
        ...(dto.tipo_inmueble !== undefined && { tipo_inmueble: dto.tipo_inmueble }),
        ...(dto.estado !== undefined && { estado: dto.estado }),
        ...(dto.habitaciones !== undefined && { habitaciones: Number(dto.habitaciones) }),
        ...(dto.banos !== undefined && { banos: Number(dto.banos) }),
        ...(dto.precio_alquiler !== undefined && { precio_alquiler: Number(dto.precio_alquiler) }),
        ...(dto.observaciones !== undefined && { observaciones: dto.observaciones?.trim() || null }),
        updated_date: new Date(),
      },
    });

    return this.formatDepartamento(updated);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.departamento.delete({
      where: { id_departamento: BigInt(id) },
    });

    return { message: `Departamento #${id} eliminado exitosamente` };
  }
}