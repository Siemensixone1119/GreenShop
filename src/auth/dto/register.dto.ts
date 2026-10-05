import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @Trim()
  @IsEmail()
  @MaxLength(254)
  @ApiProperty({
    example: 'user@greenshop.test',
    description: 'Email пользователя',
    maxLength: 254,
  })
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @ApiProperty({
    example: 'GreenShop123!',
    description: 'Пароль пользователя',
    minLength: 8,
    maxLength: 72,
    writeOnly: true,
  })
  password!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @ApiProperty({
    example: 'GreenShop123!',
    description: 'Повтор пароля пользователя',
    minLength: 8,
    maxLength: 72,
    writeOnly: true,
  })
  passwordRepeat!: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'Александра',
    description: 'Имя пользователя',
    minLength: 2,
    maxLength: 100,
  })
  name!: string;
}
