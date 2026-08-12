import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDepartamentoDto {
  @IsNumber()
  @IsNotEmpty()
  id_edificio: number;

  @IsString()
  @IsNotEmpty()
  numero_departamento: string;

  @IsNumber()
  @IsOptional()
  piso?: number;

  @IsNumber()
  @IsOptional()
  habitaciones?: number;

  @IsNumber()
  @IsOptional()
  banos?: number;

  @IsNumber()
  @IsOptional()
  precio_alquiler?: number;

  @IsString()
  @IsOptional()
  medidor_agua?: string;

  @IsString()
  @IsOptional()
  medidor_luz?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  estado?: string;
}