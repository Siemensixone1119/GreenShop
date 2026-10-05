import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
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
}
