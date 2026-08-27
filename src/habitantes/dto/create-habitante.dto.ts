import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHabitanteDto {
  @IsOptional()
  @IsNumber()
  id_contrato?: number;

  @IsOptional()
  @IsNumber()
  id_departamento?: number;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombres: string;

  @IsNotEmpty({ message: 'El primer apellido es obligatorio' })
  @IsString()
  primer_apellido: string;

  @IsOptional()
  @IsString()
  segundo_apellido?: string;

  @IsOptional()
  @IsString()
  ci_nit?: string;

  @IsOptional()
  @IsString()
  parentesco?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  es_titular?: string; // 'SI' o 'NO'

  @IsOptional()
  @IsString()
  estado?: string;
}