import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '/images/products/monstera.jpg',
    description: 'Адрес изображения',
  })
  url!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Монстера Делициоза',
    description: 'Альтернативный текст',
  })
  alt?: string;

  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 0,
    description: 'Позиция в галерее',
    minimum: 0,
  })
  position!: number;
}
