import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CartService } from './cart.service.js';
import type { PublicUser } from '../users/types/public-user.type.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';
import type { CartWithItems } from './types/cart-with-items.type.js';
import type { CartItem } from '../../generated/prisma/client.js';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CartResponseDto } from './dto/cart-response.dto.js';
import { CartItemResponseDto } from './dto/cart-item-response.dto.js';

@ApiCookieAuth('accessToken')
@ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
@ApiTooManyRequestsResponse({ description: 'Превышен лимит запросов' })
@ApiTags('Cart')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Получение корзины текущего пользователя' })
  @ApiOkResponse({ description: 'Корзина получена', type: CartResponseDto })
  @ApiNotFoundResponse({ description: 'Корзина не найдена' })
  @Get()
  getMyCart(@CurrentUser() user: PublicUser): Promise<CartWithItems> {
    return this.cartService.getMyCart(user.id);
  }

  @ApiOperation({ summary: 'Добавление товара в корзину' })
  @ApiCreatedResponse({
    description: 'Товар добавлен в корзину',
    type: CartItemResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные или недостаточно товара',
  })
  @ApiNotFoundResponse({ description: 'Вариант товара не найден' })
  @Post('items')
  addItem(
    @CurrentUser() user: PublicUser,
    @Body() data: AddCartItemDto,
  ): Promise<CartItem> {
    return this.cartService.addItem(user.id, data);
  }

  @ApiOperation({ summary: 'Изменение количества товара в корзине' })
  @ApiOkResponse({
    description: 'Количество товара обновлено',
    type: CartItemResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные или недостаточно товара',
  })
  @ApiNotFoundResponse({ description: 'Позиция корзины не найдена' })
  @Patch('items/:productVariantId')
  updateQuantity(
    @CurrentUser() user: PublicUser,
    @Param('productVariantId', ParseUUIDPipe) productVariantId: string,
    @Body() data: UpdateCartItemDto,
  ): Promise<CartItem> {
    return this.cartService.updateQuantity(user.id, productVariantId, data);
  }

  @ApiOperation({ summary: 'Удаление товара из корзины' })
  @ApiOkResponse({
    description: 'Товар удалён из корзины',
    type: CartItemResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректный id варианта' })
  @ApiNotFoundResponse({ description: 'Позиция корзины не найдена' })
  @Delete('items/:productVariantId')
  removeItem(
    @CurrentUser() user: PublicUser,
    @Param('productVariantId', ParseUUIDPipe) productVariantId: string,
  ): Promise<CartItem> {
    return this.cartService.removeItem(user.id, productVariantId);
  }
}
