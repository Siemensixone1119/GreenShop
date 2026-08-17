import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Size } from '../../../generated/prisma/enums.js';
import { Trim } from '../../common/decorators/trim.decorator.js';

export class UpdateProductVariantDto {
  @IsOptional()
  @IsEnum(Size, {
    message: 'Некорректный размер товара',
  })
  size?: Size;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @Trim()
  @IsOptional()
  @IsString()
  @Matches(/^\d{13}$/, {
    message: 'Артикул должен состоять ровно из 13 цифр',
  })
  sku?: string;
}
