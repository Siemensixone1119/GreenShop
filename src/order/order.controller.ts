import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  OrderResponseDto,
  OrderWithItemsResponseDto,
} from './dto/order-response.dto.js';

@ApiCookieAuth('accessToken')
@ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
@ApiForbiddenResponse({ description: 'Недостаточно прав' })
@ApiTooManyRequestsResponse({ description: 'Превышен лимит запросов' })
@ApiTags('Orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(['USER', 'ADMIN'])
  @ApiOperation({ summary: 'Получение заказов текущего пользователя' })
  @ApiOkResponse({
    description: 'Список заказов получен',
    type: [OrderWithItemsResponseDto],
  })
  @Get('my')
  getMyOrders(@CurrentUser() user: PublicUser): Promise<OrderWithItems[]> {
    return this.orderService.getMyOrders(user.id);
  }

  @Roles(['USER', 'ADMIN'])
  @ApiOperation({ summary: 'Получение своего заказа по id' })
  @ApiOkResponse({
    description: 'Заказ получен',
    type: OrderWithItemsResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректный id заказа' })
  @ApiNotFoundResponse({ description: 'Заказ не найден' })
  @Get('my/:orderId')
  getMyOrder(
    @CurrentUser() user: PublicUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<OrderWithItems> {
    return this.orderService.getMyOrder(user.id, orderId);
  }

  @Roles(['ADMIN'])
  @ApiOperation({ summary: 'Получение всех заказов' })
  @ApiOkResponse({
    description: 'Список всех заказов',
    type: [OrderWithItemsResponseDto],
  })
  @Get('all')
  getAllOrders(): Promise<OrderWithItems[]> {
    return this.orderService.getAllOrders();
  }

  @Roles(['ADMIN'])
  @ApiOperation({ summary: 'Получение заказа по id' })
  @ApiOkResponse({
    description: 'Заказ получен',
    type: OrderWithItemsResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректный id заказа' })
  @ApiNotFoundResponse({ description: 'Заказ не найден' })
  @Get(':orderId')
  getOrderById(
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<OrderWithItems> {
    return this.orderService.getOrderById(orderId);
  }

  @Roles(['USER', 'ADMIN'])
  @ApiOperation({ summary: 'Создание заказа' })
  @ApiCreatedResponse({ description: 'Заказ создан', type: OrderResponseDto })
  @ApiBadRequestResponse({
    description: 'Корзина пуста, недостаточно товара или данные некорректны',
  })
  @Post()
  createOrder(
    @CurrentUser() user: PublicUser,
    @Body() data: CreateOrderDto,
  ): Promise<Order> {
    return this.orderService.createOrder(user.id, data);
  }

  @Roles(['ADMIN'])
  @ApiOperation({ summary: 'Изменение статуса заказа' })
  @ApiOkResponse({
    description: 'Статус заказа обновлён',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные id или статус' })
  @ApiNotFoundResponse({ description: 'Заказ не найден' })
  @Patch(':orderId/status')
  updateStatus(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() data: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.orderService.updateStatus(orderId, data.status);
  }
}
