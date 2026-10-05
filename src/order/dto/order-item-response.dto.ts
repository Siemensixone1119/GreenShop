import { ApiProperty } from '@nestjs/swagger';
import { Size } from '../../../generated/prisma/enums.js';

export class OrderItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  productVariantId!: string | null;

  @ApiProperty({ example: 'Монстера Делициоза' })
  productName!: string;

  @ApiProperty({ example: 1790 })
  price!: number;

  @ApiProperty({ enum: Size, example: Size.MEDIUM })
  size!: Size;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: '/images/products/monstera.jpg', nullable: true })
  image!: string | null;
}
