import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Cart } from '../../generated/prisma/client.js';
import type { CartWithItems } from './types/cart-with-items.type.js';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: number): Promise<Cart | null> {
    return this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });
  }

  findByUserIdWithItems(userId: number): Promise<CartWithItems | null> {
    return this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: {
                      orderBy: {
                        position: 'asc',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  create(userId: number): Promise<Cart> {
    return this.prisma.cart.create({
      data: {
        userId,
      },
    });
  }
}
