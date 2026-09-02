import { 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsDateString 
} from 'class-validator';

export class CreateRefaccionDto {
  @IsOptional()
  @IsNumber()
  id_edificio?: number;

  @IsOptional()
  @IsNumber()
  id_departamento?: number;

  @IsOptional()
  @IsNumber()
  id_usuario?: number;

  @IsNotEmpty({ message: 'El título de la refacción es obligatorio' })
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  tipo?: string; // Ej: 'PLOMERIA', 'ELECTRICIDAD', 'PINTURA', 'ESTRUCTURAL', 'GENERAL'

  @IsOptional()
  @IsString()
  prioridad?: string; // 'BAJA', 'MEDIA', 'ALTA', 'URGENTE'

  @IsOptional()
  @IsNumber()
  costo_mano_obra?: number;

  @IsOptional()
  @IsNumber()
  costo_material?: number;

  @IsOptional()
  @IsNumber()
  costo_total?: number;

  @IsOptional()
  @IsString()
  moneda?: string; // 'BOB' o 'USD'

  @IsOptional()
  @IsString()
  proveedor?: string;

  @IsOptional()
  @IsDateString()
  fecha_solicitud?: string;

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  estado?: string; // 'PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'
}