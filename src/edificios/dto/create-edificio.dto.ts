import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

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

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  tiene_parqueo_moto?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  tiene_ascensor?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  tiene_conserje?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  tiene_camaras?: boolean;

  @IsOptional()
  @IsString()
  ubicacion_url?: string;
}