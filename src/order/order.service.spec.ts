import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../../generated/prisma/enums.js';
import { OrderService } from './order.service.js';
import { OrderRepository } from './order.repository.js';
import { CartService } from '../cart/cart.service.js';
import { createCartWithItemsFixture } from '../cart/testing/cart.fixtures.js';
import {
  createOrderDtoFixture,
  createOrderFixture,
  createOrderWithItemsFixture,
} from './testing/order.fixtures.js';

describe('OrderService', () => {
  let service: OrderService;
  let repository: {
    create: jest.MockedFunction<OrderRepository['create']>;
    findByUserIdWithItems: jest.MockedFunction<
      OrderRepository['findByUserIdWithItems']
    >;
    findByIdAndUserIdWithItems: jest.MockedFunction<
      OrderRepository['findByIdAndUserIdWithItems']
    >;
    findAllWithItems: jest.MockedFunction<OrderRepository['findAllWithItems']>;
    findByIdWithItems: jest.MockedFunction<
      OrderRepository['findByIdWithItems']
    >;
    updateStatus: jest.MockedFunction<OrderRepository['updateStatus']>;
  };
  let getMyCart: jest.MockedFunction<CartService['getMyCart']>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findByUserIdWithItems: jest.fn(),
      findByIdAndUserIdWithItems: jest.fn(),
      findAllWithItems: jest.fn(),
      findByIdWithItems: jest.fn(),
      updateStatus: jest.fn(),
    };
    getMyCart = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: repository },
        { provide: CartService, useValue: { getMyCart } },
      ],
    }).compile();
    service = module.get(OrderService);
  });

  describe('createOrder', () => {
    it('не создаёт заказ из пустой корзины', async () => {
      getMyCart.mockResolvedValue(createCartWithItemsFixture({ items: [] }));
      await expect(
        service.createOrder(1, createOrderDtoFixture()),
      ).rejects.toThrow('Корзина пуста');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('не создаёт заказ при недостаточном остатке', async () => {
      const cart = createCartWithItemsFixture();
      cart.items[0].quantity = 6;
      cart.items[0].productVariant.stock = 5;
      getMyCart.mockResolvedValue(cart);
      await expect(
        service.createOrder(1, createOrderDtoFixture()),
      ).rejects.toThrow('Недостаточно товара');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('рассчитывает скидку, сумму и создаёт заказ', async () => {
      const cart = createCartWithItemsFixture();
      cart.items[0].quantity = 2;
      cart.items[0].productVariant.price = 1000;
      cart.items[0].productVariant.discountPercent = 15;
      const data = createOrderDtoFixture();
      const order = createOrderFixture({ totalPrice: 1700 });
      getMyCart.mockResolvedValue(cart);
      repository.create.mockResolvedValue(order);

      await expect(service.createOrder(1, data)).resolves.toEqual(order);
      expect(repository.create).toHaveBeenCalledWith(
        1,
        {
          ...data,
          totalPrice: 1700,
          items: [
            {
              productVariantId: cart.items[0].productVariant.id,
              productName: cart.items[0].productVariant.product.name,
              price: 850,
              size: cart.items[0].productVariant.size,
              quantity: 2,
              image: cart.items[0].productVariant.product.images[0].url,
            },
          ],
        },
        cart.id,
      );
    });

    it('сохраняет null, если у товара нет изображения', async () => {
      const cart = createCartWithItemsFixture();
      cart.items[0].productVariant.product.images = [];
      getMyCart.mockResolvedValue(cart);
      repository.create.mockResolvedValue(createOrderFixture());
      await service.createOrder(1, createOrderDtoFixture());
      expect(repository.create).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          items: [expect.objectContaining({ image: null })],
        }),
        cart.id,
      );
    });
  });

  it('возвращает заказы текущего пользователя', async () => {
    const orders = [createOrderWithItemsFixture()];
    repository.findByUserIdWithItems.mockResolvedValue(orders);
    await expect(service.getMyOrders(1)).resolves.toEqual(orders);
    expect(repository.findByUserIdWithItems).toHaveBeenCalledWith(1);
  });

  describe('getMyOrder', () => {
    it('выбрасывает ошибку, если ID заказа некорректен', async () => {
      await expect(service.getMyOrder(1, 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('не раскрывает отсутствующий или чужой заказ', async () => {
      repository.findByIdAndUserIdWithItems.mockResolvedValue(null);
      await expect(service.getMyOrder(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('возвращает заказ пользователя', async () => {
      const order = createOrderWithItemsFixture();
      repository.findByIdAndUserIdWithItems.mockResolvedValue(order);
      await expect(service.getMyOrder(1, 1)).resolves.toEqual(order);
      expect(repository.findByIdAndUserIdWithItems).toHaveBeenCalledWith(1, 1);
    });
  });

  it('возвращает все заказы', async () => {
    const orders = [createOrderWithItemsFixture()];
    repository.findAllWithItems.mockResolvedValue(orders);
    await expect(service.getAllOrders()).resolves.toEqual(orders);
  });

  describe('getOrderById', () => {
    it('выбрасывает ошибку, если ID заказа некорректен', async () => {
      await expect(service.getOrderById(0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('выбрасывает ошибку, если заказ не найден', async () => {
      repository.findByIdWithItems.mockResolvedValue(null);
      await expect(service.getOrderById(1)).rejects.toThrow(NotFoundException);
    });

    it('возвращает заказ по id', async () => {
      const order = createOrderWithItemsFixture();
      repository.findByIdWithItems.mockResolvedValue(order);
      await expect(service.getOrderById(1)).resolves.toEqual(order);
    });
  });

  it('не обновляет статус отсутствующего заказа', async () => {
    repository.findByIdWithItems.mockResolvedValue(null);
    await expect(
      service.updateStatus(1, OrderStatus.CONFIRMED),
    ).rejects.toThrow(NotFoundException);
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it('возвращает заказ с обновлённым статусом', async () => {
    const details = createOrderWithItemsFixture();
    const updated = createOrderFixture({ status: OrderStatus.CONFIRMED });
    repository.findByIdWithItems.mockResolvedValue(details);
    repository.updateStatus.mockResolvedValue(updated);
    await expect(
      service.updateStatus(1, OrderStatus.CONFIRMED),
    ).resolves.toEqual(updated);
    expect(repository.updateStatus).toHaveBeenCalledWith(
      1,
      OrderStatus.CONFIRMED,
    );
  });
});
