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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @ApiProperty({
    example: 'Александра',
    description: 'Имя пользователя',
    minLength: 2,
    maxLength: 50,
  })
  firstName!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @ApiProperty({
    example: 'Иванова',
    description: 'Фамилия пользователя',
    minLength: 2,
    maxLength: 50,
  })
  lastName!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @ApiProperty({
    example: 'Московская область',
    description: 'Область/Регион',
    minLength: 2,
    maxLength: 100,
  })
  region!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @ApiProperty({
    example: 'Москва',
    description: 'Город/Населенный пункт',
    minLength: 2,
    maxLength: 100,
  })
  city!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  @ApiProperty({
    example: 'Зелёная улица',
    description: 'Улица',
    minLength: 2,
    maxLength: 150,
  })
  street!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @ApiProperty({
    example: '15А',
    description: 'Дом',
    maxLength: 20,
  })
  house!: string;

  @Trim()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @ApiPropertyOptional({
    example: '42',
    description: 'Квартира',
    maxLength: 20,
  })
  apartment?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(3, 12)
  @ApiPropertyOptional({
    example: '123456',
    description: 'Почтовый индекс',
    minLength: 3,
    maxLength: 12,
  })
  postalCode?: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9\s()-]{7,20}$/, {
    message: 'Некорректный формат телефона',
  })
  @ApiProperty({
    example: '+7 (999) 123-45-67',
    description: 'Контактный телефон получателя',
  })
  phone!: string;

  @Trim()
  @IsEmail()
  @MaxLength(254)
  @ApiProperty({
    example: 'customer@greenshop.test',
    description: 'Email для информации о заказе',
    maxLength: 254,
  })
  email!: string;
}
