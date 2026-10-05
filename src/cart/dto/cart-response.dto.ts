import { ApiProperty } from '@nestjs/swagger';
import { Size } from '../../../generated/prisma/enums.js';
import { ProductImageResponseDto } from '../../products/dto/product-image-response.dto.js';
import { CartItemResponseDto } from './cart-item-response.dto.js';

class CartProductResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Монстера Делициоза' })
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ format: 'uuid' })
  categoryId!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: () => [ProductImageResponseDto] })
  images!: ProductImageResponseDto[];
}

class CartProductVariantResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty({ enum: Size })
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

  @ApiProperty({ type: () => CartProductResponseDto })
  product!: CartProductResponseDto;
}

class CartItemWithProductResponseDto extends CartItemResponseDto {
  @ApiProperty({ type: () => CartProductVariantResponseDto })
  productVariant!: CartProductVariantResponseDto;
}

export class CartResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: () => [CartItemWithProductResponseDto] })
  items!: CartItemWithProductResponseDto[];
}
