import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Get, 
  Patch, 
  Param, 
  ParseIntPipe, 
  UseGuards, 
  Request, 
  UnauthorizedException 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CambiarPasswordDto, RecuperarPasswordDto } from './dto/cambiar-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  /**
   * Endpoint para que cualquier usuario cambie su propia contraseña
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('cambiar-password')
  cambiarPassword(@Request() req: any, @Body() dto: CambiarPasswordDto) {
    // req.user.sub o req.user.id_usuario según cómo armaste el payload en login()
    const idUsuario = Number(req.user.sub || req.user.id_usuario);
    return this.authService.cambiarPasswordPropia(idUsuario, dto);
  }

  /**
   * Endpoint administrativo para resetear la contraseña de un usuario
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('resetear-password/:id')
  resetearPasswordAdmin(
    @Request() req: any,
    @Param('id', ParseIntPipe) idUsuarioObjetivo: number,
    @Body() dto: CambiarPasswordDto,
  ) {
    // Verificamos que quien hace la petición tenga rol de ADMIN
    if (req.user.rol !== 'ADMIN') {
      throw new UnauthorizedException('No tienes permisos para realizar esta acción');
    }

    return this.authService.resetearPasswordAdmin(idUsuarioObjetivo, dto);
  }

  @HttpCode(HttpStatus.OK)
@Post('recuperar-password')
recuperarPassword(@Body() dto: RecuperarPasswordDto) {
  return this.authService.recuperarPasswordPublico(dto);
}
}