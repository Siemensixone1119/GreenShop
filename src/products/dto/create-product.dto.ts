import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { CreateProductImageDto } from './create-product-image.dto.js';
import { Type } from 'class-transformer';
import { CreateProductVariantDto } from '../../product-variant/dto/create-product-variant.dto.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  @ApiProperty({
    example: 'Монстера Делициоза',
    description: 'Название товара',
    maxLength: 150,
  })
  name!: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiPropertyOptional({
    example: 'Тропическое растение с крупными резными листьями.',
    description: 'Описание товара',
    maxLength: 2000,
  })
  description?: string;

  @IsUUID()
  @ApiProperty({
    example: '00000000-0000-4000-8000-000000000001',
    description: 'ID категории',
    format: 'uuid',
  })
  categoryId!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  @ApiPropertyOptional({
    type: () => [CreateProductImageDto],
    description: 'Галерея товара',
    maxItems: 10,
  })
  images?: CreateProductImageDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @ApiProperty({
    type: () => [CreateProductVariantDto],
    description: 'Варианты товара',
    minItems: 1,
  })
  variants!: CreateProductVariantDto[];
}
