import { OrderStatus, Size } from '../../../generated/prisma/enums.js';
import type { Order, OrderItem } from '../../../generated/prisma/client.js';
import type { OrderWithItems } from '../types/order-with-items.type.js';
import type { CreateOrderDto } from '../dto/create-order.dto.js';

const testDate = new Date('2026-01-01T00:00:00.000Z');

export function createOrderDtoFixture(
  overrides: Partial<CreateOrderDto> = {},
): CreateOrderDto {
  return {
    firstName: 'Иван',
    lastName: 'Иванов',
    region: 'Московская область',
    city: 'Москва',
    street: 'Лесная',
    house: '10',
    apartment: '5',
    postalCode: '101000',
    phone: '+79990000000',
    email: 'user@greenshop.test',
    ...overrides,
  };
}

export function createOrderFixture(overrides: Partial<Order> = {}): Order {
  const delivery = createOrderDtoFixture();
  return {
    id: '00000000-0000-4000-8000-000000000001',
    userId: '00000000-0000-4000-8000-000000000002',
    status: OrderStatus.NEW,
    totalPrice: 2000,
    createdAt: testDate,
    updatedAt: testDate,
    firstName: delivery.firstName,
    lastName: delivery.lastName,
    region: delivery.region,
    city: delivery.city,
    street: delivery.street,
    house: delivery.house,
    apartment: delivery.apartment ?? null,
    postalCode: delivery.postalCode ?? null,
    phone: delivery.phone,
    email: delivery.email,
    ...overrides,
  };
}

export function createOrderItemFixture(
  overrides: Partial<OrderItem> = {},
): OrderItem {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    orderId: '00000000-0000-4000-8000-000000000007',
    productVariantId: '00000000-0000-4000-8000-000000000006',
    productName: 'Монстера',
    price: 1000,
    size: Size.MEDIUM,
    quantity: 2,
    image: '/images/monstera.jpg',
    ...overrides,
  };
}

export function createOrderWithItemsFixture(
  overrides: Partial<OrderWithItems> = {},
): OrderWithItems {
  return {
    ...createOrderFixture(),
    items: [createOrderItemFixture()],
    ...overrides,
  };
}
