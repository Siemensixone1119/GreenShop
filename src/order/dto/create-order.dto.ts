import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';

export class CreateOrderDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  firstName!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  lastName!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  region!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  city!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  street!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  house!: string;

  @Trim()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  apartment?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(3, 12)
  postalCode?: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9\s()-]{7,20}$/, {
    message: 'Некорректный формат телефона',
  })
  phone!: string;

  @Trim()
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
