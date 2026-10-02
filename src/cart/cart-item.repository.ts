import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CartItem } from '../../generated/prisma/client.js';

@Injectable()
export class CartItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  findItem(cartId: string, productVariantId: string): Promise<CartItem | null> {
    return this.prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId,
          productVariantId,
        },
      },
    });
  }

  create(
    cartId: string,
    productVariantId: string,
    quantity: number,
  ): Promise<CartItem> {
    return this.prisma.cartItem.create({
      data: {
        cartId,
        productVariantId,
        quantity,
      },
    });
  }

  delete(cartItemId: string): Promise<CartItem> {
    return this.prisma.cartItem.delete({
      where: {
        id: cartItemId,
      },
    });
  }

  updateQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
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
