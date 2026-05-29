import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price!: number;

    @IsNotEmpty()
    @IsNumber()
    stock!: number;

    @IsNotEmpty()
    @IsNumber()
    categoryId!: number;

    @IsOptional()
    @IsString()
    image?: string;
}