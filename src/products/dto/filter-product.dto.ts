import { Size } from '../../../generated/prisma/enums.js';
import { ProductCollection } from '../enums/product-collection.enum.js';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { ProductSort } from '../enums/product-sort.enum.js';

export class ProductFilterDto {
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  search?: string;

  @IsOptional()
  @IsEnum(ProductCollection)
  collection?: ProductCollection;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(Size)
  size?: Size;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page!: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(45)
  limit!: number;

  @IsOptional()
  @IsEnum(ProductSort)
  sort?: ProductSort;
}
