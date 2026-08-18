import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from './order.repository.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { CartService } from '../cart/cart.service.js';
import type { CreateOrderItemData } from './types/create-order-item-data.type.js';
import type { CreateOrderData } from './types/create-order-data.type.js';
import type { OrderStatus } from '../../generated/prisma/enums.js';
import type { Order } from '../../generated/prisma/client.js';
import type { OrderWithItems } from './types/order-with-items.type.js';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartService: CartService,
  ) {}

  async createOrder(userId: number, data: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getMyCart(userId);

    const cartItems = cart.items;
    if (cartItems.length === 0) {
      throw new BadRequestException('Корзина пуста');
    }
    cartItems.forEach((item) => {
      if (item.productVariant.stock < item.quantity) {
        throw new BadRequestException(
          `Недостаточно товара "${item.productVariant.product.name}": ${item.productVariant.stock} шт.`,
        );
      }
    });

    const items: CreateOrderItemData[] = cartItems.map((item) => ({
      productVariantId: item.productVariant.id,
      productName: item.productVariant.product.name,
      price: Math.round(
        item.productVariant.price *
          ((100 - item.productVariant.discountPercent) / 100),
      ),
      size: item.productVariant.size,
      quantity: item.quantity,
      image: item.productVariant.product.images[0]?.url ?? null,
    }));

    const totalPrice = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    const orderData: CreateOrderData = {
      ...data,
      totalPrice: totalPrice,
      items,
    };

    return this.orderRepository.create(userId, orderData, cart.id);
  }

  getMyOrders(userId: number): Promise<OrderWithItems[]> {
    return this.orderRepository.findByUserIdWithItems(userId);
  }

  async getMyOrder(userId: number, orderId: number): Promise<OrderWithItems> {
    if (orderId <= 0) {
      throw new BadRequestException('Некорректный id заказа');
    }

    const order = await this.orderRepository.findByIdAndUserIdWithItems(
      orderId,
      userId,
    );
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return order;
  }

  getAllOrders(): Promise<OrderWithItems[]> {
    return this.orderRepository.findAllWithItems();
  }

  async getOrderById(orderId: number): Promise<OrderWithItems> {
    if (orderId <= 0) {
      throw new BadRequestException('Некорректный id заказа');
    }

    const order = await this.orderRepository.findByIdWithItems(orderId);
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return order;
  }

  async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    await this.getOrderById(orderId);
    return this.orderRepository.updateStatus(orderId, status);
  }
}
