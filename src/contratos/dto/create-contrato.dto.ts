import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContratoDto {
  @IsNumber()
  @IsNotEmpty()
  id_departamento: number;

  @IsNumber()
  @IsNotEmpty()
  id_usuario: number; // Inquilino

  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_fin: string;

  @IsNumber()
  @IsNotEmpty()
  monto_renta: number;

  @IsString()
  @IsNotEmpty()
  moneda: string; // BOB, USD

  @IsNumber()
  @IsOptional()
  garantia?: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  conceptosIds: number[]; // Conceptos asociados (Renta, Expensas, Mantenimiento)
}