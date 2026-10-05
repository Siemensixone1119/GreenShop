import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductImageDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '/images/products/monstera-new.jpg',
    description: 'Новый адрес изображения',
  })
  url?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Монстера Делициоза',
    description: 'Новый альтернативный текст',
  })
  alt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({
    example: 1,
    description: 'Новая позиция в галерее',
    minimum: 0,
  })
  position?: number;
}
