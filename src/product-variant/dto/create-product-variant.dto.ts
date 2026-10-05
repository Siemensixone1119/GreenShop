import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Size } from '../../../generated/prisma/enums.js';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @IsEnum(Size, {
    message: 'Некорректный размер товара',
  })
  @ApiProperty({
    enum: Size,
    example: Size.MEDIUM,
    description: 'Размер варианта товара',
  })
  size!: Size;

  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 1790,
    description: 'Цена в минимальных денежных единицах',
    minimum: 0,
  })
  price!: number;

  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 12,
    description: 'Количество товара на складе',
    minimum: 0,
  })
  stock!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  @ApiPropertyOptional({
    example: 15,
    description: 'Скидка в процентах',
    minimum: 0,
    maximum: 99,
    default: 0,
  })
  discountPercent?: number;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{13}$/, {
    message: 'Артикул должен состоять ровно из 13 цифр',
  })
  @ApiProperty({
    example: '4601234567890',
    description: 'Уникальный артикул из 13 цифр',
    pattern: '^\\d{13}$',
  })
  sku!: string;
}
