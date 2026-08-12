import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePagoDto {
  @IsNumber()
  @IsNotEmpty()
  id_cobro: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'El monto pagado debe ser mayor a 0' })
  monto_pagado: number;

  @IsString()
  @IsNotEmpty()
  forma_pago: string; // EFECTIVO, QR, TRANSFERENCIA

  @IsString()
  @IsOptional()
  numero_comprobante?: string;

  @IsDateString()
  @IsOptional()
  fecha_pago?: string;
}