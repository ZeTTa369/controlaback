import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
  const { id_edificio, password, ...usuarioData } = createUsuarioDto;
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Crear usuario en la tabla 'usuario'
  const nuevoUsuario = await this.prisma.usuario.create({
    data: {
      ...usuarioData,
      password: hashedPassword,
    },
  });

  // 2. Crear relación en 'usuario_edificio' si se especificó un edificio
  if (id_edificio) {
    await this.prisma.usuario_edificio.create({
      data: {
        id_usuario: nuevoUsuario.id_usuario,
        id_edificio: Number(id_edificio),
        fecha_asignacion: new Date(),
        estado: 'ACTIVO',
      },
    });
  }

  return nuevoUsuario;
}

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nombre: true,
        primer_apellido: true,
        segundo_apellido: true,
        ci_nit: true,
        email: true,
        telefono: true,
        rol: true,
        estado: true,
        created_date: true,
      },
      orderBy: { created_date: 'desc' },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: BigInt(id) },
      select: {
        id_usuario: true,
        nombre: true,
        primer_apellido: true,
        segundo_apellido: true,
        ci_nit: true,
        email: true,
        telefono: true,
        rol: true,
        estado: true,
        created_date: true,
      },
    });

    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return usuario;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    let updateData: any = { ...dto, updated_date: new Date() };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    // Removemos id_edificio de la actualización directa en la tabla 'usuario'
    delete updateData.id_edificio;

    return this.prisma.usuario.update({
      where: { id_usuario: BigInt(id) },
      data: updateData,
    });
  }

  async remove(id: number) {
    return this.prisma.usuario.update({
      where: { id_usuario: BigInt(id) },
      data: { estado: 'INACTIVO', updated_date: new Date() },
    });
  }
}