import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Size } from '../../generated/prisma/enums.js';
import { ProductVariantService } from './product-variant.service.js';
import { ProductVariantsRepository } from './product-variant.repository.js';
import { createProductVariantFixture } from '../products/testing/product.fixtures.js';

describe('ProductVariantService', () => {
  let service: ProductVariantService;
  let repository: {
    findOneByProductId: jest.MockedFunction<
      ProductVariantsRepository['findOneByProductId']
    >;
    findOneById: jest.MockedFunction<ProductVariantsRepository['findOneById']>;
    findAllByProductId: jest.MockedFunction<
      ProductVariantsRepository['findAllByProductId']
    >;
    findProduct: jest.MockedFunction<ProductVariantsRepository['findProduct']>;
    findBySize: jest.MockedFunction<ProductVariantsRepository['findBySize']>;
    findBySku: jest.MockedFunction<ProductVariantsRepository['findBySku']>;
    create: jest.MockedFunction<ProductVariantsRepository['create']>;
    update: jest.MockedFunction<ProductVariantsRepository['update']>;
    countVariants: jest.MockedFunction<
      ProductVariantsRepository['countVariants']
    >;
    delete: jest.MockedFunction<ProductVariantsRepository['delete']>;
  };

  beforeEach(async () => {
    repository = {
      findOneByProductId: jest.fn(),
      findOneById: jest.fn(),
      findAllByProductId: jest.fn(),
      findProduct: jest.fn(),
      findBySize: jest.fn(),
      findBySku: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      countVariants: jest.fn(),
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantService,
        { provide: ProductVariantsRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(ProductVariantService);
  });

  describe('findOne', () => {
    it.each([
      ['', '00000000-0000-4000-8000-000000000001', 'Некорректный id товара'],
      ['00000000-0000-4000-8000-000000000001', '', 'Некорректный id варианта'],
    ])('проверяет идентификаторы', async (productId, variantId, message) => {
      await expect(service.findOne(productId, variantId)).rejects.toThrow(
        message,
      );
      expect(repository.findOneByProductId).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если вариант не найден', async () => {
      repository.findOneByProductId.mockResolvedValue(null);
      await expect(
        service.findOne(
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000002',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('возвращает вариант товара', async () => {
      const variant = createProductVariantFixture();
      repository.findOneByProductId.mockResolvedValue(variant);
      await expect(
        service.findOne(
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000001',
        ),
      ).resolves.toEqual(variant);
      expect(repository.findOneByProductId).toHaveBeenCalledWith(
        '00000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000001',
      );
    });
  });

  describe('findOneById', () => {
    it('выбрасывает ошибку, если ID варианта некорректен', async () => {
      await expect(service.findOneById('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('выбрасывает ошибку, если вариант не найден', async () => {
      repository.findOneById.mockResolvedValue(null);
      await expect(
        service.findOneById('00000000-0000-4000-8000-000000000001'),
      ).rejects.toThrow(NotFoundException);
    });

    it('возвращает вариант по id', async () => {
      const variant = createProductVariantFixture();
      repository.findOneById.mockResolvedValue(variant);
      await expect(
        service.findOneById('00000000-0000-4000-8000-000000000001'),
      ).resolves.toEqual(variant);
    });
  });

  describe('findAll', () => {
    it('выбрасывает ошибку, если товар не найден', async () => {
      repository.findProduct.mockResolvedValue(false);
      await expect(
        service.findAll('00000000-0000-4000-8000-000000000001'),
      ).rejects.toThrow('Товар не найден');
      expect(repository.findAllByProductId).not.toHaveBeenCalled();
    });

    it('возвращает варианты товара', async () => {
      const variants = [createProductVariantFixture()];
      repository.findProduct.mockResolvedValue(true);
      repository.findAllByProductId.mockResolvedValue(variants);
      await expect(
        service.findAll('00000000-0000-4000-8000-000000000001'),
      ).resolves.toEqual(variants);
      expect(repository.findAllByProductId).toHaveBeenCalledWith(
        '00000000-0000-4000-8000-000000000001',
      );
    });
  });

  describe('create', () => {
    const data = {
      size: Size.MEDIUM,
      price: 1000,
      stock: 5,
      sku: '0123456789123',
      discountPercent: 0,
    };

    it('не создаёт вариант отсутствующего товара', async () => {
      repository.findProduct.mockResolvedValue(false);
      await expect(
        service.create('00000000-0000-4000-8000-000000000001', data),
      ).rejects.toThrow(NotFoundException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('не создаёт повторяющийся размер', async () => {
      repository.findProduct.mockResolvedValue(true);
      repository.findBySize.mockResolvedValue(createProductVariantFixture());
      await expect(
        service.create('00000000-0000-4000-8000-000000000001', data),
      ).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('не создаёт повторяющийся артикул', async () => {
      repository.findProduct.mockResolvedValue(true);
      repository.findBySize.mockResolvedValue(null);
      repository.findBySku.mockResolvedValue(createProductVariantFixture());
      await expect(
        service.create('00000000-0000-4000-8000-000000000001', data),
      ).rejects.toThrow('Вариант с таким артикулом уже существует');
    });

    it('возвращает созданный вариант', async () => {
      const variant = createProductVariantFixture();
      repository.findProduct.mockResolvedValue(true);
      repository.findBySize.mockResolvedValue(null);
      repository.findBySku.mockResolvedValue(null);
      repository.create.mockResolvedValue(variant);
      await expect(
        service.create('00000000-0000-4000-8000-000000000001', data),
      ).resolves.toEqual(variant);
      expect(repository.create).toHaveBeenCalledWith(
        '00000000-0000-4000-8000-000000000001',
        data,
      );
    });
  });

  describe('update', () => {
    it('не обновляет вариант отсутствующего товара', async () => {
      repository.findOneByProductId.mockResolvedValue(null);
      await expect(
        service.update(
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000001',
          { stock: 2 },
        ),
      ).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('не устанавливает размер другого варианта', async () => {
      repository.findOneByProductId.mockResolvedValue(
        createProductVariantFixture(),
      );
      repository.findBySize.mockResolvedValue(
        createProductVariantFixture({
          id: '00000000-0000-4000-8000-000000000002',
        }),
      );
      await expect(
        service.update(
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000001',
          { size: Size.LARGE },
        ),
      ).rejects.toThrow('Вариант такого размера уже существует');
    });

    it('разрешает сохранить собственный размер и артикул', async () => {
      const variant = createProductVariantFixture();
      const data = { size: variant.size, sku: '0123456789123', stock: 7 };
      const updated = createProductVariantFixture({ stock: 7 });
      repository.findOneByProductId.mockResolvedValue(variant);
      repository.findBySize.mockResolvedValue(variant);
      repository.findBySku.mockResolvedValue(variant);
      repository.update.mockResolvedValue(updated);
      await expect(
        service.update(
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000001',
          data,
        ),
      ).resolves.toEqual(updated);
      expect(repository.update).toHaveBeenCalledWith(
        '00000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000001',
        data,
      );
    });

    it('не устанавливает артикул другого варианта', async () => {
      repository.findOneByProductId.mockResolvedValue(
        createProductVariantFixture(),
      );
      repository.findBySku.mockResolvedValue(
        createProductVariantFixture({
          id: '00000000-0000-4000-8000-000000000002',
        }),
      );
      await expect(
        service.update(
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000001',
          { sku: '0123456789124' },
        ),
      ).rejects.toThrow('Вариант с таким артикулом уже существует');
    });
  });

  describe('delete', () => {
    it('не удаляет последний вариант', async () => {
      repository.findOneByProductId.mockResolvedValue(
        createProductVariantFixture(),
      );
      repository.countVariants.mockResolvedValue(1);
      await expect(
        service.delete(
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000001',
        ),
      ).rejects.toThrow('Нельзя удалить последний вариант товара');
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('возвращает удалённый вариант', async () => {
      const variant = createProductVariantFixture();
      repository.findOneByProductId.mockResolvedValue(variant);
      repository.countVariants.mockResolvedValue(2);
      repository.delete.mockResolvedValue(variant);
      await expect(
        service.delete(
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000001',
        ),
      ).resolves.toEqual(variant);
      expect(repository.delete).toHaveBeenCalledWith(
        '00000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000001',
      );
    });
  });
});
