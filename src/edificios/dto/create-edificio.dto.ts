import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEdificioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsNumber()
  @IsOptional()
  total_departamentos?: number;

  @IsString()
  @IsOptional()
  estado?: string;
}