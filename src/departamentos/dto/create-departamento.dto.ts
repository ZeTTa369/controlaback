import { 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString ,
  IsInt,
  Min

} from 'class-validator';

export class CreateDepartamentoDto {
  @IsNotEmpty({ message: 'El edificio es obligatorio' })
  @IsNumber()
  id_edificio: number;

  @IsOptional()
  @IsNumber()
  piso?: number;

  @IsNotEmpty({ message: 'El número o identificador del departamento es obligatorio' })
  @IsString()
  numero_departamento: string;

  @IsOptional()
  @IsString()
  bloque?: string; // 'FRONTAL' o 'TRASERO'

  @IsOptional()
  @IsString()
  medidor_agua?: string; // 'INDEPENDIENTE', 'COMPARTIDO' o 'NO_TIENE'

  @IsOptional()
  @IsString()
  medidor_luz?: string; // 'INDEPENDIENTE', 'COMPARTIDO' o 'NO_TIENE'

  @IsOptional()
  @IsString()
  tipo_inmueble?: string; // 'DEPARTAMENTO', 'MONOAMBIENTE', 'CUARTO', 'GARZONIER', 'GALERIA_TIENDA'

  @IsOptional()
  @IsString()
  estado?: string; // 'DISPONIBLE', 'OCUPADO', 'MANTENIMIENTO'

  @IsOptional()
  @IsNumber()
  habitaciones?: number;

  @IsOptional()
  @IsNumber()
  banos?: number;

  @IsOptional()
  @IsNumber()
  precio_alquiler?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsInt({ message: 'El número de llaves debe ser un entero' })
  @Min(0, { message: 'El número de llaves no puede ser negativo' })
  numero_llaves?: number;
}