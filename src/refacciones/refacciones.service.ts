import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefaccionDto } from './dto/create-refaccion.dto';
import { UpdateRefaccionDto } from './dto/update-refaccion.dto';

@Injectable()
export class RefaccionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRefaccionDto) {
    return this.prisma.refaccion.create({ data: dto });
  }

  async findAll() {
    return this.prisma.refaccion.findMany();
  }

  async update(id: number, dto: UpdateRefaccionDto) {
    return this.prisma.refaccion.update({
      where: { id_refaccion: id },
      data: { ...dto, updated_date: new Date() },
    });
  }
}