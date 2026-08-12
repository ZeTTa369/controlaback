import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  primer_apellido: string;

  @IsString()
  @IsOptional()
  segundo_apellido?: string;

  @IsString()
  @IsNotEmpty()
  ci_nit: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNumber()
  rol: number; // 1: ADMIN, 2: CONSERJE, 3: INQUILINO

  @IsString()
  @IsOptional()
  estado?: string = 'ACTIVO';

  @IsNumber()
  @IsOptional()
  id_edificio?: number; // <-- Agregar esta línea
}