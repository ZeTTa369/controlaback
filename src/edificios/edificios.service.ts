import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEdificioDto } from './dto/create-edificio.dto';
import { UpdateEdificioDto } from './dto/update-edificio.dto';

@Injectable()
export class EdificiosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper para computar estadísticas de departamentos por edificio
   */
  private async getMetricasEdificio(edificio: any) {
    const deptos = await this.prisma.departamento.findMany({
      where: { id_edificio: edificio.id_edificio },
      select: { estado: true },
    });

    const totalRegistrados = deptos.length;
    const disponibles = deptos.filter(
      (d) => (d.estado || 'DISPONIBLE').toUpperCase() === 'DISPONIBLE',
    ).length;
    const ocupados = deptos.filter(
      (d) => (d.estado || '').toUpperCase() === 'OCUPADO',
    ).length;
    const mantenimiento = deptos.filter(
      (d) => (d.estado || '').toUpperCase() === 'MANTENIMIENTO',
    ).length;

    return {
      ...edificio,
      ciudad: edificio.ciudad || '',
      provincia: edificio.provincia || '',
      capacidad_declarada: edificio.total_departamentos || 0,
      total_registrados: totalRegistrados,
      disponibles: disponibles,
      ocupados: ocupados,
      mantenimiento: mantenimiento,
    };
  }

  /**
   * Crear un nuevo edificio
   */
  async create(dto: CreateEdificioDto) {
    const edificio = await this.prisma.edificio.create({
      data: {
        nombre: dto.nombre.trim(),
        direccion: dto.direccion.trim(),
        ciudad: dto.ciudad?.trim() || null,
        provincia: dto.provincia?.trim() || null,
        imagen: dto.imagen || null,
        total_departamentos: dto.total_departamentos || 1,
        estado: dto.estado || 'ACTIVO',
      },
    });

    return this.getMetricasEdificio(edificio);
  }

  /**
   * Listar todos los edificios con métricas calculadas
   */
  async findAll() {
    const edificios = await this.prisma.edificio.findMany({
      orderBy: { created_date: 'desc' },
    });

    return Promise.all(edificios.map((ed) => this.getMetricasEdificio(ed)));
  }

  /**
   * Buscar un edificio por su ID
   */
  async findOne(id: number) {
    const edificio = await this.prisma.edificio.findUnique({
      where: { id_edificio: id },
    });

    if (!edificio) {
      throw new NotFoundException(`Edificio con ID ${id} no encontrado`);
    }

    return this.getMetricasEdificio(edificio);
  }

  /**
   * Actualizar un edificio existente
   */
  async update(id: number, dto: UpdateEdificioDto) {
    await this.findOne(id);

    const edificioActualizado = await this.prisma.edificio.update({
      where: { id_edificio: id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre.trim() }),
        ...(dto.direccion && { direccion: dto.direccion.trim() }),
        ...(dto.ciudad !== undefined && { ciudad: dto.ciudad?.trim() || null }),
        ...(dto.provincia !== undefined && { provincia: dto.provincia?.trim() || null }),
        ...(dto.imagen !== undefined && { imagen: dto.imagen }),
        ...(dto.total_departamentos !== undefined && {
          total_departamentos: dto.total_departamentos,
        }),
        ...(dto.estado && { estado: dto.estado }),
        updated_date: new Date(),
      },
    });

    return this.getMetricasEdificio(edificioActualizado);
  }

  /**
   * Eliminar un edificio por ID
   */
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.edificio.delete({
      where: { id_edificio: id },
    });
    return { message: `Edificio #${id} eliminado exitosamente` };
  }
}