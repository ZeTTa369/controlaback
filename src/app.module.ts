import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; 
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { EdificiosModule } from './edificios/edificios.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { ContratosModule } from './contratos/contratos.module';
import { CobrosModule } from './cobros/cobros.module';
import { PagosModule } from './pagos/pagos.module';
import { RefaccionesModule } from './refacciones/refacciones.module';
import { ConceptosModule } from './conceptos/conceptos.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // <-- Registrar el módulo de tareas programadas
    PrismaModule,
    AuthModule,
    UsuariosModule,
    EdificiosModule,
    DepartamentosModule,
    ContratosModule,
    CobrosModule,
    PagosModule,
    RefaccionesModule,
    ConceptosModule,
  ],
})
export class AppModule {}