import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class AddCartItemDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  productId!:number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity!: number
}