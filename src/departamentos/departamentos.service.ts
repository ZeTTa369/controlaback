import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDepartamentoDto) {
    return this.prisma.departamento.create({
      data: {
        id_edificio: dto.id_edificio ? Number(dto.id_edificio) : null,
        numero_departamento: dto.numero_departamento ? String(dto.numero_departamento) : null,
        piso: dto.piso ? Math.round(Number(dto.piso)) : 1,
        habitaciones: dto.habitaciones ? Math.round(Number(dto.habitaciones)) : 1,
        banos: dto.banos ? Math.round(Number(dto.banos)) : 1, // Casteado a Entero puro
        precio_alquiler: dto.precio_alquiler !== undefined && dto.precio_alquiler !== null
          ? new Prisma.Decimal(Number(dto.precio_alquiler).toFixed(4))
          : new Prisma.Decimal('0.0000'),
        medidor_agua: dto.medidor_agua || null,
        medidor_luz: dto.medidor_luz || null,
        observaciones: dto.observaciones || null,
        estado: dto.estado || 'DISPONIBLE',
      },
    });
  }

  async findAll() {
    return this.prisma.departamento.findMany({
      orderBy: { created_date: 'desc' },
    });
  }

  async findOne(id: number) {
    const depto = await this.prisma.departamento.findUnique({
      where: { id_departamento: BigInt(id) },
    });

    if (!depto) throw new NotFoundException(`Departamento ${id} no encontrado`);
    return depto;
  }

  async update(id: number, dto: UpdateDepartamentoDto) {
    await this.findOne(id);

    return this.prisma.departamento.update({
      where: { id_departamento: BigInt(id) },
      data: {
        ...(dto.id_edificio && { id_edificio: Number(dto.id_edificio) }),
        ...(dto.numero_departamento && { numero_departamento: String(dto.numero_departamento) }),
        ...(dto.piso !== undefined && { piso: Math.round(Number(dto.piso)) }),
        ...(dto.habitaciones !== undefined && { habitaciones: Math.round(Number(dto.habitaciones)) }),
        ...(dto.banos !== undefined && { banos: Math.round(Number(dto.banos)) }),
        ...(dto.precio_alquiler !== undefined && { 
          precio_alquiler: new Prisma.Decimal(Number(dto.precio_alquiler).toFixed(4)) 
        }),
        ...(dto.medidor_agua !== undefined && { medidor_agua: dto.medidor_agua }),
        ...(dto.medidor_luz !== undefined && { medidor_luz: dto.medidor_luz }),
        ...(dto.observaciones !== undefined && { observaciones: dto.observaciones }),
        ...(dto.estado && { estado: dto.estado }),
        updated_date: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.departamento.delete({
      where: { id_departamento: BigInt(id) },
    });
  }
}