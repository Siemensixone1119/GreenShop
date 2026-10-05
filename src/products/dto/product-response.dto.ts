import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto.js';
import { ProductVariantResponseDto } from '../../product-variant/dto/product-variant-response.dto.js';
import { ProductImageResponseDto } from './product-image-response.dto.js';

export class ProductResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Монстера Делициоза' })
  name!: string;

  @ApiProperty({
    example: 'Тропическое растение с крупными резными листьями.',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({ format: 'uuid' })
  categoryId!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: () => CategoryResponseDto })
  category!: CategoryResponseDto;

  @ApiProperty({ type: () => [ProductImageResponseDto] })
  images!: ProductImageResponseDto[];

  @ApiProperty({ type: () => [ProductVariantResponseDto] })
  variants!: ProductVariantResponseDto[];
}
