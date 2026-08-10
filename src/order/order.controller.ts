import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { PublicUser } from '../users/types/public-user.type.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { OrderWithItems } from './types/order-with-items.type.js';
import { Order } from '../../generated/prisma/client.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(['USER', 'ADMIN'])
  @Get('my')
  getMyOrders(@CurrentUser() user: PublicUser): Promise<OrderWithItems[]> {
    return this.orderService.getMyOrders(user.id);
  }

  @Roles(['USER', 'ADMIN'])
  @Get('my/:orderId')
  getMyOrder(
    @CurrentUser() user: PublicUser,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderWithItems> {
    return this.orderService.getMyOrder(user.id, orderId);
  }

  @Roles(['ADMIN'])
  @Get('all')
  getAllOrders(): Promise<OrderWithItems[]> {
    return this.orderService.getAllOrders();
  }

  @Roles(['ADMIN'])
  @Get(':orderId')
  getOrderById(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderWithItems> {
    return this.orderService.getOrderById(orderId);
  }

  @Roles(['USER', 'ADMIN'])
  @Post()
  createOrder(
    @CurrentUser() user: PublicUser,
    @Body() data: CreateOrderDto,
  ): Promise<Order> {
    return this.orderService.createOrder(user.id, data);
  }

  @Roles(['ADMIN'])
  @Patch(':orderId/status')
  updateStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() data: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.orderService.updateStatus(orderId, data.status);
  }
}
