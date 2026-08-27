import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitanteDto } from './dto/create-habitante.dto';

@Injectable()
export class HabitantesService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper para convertir BigInt a Number en las respuestas JSON
  private formatHabitante(hab: any) {
    if (!hab) return null;
    return {
      ...hab,
      id_habitante: Number(hab.id_habitante),
      id_contrato: hab.id_contrato ? Number(hab.id_contrato) : null,
      id_departamento: hab.id_departamento ? Number(hab.id_departamento) : null,
    };
  }

  /**
   * Crear un solo habitante
   */
  async create(dto: CreateHabitanteDto) {
    const habitante = await this.prisma.habitante.create({
      data: {
        id_contrato: dto.id_contrato ? BigInt(dto.id_contrato) : null,
        id_departamento: dto.id_departamento ? BigInt(dto.id_departamento) : null,
        nombres: dto.nombres.trim(),
        primer_apellido: dto.primer_apellido.trim(),
        segundo_apellido: dto.segundo_apellido ? dto.segundo_apellido.trim() : null,
        ci_nit: dto.ci_nit ? dto.ci_nit.trim() : null,
        parentesco: dto.parentesco || 'Familiar',
        telefono: dto.telefono ? dto.telefono.trim() : null,
        es_titular: dto.es_titular || 'NO',
        estado: dto.estado || 'ACTIVO',
      },
    });

    return this.formatHabitante(habitante);
  }

  /**
   * Crear múltiples habitantes en lote (para el registro de contrato)
   */
  async createMany(dtos: CreateHabitanteDto[]) {
    if (!dtos || dtos.length === 0) return { count: 0 };

    const dataParaInsertar = dtos.map(dto => ({
      id_contrato: dto.id_contrato ? BigInt(dto.id_contrato) : null,
      id_departamento: dto.id_departamento ? BigInt(dto.id_departamento) : null,
      nombres: dto.nombres.trim(),
      primer_apellido: dto.primer_apellido.trim(),
      segundo_apellido: dto.segundo_apellido ? dto.segundo_apellido.trim() : null,
      ci_nit: dto.ci_nit ? dto.ci_nit.trim() : null,
      parentesco: dto.parentesco || 'Familiar',
      telefono: dto.telefono ? dto.telefono.trim() : null,
      es_titular: dto.es_titular || 'NO',
      estado: dto.estado || 'ACTIVO',
    }));

    const result = await this.prisma.habitante.createMany({
      data: dataParaInsertar,
    });

    return { count: result.count, message: `${result.count} habitantes registrados con éxito` };
  }

  /**
   * Obtener todos los habitantes de un contrato
   */
  async findByContrato(idContrato: number) {
    const habitantes = await this.prisma.habitante.findMany({
      where: { 
        id_contrato: BigInt(idContrato),
        estado: 'ACTIVO'
      },
      orderBy: { id_habitante: 'asc' },
    });

    return habitantes.map(h => this.formatHabitante(h));
  }

  /**
   * Obtener todos los habitantes de un departamento
   */
  async findByDepartamento(idDepartamento: number) {
    const habitantes = await this.prisma.habitante.findMany({
      where: { 
        id_departamento: BigInt(idDepartamento),
        estado: 'ACTIVO'
      },
      orderBy: { id_habitante: 'asc' },
    });

    return habitantes.map(h => this.formatHabitante(h));
  }

  /**
   * Eliminar o desactivar un habitante
   */
  async remove(id: number) {
    const habitante = await this.prisma.habitante.findUnique({
      where: { id_habitante: BigInt(id) },
    });

    if (!habitante) {
      throw new NotFoundException(`Habitante con ID ${id} no encontrado`);
    }

    await this.prisma.habitante.delete({
      where: { id_habitante: BigInt(id) },
    });

    return { message: 'Habitante eliminado correctamente' };
  }
}