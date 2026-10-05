import { ApiProperty } from '@nestjs/swagger';
import { Size } from '../../../generated/prisma/enums.js';

export class ProductVariantResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty({ enum: Size, example: Size.MEDIUM })
  size!: Size;

  @ApiProperty({ example: 1790 })
  price!: number;

  @ApiProperty({ example: 12 })
  stock!: number;

  @ApiProperty({ example: '4601234567890' })
  sku!: string;

  @ApiProperty({ example: 15 })
  discountPercent!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
