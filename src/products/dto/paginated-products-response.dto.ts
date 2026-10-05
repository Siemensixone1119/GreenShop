import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto.js';

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: () => [ProductResponseDto] })
  items!: ProductResponseDto[];

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 9 })
  limit!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}
