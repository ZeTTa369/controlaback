import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConceptoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  recurrente?: string = 'Mensual';

  @IsString()
  @IsOptional()
  estado?: string = 'ACTIVO';
}