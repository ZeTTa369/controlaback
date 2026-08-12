import { PartialType } from '@nestjs/mapped-types';
import { CreateRefaccionDto } from './create-refaccion.dto';

export class UpdateRefaccionDto extends PartialType(CreateRefaccionDto) {}