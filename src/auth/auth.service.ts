import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Normalizar email quitando espacios extra
    const emailLimpio = email.trim();

    this.logger.log(`Buscando usuario con email: "${emailLimpio}"`);

    // 1. Buscar usuario por email exacto o insensible a mayúsculas
    const usuario = await this.prisma.usuario.findFirst({
      where: { 
        email: {
          equals: emailLimpio,
          mode: 'insensitive',
        }
      },
    });

    if (!usuario) {
      this.logger.error(`Usuario NO encontrado para el email: ${emailLimpio}`);
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (usuario.estado === 'INACTIVO') {
      this.logger.warn(`El usuario ${emailLimpio} está INACTIVO`);
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    // 2. Comparar la contraseña ingresada con el hash guardado
    const isPasswordValid = await bcrypt.compare(password, usuario.password || '');
    
    this.logger.log(`Resultado de validación de contraseña: ${isPasswordValid}`);

    if (!isPasswordValid) {
      this.logger.error(`Contraseña incorrecta para el usuario: ${emailLimpio}`);
      
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