import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../common/decorators/trim.decorator.js';

export class CreateCategoryDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    example: 'Цветущие растения',
    description: 'Название категории',
    maxLength: 100,
  })
  name!: string;
}
