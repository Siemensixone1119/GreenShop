import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../common/decorators/trim.decorator.js';

export class UpdateCategoryDto {
  @Trim()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiPropertyOptional({
    example: 'Декоративно-лиственные растения',
    description: 'Новое название категории',
    maxLength: 100,
  })
  name?: string;
}
