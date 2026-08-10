import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductImageDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  alt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
