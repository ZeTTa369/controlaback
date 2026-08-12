import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * TAREA 1: Verificación / Respaldo mensual de cobros de alquiler
   * Se ejecuta el primer día de cada mes a las 00:00 (Medianoche).
   * Genera el cobro únicamente si no se creó previamente al registrar el contrato.
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generarCobrosMensuales() {
    this.logger.log('Iniciando tarea programada: Verificación mensual de cobros...');

    try {
      const hoy = new Date();
      const mesActual = hoy.getMonth() + 1;
      const anioActual = hoy.getFullYear();

      // 1. Obtener todos los contratos en estado ACTIVO o POR_VENCER
      const contratosActivos = await this.prisma.contrato.findMany({
        where: {
          estado: { in: ['ACTIVO', 'POR_VENCER'] },
        },
      });

      if (contratosActivos.length === 0) {
        this.logger.log('No se encontraron contratos activos para verificar cobros.');
        return;
      }

      let cobrosGenerados = 0;

      for (const contrato of contratosActivos) {
        const idContratoBigInt = contrato.id_contrato;

        // 2. Verificar si ya existe un cobro para este período (evita duplicar cobros autogenerados)
        const cobroExistente = await this.prisma.cobro.findFirst({
          where: {
            id_contrato: idContratoBigInt,
            periodo_mes: mesActual,
            periodo_anio: anioActual,
          },
        });

        if (!cobroExistente) {
          // Fecha de vencimiento por defecto: día 10 del mes actual
          const fechaVencimiento = new Date(anioActual, hoy.getMonth(), 10);

          await this.prisma.cobro.create({
            data: {
              id_contrato: idContratoBigInt,
              id_concepto: 1, // ID por defecto para Alquiler / Renta
              monto: contrato.monto_renta,
              moneda: contrato.moneda || 'BOB',
              descripcion: `Alquiler mes ${mesActual}/${anioActual}`,
              periodo_mes: mesActual,
              periodo_anio: anioActual,
              fecha_emision: hoy,
              fecha_vencimiento: fechaVencimiento,
              estado: 'PENDIENTE',
            },
          });

          cobrosGenerados++;
        }
      }

      this.logger.log(`Proceso completado. Se generaron ${cobrosGenerados} cobros faltantes.`);
    } catch (error) {
      this.logger.error(
        'Error en la tarea de generación mensual de cobros (PostgreSQL no disponible o falla de query):',
        error.message,
      );
    }
  }

  /**
   * TAREA 2: Alerta y cambio de estado a contratos por vencer (próximos 30 días)
   * Se ejecuta todos los días a la 01:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async revisarContratosPorVencer() {
    this.logger.log('Iniciando revisión diaria de contratos por vencer...');

    try {
      const hoy = new Date();
      const fecha30DiasFuturo = new Date();
      fecha30DiasFuturo.setDate(hoy.getDate() + 30);

      // Actualizar contratos ACTIVO cuya fecha_fin esté dentro del rango de los próximos 30 días
      const resultado = await this.prisma.contrato.updateMany({
        where: {
          estado: 'ACTIVO',
          fecha_fin: {
            lte: fecha30DiasFuturo,
            gte: hoy,
          },
        },
        data: {
          estado: 'POR_VENCER',
          updated_date: new Date(),
        },
      });

      if (resultado.count > 0) {
        this.logger.warn(`Se actualizaron ${resultado.count} contratos al estado POR_VENCER.`);
      } else {
        this.logger.log('No se encontraron nuevos contratos próximos a vencer hoy.');
      }
    } catch (error) {
      this.logger.error(
        'Error en la revisión diaria de contratos por vencer (PostgreSQL no disponible):',
        error.message,
      );
    }
  }
}