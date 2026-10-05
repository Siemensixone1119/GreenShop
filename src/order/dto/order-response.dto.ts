import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../generated/prisma/enums.js';
import { OrderItemResponseDto } from './order-item-response.dto.js';

export class OrderResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  userId!: string | null;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.NEW })
  status!: OrderStatus;

  @ApiProperty({ example: 3580 })
  totalPrice!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ example: 'Александра' })
  firstName!: string;

  @ApiProperty({ example: 'Иванова' })
  lastName!: string;

  @ApiProperty({ example: 'Московская область' })
  region!: string;

  @ApiProperty({ example: 'Москва' })
  city!: string;

  @ApiProperty({ example: 'Зелёная улица' })
  street!: string;

  @ApiProperty({ example: '15А' })
  house!: string;

  @ApiProperty({ example: '42', nullable: true })
  apartment!: string | null;

  @ApiProperty({ example: '123456', nullable: true })
  postalCode!: string | null;

  @ApiProperty({ example: '+7 (999) 123-45-67' })
  phone!: string;

  @ApiProperty({ example: 'customer@greenshop.test', format: 'email' })
  email!: string;
}

export class OrderWithItemsResponseDto extends OrderResponseDto {
  @ApiProperty({ type: () => [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];
}
