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

export class CreateProductVariantDto {
  @IsEnum(Size, {
    message: 'Некорректный размер товара',
  })
  size!: Size;

  @IsInt()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  discountPercent?: number;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{13}$/, {
    message: 'Артикул должен состоять ровно из 13 цифр',
  })
  sku!: string;
}
