import { IsNotEmpty, IsString, IsEmail, MaxLength } from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';

export class LoginUserDto {
  @Trim()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(72)
  password!: string;
}
