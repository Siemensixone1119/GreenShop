import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';

export class CreateCategoryDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;
}
