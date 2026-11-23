import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsDateString, 
  IsInt, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  Max, 
  Min, 
  ValidateNested 
} from 'class-validator';

export class ConceptoContratoItemDto {
  @IsNumber()
  id_concepto: number;

  @IsNumber()
  @Min(0)
  monto: number;
}

export class HabitanteContratoItemDto {
  @IsOptional()
  @IsString()
  nombres?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  primer_apellido?: string;

  @IsOptional()
  @IsString()
  segundo_apellido?: string;

  @IsOptional()
  @IsString()
  ci_nit?: string;

  @IsOptional()
  @IsString()
  ci?: string;

  @IsOptional()
  @IsString()
  parentesco?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  es_titular?: string;

  @IsOptional()
  @IsString()
  nacionalidad?: string;
}

export class CreateContratoDto {
  @IsNumber()
  @IsNotEmpty()
  id_departamento: number;

  @IsNumber()
  @IsNotEmpty()
  id_usuario: number;

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
  moneda: string;

  @IsNumber()
  @IsOptional()
  garantia?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  numero_llaves?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dia_limite_fin?: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  conceptosIds: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConceptoContratoItemDto)
  conceptosDetalle?: ConceptoContratoItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabitanteContratoItemDto)
  habitantes?: HabitanteContratoItemDto[];
}