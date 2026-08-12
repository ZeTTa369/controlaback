import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRefaccionDto {
  @IsNumber()
  @IsOptional()
  id_edificio?: number;

  @IsNumber()
  @IsOptional()
  id_departamento?: number;

  @IsNumber()
  @IsNotEmpty()
  id_usuario: number; // Quien reporta o asigna

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  tipo: string; // AREA_COMUN, DEPARTAMENTO, ESTRUCTURAL

  @IsString()
  @IsNotEmpty()
  prioridad: string; // ALTA, MEDIA, BAJA

  @IsNumber()
  @IsOptional()
  costo_estimado?: number;

  @IsString()
  @IsOptional()
  moneda?: string = 'BOB';

  @IsString()
  @IsOptional()
  proveedor?: string;

  @IsDateString()
  @IsOptional()
  fecha_solicitud?: string;
}