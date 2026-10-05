import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  @ApiProperty({
    example: 5,
    description: 'Новое количество товара',
    minimum: 1,
  })
  quantity!: number;
}
