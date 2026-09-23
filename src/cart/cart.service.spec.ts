import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { CartRepository } from './cart.repository.js';
import { CartItemRepository } from './cart-item.repository.js';
import { ProductVariantService } from '../product-variant/product-variant.service.js';
import {
  createCartFixture,
  createCartItemFixture,
  createCartWithItemsFixture,
} from './testing/cart.fixtures.js';
import { createProductVariantFixture } from '../products/testing/product.fixtures.js';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: {
    findByUserId: jest.MockedFunction<CartRepository['findByUserId']>;
    findByUserIdWithItems: jest.MockedFunction<
      CartRepository['findByUserIdWithItems']
    >;
    create: jest.MockedFunction<CartRepository['create']>;
  };
  let itemRepository: {
    findItem: jest.MockedFunction<CartItemRepository['findItem']>;
    create: jest.MockedFunction<CartItemRepository['create']>;
    updateQuantity: jest.MockedFunction<CartItemRepository['updateQuantity']>;
    delete: jest.MockedFunction<CartItemRepository['delete']>;
  };
  let findVariant: jest.MockedFunction<ProductVariantService['findOneById']>;

  beforeEach(async () => {
    cartRepository = {
      findByUserId: jest.fn(),
      findByUserIdWithItems: jest.fn(),
      create: jest.fn(),
    };
    itemRepository = {
      findItem: jest.fn(),
      create: jest.fn(),
      updateQuantity: jest.fn(),
      delete: jest.fn(),
    };
    findVariant = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartRepository, useValue: cartRepository },
        { provide: CartItemRepository, useValue: itemRepository },
        {
          provide: ProductVariantService,
          useValue: { findOneById: findVariant },
        },
      ],
    }).compile();
    service = module.get(CartService);
  });

  describe('getMyCart', () => {
    it('возвращает существующую корзину', async () => {
      const cart = createCartFixture();
      const details = createCartWithItemsFixture();
      cartRepository.findByUserId.mockResolvedValue(cart);
      cartRepository.findByUserIdWithItems.mockResolvedValue(details);
      await expect(service.getMyCart(1)).resolves.toEqual(details);
      expect(cartRepository.create).not.toHaveBeenCalled();
    });

    it('создаёт отсутствующую корзину и возвращает её с позициями', async () => {
      const cart = createCartFixture();
      const details = createCartWithItemsFixture();
      cartRepository.findByUserId.mockResolvedValue(null);
      cartRepository.create.mockResolvedValue(cart);
      cartRepository.findByUserIdWithItems.mockResolvedValue(details);
      await expect(service.getMyCart(1)).resolves.toEqual(details);
      expect(cartRepository.create).toHaveBeenCalledWith(1);
    });

    it('выбрасывает ошибку, если корзина с позициями не найдена', async () => {
      cartRepository.findByUserId.mockResolvedValue(createCartFixture());
      cartRepository.findByUserIdWithItems.mockResolvedValue(null);
      await expect(service.getMyCart(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addItem', () => {
    it('не добавляет количество больше остатка', async () => {
      findVariant.mockResolvedValue(createProductVariantFixture({ stock: 2 }));
      await expect(
        service.addItem(1, { productVariantId: 1, quantity: 3 }),
      ).rejects.toThrow('Недостаточно товара на складе');
      expect(cartRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('создаёт новую позицию корзины', async () => {
      const variant = createProductVariantFixture({ stock: 10 });
      const cart = createCartFixture();
      const item = createCartItemFixture();
      findVariant.mockResolvedValue(variant);
      cartRepository.findByUserId.mockResolvedValue(cart);
      itemRepository.findItem.mockResolvedValue(null);
      itemRepository.create.mockResolvedValue(item);
      await expect(
        service.addItem(1, { productVariantId: variant.id, quantity: 2 }),
      ).resolves.toEqual(item);
      expect(itemRepository.create).toHaveBeenCalledWith(
        cart.id,
        variant.id,
        2,
      );
    });

    it('создаёт корзину перед первой позицией', async () => {
      const variant = createProductVariantFixture({ stock: 10 });
      const cart = createCartFixture();
      findVariant.mockResolvedValue(variant);
      cartRepository.findByUserId.mockResolvedValue(null);
      cartRepository.create.mockResolvedValue(cart);
      itemRepository.findItem.mockResolvedValue(null);
      itemRepository.create.mockResolvedValue(createCartItemFixture());
      await service.addItem(1, { productVariantId: variant.id, quantity: 1 });
      expect(cartRepository.create).toHaveBeenCalledWith(1);
    });

    it('увеличивает количество существующей позиции', async () => {
      const variant = createProductVariantFixture({ stock: 10 });
      const cart = createCartFixture();
      const item = createCartItemFixture({ quantity: 2 });
      const updated = createCartItemFixture({ quantity: 5 });
      findVariant.mockResolvedValue(variant);
      cartRepository.findByUserId.mockResolvedValue(cart);
      itemRepository.findItem.mockResolvedValue(item);
      itemRepository.updateQuantity.mockResolvedValue(updated);
      await expect(
        service.addItem(1, { productVariantId: variant.id, quantity: 3 }),
      ).resolves.toEqual(updated);
      expect(itemRepository.updateQuantity).toHaveBeenCalledWith(item.id, 5);
    });

    it('не увеличивает итоговое количество сверх остатка', async () => {
      findVariant.mockResolvedValue(createProductVariantFixture({ stock: 4 }));
      cartRepository.findByUserId.mockResolvedValue(createCartFixture());
      itemRepository.findItem.mockResolvedValue(
        createCartItemFixture({ quantity: 3 }),
      );
      await expect(
        service.addItem(1, { productVariantId: 1, quantity: 2 }),
      ).rejects.toThrow(BadRequestException);
      expect(itemRepository.updateQuantity).not.toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
    it('выбрасывает ошибку, если ID варианта некорректен', async () => {
      await expect(
        service.updateQuantity(1, 0, { quantity: 1 }),
      ).rejects.toThrow('Некорректный id варианта товара');
      expect(findVariant).not.toHaveBeenCalled();
    });

    it('не устанавливает количество больше остатка', async () => {
      findVariant.mockResolvedValue(createProductVariantFixture({ stock: 2 }));
      await expect(
        service.updateQuantity(1, 1, { quantity: 3 }),
      ).rejects.toThrow('Недостаточно товара на складе');
    });

    it('выбрасывает ошибку, если корзина не найдена', async () => {
      findVariant.mockResolvedValue(createProductVariantFixture());
      cartRepository.findByUserId.mockResolvedValue(null);
      await expect(
        service.updateQuantity(1, 1, { quantity: 1 }),
      ).rejects.toThrow('Корзина не найдена');
    });

    it('выбрасывает ошибку, если позиции нет в корзине', async () => {
      findVariant.mockResolvedValue(createProductVariantFixture());
      cartRepository.findByUserId.mockResolvedValue(createCartFixture());
      itemRepository.findItem.mockResolvedValue(null);
      await expect(
        service.updateQuantity(1, 1, { quantity: 1 }),
      ).rejects.toThrow('Товар не найден в корзине');
    });

    it('устанавливает переданное количество', async () => {
      const item = createCartItemFixture({ quantity: 2 });
      const updated = createCartItemFixture({ quantity: 4 });
      findVariant.mockResolvedValue(createProductVariantFixture({ stock: 5 }));
      cartRepository.findByUserId.mockResolvedValue(createCartFixture());
      itemRepository.findItem.mockResolvedValue(item);
      itemRepository.updateQuantity.mockResolvedValue(updated);
      await expect(
        service.updateQuantity(1, 1, { quantity: 4 }),
      ).resolves.toEqual(updated);
      expect(itemRepository.updateQuantity).toHaveBeenCalledWith(item.id, 4);
    });
  });

  describe('removeItem', () => {
    it('выбрасывает ошибку, если ID варианта некорректен', async () => {
      await expect(service.removeItem(1, 0)).rejects.toThrow(
        BadRequestException,
      );
      expect(cartRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если корзина не найдена', async () => {
      cartRepository.findByUserId.mockResolvedValue(null);
      await expect(service.removeItem(1, 1)).rejects.toThrow(
        'Корзина не найдена',
      );
    });

    it('выбрасывает ошибку, если позиции нет в корзине', async () => {
      cartRepository.findByUserId.mockResolvedValue(createCartFixture());
      itemRepository.findItem.mockResolvedValue(null);
      await expect(service.removeItem(1, 1)).rejects.toThrow(
        'Товар не найден в корзине',
      );
    });

    it('возвращает удалённую позицию', async () => {
      const item = createCartItemFixture();
      cartRepository.findByUserId.mockResolvedValue(createCartFixture());
      itemRepository.findItem.mockResolvedValue(item);
      itemRepository.delete.mockResolvedValue(item);
      await expect(service.removeItem(1, 1)).resolves.toEqual(item);
      expect(itemRepository.delete).toHaveBeenCalledWith(item.id);
    });
  });
});
