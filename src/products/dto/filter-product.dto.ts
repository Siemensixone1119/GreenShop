import { Size } from '../../../generated/prisma/enums.js';
import { ProductCollection } from '../enums/product-collection.enum.js';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { ProductSort } from '../enums/product-sort.enum.js';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductFilterDto {
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @ApiPropertyOptional({
    example: 'монстера',
    description: 'Поиск по названию',
    maxLength: 150,
  })
  search?: string;

  @IsOptional()
  @IsEnum(ProductCollection)
  @ApiPropertyOptional({
    enum: ProductCollection,
    example: ProductCollection.NEW,
    description: 'Коллекция товаров',
  })
  collection?: ProductCollection;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    example: '00000000-0000-4000-8000-000000000001',
    description: 'Фильтр по категории',
    format: 'uuid',
  })
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 500, minimum: 0 })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 5000, minimum: 0 })
  maxPrice?: number;

  @IsOptional()
  @IsEnum(Size)
  @ApiPropertyOptional({ enum: Size, example: Size.MEDIUM })
  size?: Size;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  page?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(45)
  @ApiPropertyOptional({
    example: 9,
    minimum: 1,
    maximum: 45,
    default: 9,
  })
  limit?: number;

  @IsOptional()
  @IsEnum(ProductSort)
  @ApiPropertyOptional({
    enum: ProductSort,
    example: ProductSort.CREATE_DESC,
    description: 'Порядок сортировки',
  })
  sort?: ProductSort;
}
