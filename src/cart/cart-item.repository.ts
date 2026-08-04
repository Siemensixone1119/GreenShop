import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CartItem } from '../../generated/prisma/client.js';

@Injectable()
export class CartItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  findItem(cartId: number, productId: number): Promise<CartItem | null> {
    return this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });
  }

  create(
    cartId: number,
    productId: number,
    quantity: number,
  ): Promise<CartItem> {
    return this.prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
      },
    });
  }

  delete(cartItemId: number): Promise<CartItem> {
    return this.prisma.cartItem.delete({
      where: {
        id: cartItemId,
      },
    });
  }

  updateQuantity(cartItemId: number, quantity: number): Promise<CartItem> {
    return this.prisma.cartItem.update({
      where: {
        id: cartItemId,
      },
      data: {
        quantity,
      },
    });
  }
}
