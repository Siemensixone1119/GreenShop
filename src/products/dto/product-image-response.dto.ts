import { ApiProperty } from '@nestjs/swagger';

export class ProductImageResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty({ example: '/images/products/monstera.jpg' })
  url!: string;

  @ApiProperty({ example: 'Монстера Делициоза', nullable: true })
  alt!: string | null;

  @ApiProperty({ example: 0 })
  position!: number;
}
