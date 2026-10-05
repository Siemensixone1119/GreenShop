import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../../generated/prisma/enums.js';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Некорректный статус заказа' })
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    description: 'Новый статус заказа',
  })
  status!: OrderStatus;
}
