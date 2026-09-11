import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class PagarCobroDto {
  @IsNumber()
  @IsNotEmpty()
  monto: number;

  @IsString()
  @IsNotEmpty()
  metodo_pago: string;

  @IsString()
  @IsOptional()
  comprobante?: string;

  @IsNumber()
  @IsOptional()
  nuevo_monto?: number;

  @IsString()
  @IsOptional()
  motivo_ajuste?: string;
}