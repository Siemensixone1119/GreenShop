import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  @ApiProperty({
    example: '00000000-0000-4000-8000-000000000001',
    description: 'ID варианта товара',
    format: 'uuid',
  })
  productVariantId!: string;

  @IsInt()
  @Min(1)
  @ApiProperty({
    example: 5,
    description: 'Количество единиц товара',
    minimum: 1,
  })
  quantity!: number;
}
