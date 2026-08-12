import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SecretKeyControlaBack2026',
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: payload.sub },
    });

    if (!usuario || usuario.estado === 'INACTIVO') {
      throw new UnauthorizedException('Usuario no autorizado o inactivo');
    }

    // El objeto retornado se adjunta automáticamente a req.user
    return {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
    };
  }
}