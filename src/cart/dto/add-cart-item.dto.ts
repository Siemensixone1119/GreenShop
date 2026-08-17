import { IsInt, Min } from 'class-validator';

export class AddCartItemDto {
  @IsInt()
  @Min(1)
  productVariantId!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}
