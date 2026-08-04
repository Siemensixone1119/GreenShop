import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';

export class CreateProductDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name!: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsInt()
  @Min(1)
  categoryId!: number;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;
}
