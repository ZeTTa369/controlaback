import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEdificioDto } from './dto/create-edificio.dto';
import { UpdateEdificioDto } from './dto/update-edificio.dto';

@Injectable()
export class EdificiosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo edificio
   */
  async create(dto: CreateEdificioDto) {
    return this.prisma.edificio.create({
      data: {
        nombre: dto.nombre,
        direccion: dto.direccion,
        total_pisos: dto.total_pisos || 1,
        estado: dto.estado || 'ACTIVO',
      },
    });
  }

  /**
   * Listar todos los edificios (sin include)
   */
  async findAll() {
    const edificios = await this.prisma.edificio.findMany({
      orderBy: { created_date: 'desc' },
    });

    return edificios.map((ed) => ({
      ...ed,
      total_departamentos: ed.total_pisos || 0,
      unidades_disponibles: ed.total_pisos || 0,
    }));
  }

  /**
   * Buscar un edificio por su ID (sin include)
   */
  async findOne(id: number) {
    const edificio = await this.prisma.edificio.findUnique({
      where: { id_edificio: id },
    });

    if (!edificio) {
      throw new NotFoundException(`Edificio con ID ${id} no encontrado`);
    }

    return {
      ...edificio,
      total_departamentos: edificio.total_pisos || 0,
      unidades_disponibles: edificio.total_pisos || 0,
    };
  }

  /**
   * Actualizar un edificio existente (sin include)
   */
  async update(id: number, dto: UpdateEdificioDto) {
    await this.findOne(id);

    const edificioActualizado = await this.prisma.edificio.update({
      where: { id_edificio: id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre }),
        ...(dto.direccion && { direccion: dto.direccion }),
        ...(dto.total_pisos !== undefined && { total_pisos: dto.total_pisos }),
        ...(dto.estado && { estado: dto.estado }),
        updated_date: new Date(),
      },
    });

    return {
      ...edificioActualizado,
      total_departamentos: edificioActualizado.total_pisos || 0,
      unidades_disponibles: edificioActualizado.total_pisos || 0,
    };
  }

  /**
   * Eliminar un edificio por ID
   */
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.edificio.delete({
      where: { id_edificio: id },
    });
  }
}