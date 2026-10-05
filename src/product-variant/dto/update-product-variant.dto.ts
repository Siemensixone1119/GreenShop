import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Size } from '../../../generated/prisma/enums.js';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductVariantDto {
  @IsOptional()
  @IsEnum(Size, {
    message: 'Некорректный размер товара',
  })
  @ApiPropertyOptional({
    enum: Size,
    example: Size.LARGE,
    description: 'Новый размер варианта',
  })
  size?: Size;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 1990, minimum: 0 })
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ example: 8, minimum: 0 })
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  @ApiPropertyOptional({ example: 20, minimum: 0, maximum: 99 })
  discountPercent?: number;

  @Trim()
  @IsOptional()
  @IsString()
  @Matches(/^\d{13}$/, {
    message: 'Артикул должен состоять ровно из 13 цифр',
  })
  @ApiPropertyOptional({
    example: '4601234567891',
    description: 'Новый артикул из 13 цифр',
    pattern: '^\\d{13}$',
  })
  sku?: string;
}
