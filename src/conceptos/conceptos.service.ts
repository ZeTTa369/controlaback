import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';

@Injectable()
export class ConceptosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConceptoDto) {
    return this.prisma.concepto.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion || null,
        recurrente: dto.recurrente || 'Mensual',
        estado: dto.estado || 'ACTIVO',
      },
    });
  }

  async findAll() {
    return this.prisma.concepto.findMany({
      orderBy: { created_date: 'desc' },
    });
  }

  async findOne(id: number) {
    const concepto = await this.prisma.concepto.findUnique({
      where: { id_concepto: id },
    });
    if (!concepto) throw new NotFoundException(`Concepto ${id} no encontrado`);
    return concepto;
  }

  async update(id: number, dto: UpdateConceptoDto) {
    await this.findOne(id);
    return this.prisma.concepto.update({
      where: { id_concepto: id },
      data: {
        ...dto,
        updated_date: new Date(),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.concepto.update({
      where: { id_concepto: id },
      data: { estado: 'INACTIVO', updated_date: new Date() },
    });
  }
}