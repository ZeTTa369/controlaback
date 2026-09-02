import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEdificioDto {
  @IsNotEmpty({ message: 'El nombre del edificio es obligatorio' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @IsString()
  direccion: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  imagen?: string;

  @IsOptional()
  @IsNumber()
  total_departamentos?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}