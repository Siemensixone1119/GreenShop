import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getMyCart(@CurrentUser() user: PublicUser): Promise<CartWithItems> {
    return this.cartService.getMyCart(user.id);
  }

  @Post('items')
  addItem(
    @CurrentUser() user: PublicUser,
    @Body() data: AddCartItemDto,
  ): Promise<CartItem> {
    return this.cartService.addItem(user.id, data);
  }

  @Patch('items/:productVariantId')
  updateQuantity(
    @CurrentUser() user: PublicUser,
    @Param('productVariantId', ParseIntPipe) productVariantId: number,
    @Body() data: UpdateCartItemDto,
  ): Promise<CartItem> {
    return this.cartService.updateQuantity(user.id, productVariantId, data);
  }

  @Delete('items/:productVariantId')
  removeItem(
    @CurrentUser() user: PublicUser,
    @Param('productVariantId', ParseIntPipe) productVariantId: number,
  ): Promise<CartItem> {
    return this.cartService.removeItem(user.id, productVariantId);
  }
}
