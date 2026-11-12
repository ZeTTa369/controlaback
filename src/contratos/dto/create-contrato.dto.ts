import { 
  IsArray, 
  IsDateString, 
  IsInt, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  Min 
} from 'class-validator';

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
  @IsInt({ message: 'El numero de llaves debe ser un entero' })
  @Min(0, { message: 'El numero de llaves no puede ser negativo' })
  numero_llaves?: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  conceptosIds: number[];
}