import type {
  Order,
  OrderItem,
  Prisma,
} from '../../generated/prisma/client.js';
import { OrderStatus, Size } from '../../generated/prisma/enums.js';
import type { CreateOrderDto } from '../../src/order/dto/create-order.dto.js';
import type { UpdateOrderStatusDto } from '../../src/order/dto/update-order-status.dto.js';
import type { PrismaService } from '../../src/prisma/prisma.service.js';

export function createOrderRequestData(
  overrides: Partial<CreateOrderDto> = {},
): CreateOrderDto {
  return {
    firstName: 'Александра',
    lastName: 'Иванова',
    region: 'Московская область',
    city: 'Москва',
    street: 'Зелёная',
    house: '10',
    apartment: '5',
    postalCode: '101000',
    phone: '+79991234567',
    email: 'alexandra@greenshop.test',
    ...overrides,
  };
}

export function createUpdateOrderStatusRequestData(
  overrides: Partial<UpdateOrderStatusDto> = {},
): UpdateOrderStatusDto {
  return {
    status: OrderStatus.CONFIRMED,
    ...overrides,
  };
}

export function createOrderFixture(
  prisma: PrismaService,
  userId: string,
  overrides: Partial<Prisma.OrderUncheckedCreateInput> = {},
): Promise<Order> {
  const delivery = createOrderRequestData();

  return prisma.order.create({
    data: {
      userId,
      status: OrderStatus.NEW,
      totalPrice: 2000,
      firstName: delivery.firstName,
      lastName: delivery.lastName,
      region: delivery.region,
      city: delivery.city,
      street: delivery.street,
      house: delivery.house,
      apartment: delivery.apartment,
      postalCode: delivery.postalCode,
      phone: delivery.phone,
      email: delivery.email,
      ...overrides,
    },
  });
}

export function createOrderItemFixture(
  prisma: PrismaService,
  orderId: string,
  productVariantId: string,
  overrides: Partial<Prisma.OrderItemUncheckedCreateInput> = {},
): Promise<OrderItem> {
  return prisma.orderItem.create({
    data: {
      orderId,
      productVariantId,
      productName: 'Монстера',
      price: 1000,
      size: Size.MEDIUM,
      quantity: 2,
      image: '/images/products/monstera.jpg',
      ...overrides,
    },
  });
}
