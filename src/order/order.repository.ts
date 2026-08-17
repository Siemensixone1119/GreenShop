import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { OrderWithItems } from './types/order-with-items.type.js';
import type { OrderStatus } from '../../generated/prisma/enums.js';
import type { Order } from '../../generated/prisma/client.js';
import type { CreateOrderData } from './types/create-order-data.type.js';

@Injectable()
export class OrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(
    userId: number,
    data: CreateOrderData,
    cartId: number,
  ): Promise<Order> {
    return this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },

          totalPrice: data.totalPrice,
          firstName: data.firstName,
          lastName: data.lastName,
          region: data.region,
          city: data.city,
          street: data.street,
          house: data.house,
          apartment: data.apartment,
          postalCode: data.postalCode,
          phone: data.phone,
          email: data.email,

          items: {
            create: data.items.map((item) => ({
              productVariant: {
                connect: { id: item.productVariantId },
              },
              productName: item.productName,
              price: item.price,
              size: item.size,
              quantity: item.quantity,
              image: item.image,
            })),
          },
        },
      });

      for (const item of data.items) {
        const result = await tx.productVariant.updateMany({
          data: {
            stock: { decrement: item.quantity },
          },
          where: {
            id: item.productVariantId,
            stock: {
              gte: item.quantity,
            },
          },
        });

        if (result.count === 0) {
          throw new BadRequestException(
            `Недостаточно товара "${item.productName}"`,
          );
        }
      }

      await tx.cartItem.deleteMany({
        where: {
          cartId,
        },
      });

      return order;
    });
  }

  findByIdWithItems(orderId: number): Promise<OrderWithItems | null> {
    return this.prismaService.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });
  }

  findByUserIdWithItems(userId: number): Promise<OrderWithItems[]> {
    return this.prismaService.order.findMany({
      where: {
        userId,
      },
      include: {
        items: true,
      },
    });
  }

  findByIdAndUserIdWithItems(
    orderId: number,
    userId: number,
  ): Promise<OrderWithItems | null> {
    return this.prismaService.order.findUnique({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
      },
    });
  }

  findAllWithItems(): Promise<OrderWithItems[]> {
    return this.prismaService.order.findMany({
      include: {
        items: true,
      },
    });
  }

  updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    return this.prismaService.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });
  }
}
