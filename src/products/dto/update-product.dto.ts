import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @Trim()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @ApiPropertyOptional({
    example: 'Монстера Делициоза',
    description: 'Новое название товара',
    maxLength: 150,
  })
  name?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiPropertyOptional({
    example: 'Обновлённое описание товара.',
    maxLength: 2000,
  })
  description?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    example: '00000000-0000-4000-8000-000000000002',
    description: 'ID новой категории',
    format: 'uuid',
  })
  categoryId?: string;
}
