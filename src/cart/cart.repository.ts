import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Cart } from '../../generated/prisma/client.js';


@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) { }

  findByUserId(userId: number): Promise<Cart | null> {
    return this.prisma.cart.findUnique({
      where: {
        userId
      }
    })
  }

  findByUserIdWithItems(userId: number) {
    return this.prisma.cart.findUnique({
      where: {
        userId
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
  }

  create(userId: number): Promise<Cart> {
    return this.prisma.cart.create({
      data: {
        userId
      }
    })
  }
}
