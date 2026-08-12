import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Buscar usuario por email
    const usuario = await this.prisma.usuario.findFirst({
      where: { email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (usuario.estado === 'INACTIVO') {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    // 2. Comparar la contraseña ingresada con el hash guardado
    const isPasswordValid = await bcrypt.compare(password, usuario.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Generar el payload y firmar el Token JWT
    const payload = {
      sub: Number(usuario.id_usuario),
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        primer_apellido: usuario.primer_apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}