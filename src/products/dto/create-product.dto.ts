import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { CreateProductImageDto } from './create-product-image.dto.js';
import { Type } from 'class-transformer';
import { CreateProductVariantDto } from '../../product-variant/dto/create-product-variant.dto.js';

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
  @Min(1)
  categoryId!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants!: CreateProductVariantDto[];
}
