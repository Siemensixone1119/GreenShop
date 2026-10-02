import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ProductsService } from './products.service.js';
import { ProductsRepository } from './products.repository.js';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { ProductWithDetails } from './types/product-with-detail.type.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { UpdateProductDto } from './dto/update-product.dto.js';
import { CategoriesService } from '../categories/categories.service.js';
import {
  createProductFixture,
  createProductImageFixture,
} from './testing/product.fixtures.js';
import { createCategoryFixture } from '../categories/testing/category.fixture.js';
import type { ProductImage } from '../../generated/prisma/client.js';
import { Size } from '../../generated/prisma/client.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let findAll: jest.MockedFunction<ProductsRepository['findAll']>;
  let findOne: jest.MockedFunction<ProductsRepository['findOne']>;
  let create: jest.MockedFunction<ProductsRepository['create']>;
  let update: jest.MockedFunction<ProductsRepository['update']>;
  let deleteProduct: jest.MockedFunction<ProductsRepository['delete']>;
  let addImage: jest.MockedFunction<ProductsRepository['addImage']>;
  let updateImage: jest.MockedFunction<ProductsRepository['updateImage']>;
  let deleteImage: jest.MockedFunction<ProductsRepository['deleteImage']>;
  let reorderImage: jest.MockedFunction<ProductsRepository['reorderImage']>;
  let findImage: jest.MockedFunction<ProductsRepository['findImage']>;
  let findCategory: jest.MockedFunction<CategoriesService['findOne']>;

  beforeEach(async () => {
    findAll = jest.fn();
    findOne = jest.fn();
    create = jest.fn();
    update = jest.fn();
    deleteProduct = jest.fn();
    addImage = jest.fn();
    updateImage = jest.fn();
    findImage = jest.fn();
    findCategory = jest.fn();
    deleteImage = jest.fn();
    reorderImage = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: {
            findAll,
            findOne,
            create,
            update,
            delete: deleteProduct,
            addImage,
            updateImage,
            findImage,
            deleteImage,
            reorderImage,
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            findOne: findCategory,
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('возвращает результат репозитория для корректных фильтров', async () => {
      const filters = {
        minPrice: 1000,
        maxPrice: 3000,
      };

      const expectedResult = {
        items: [],
        total: 0,
        page: 1,
        limit: 9,
        totalPages: 0,
      };

      findAll.mockResolvedValue(expectedResult);

      const result = service.findAll(filters);

      await expect(result).resolves.toEqual(expectedResult);
      expect(findAll).toHaveBeenCalledTimes(1);
      expect(findAll).toHaveBeenCalledWith(filters);
    });

    it('выбрасывает ошибку, если минимальная цена больше максимальной', () => {
      const filters = {
        minPrice: 3000,
        maxPrice: 1000,
      };

      const result = () => service.findAll(filters);

      expect(result).toThrow(BadRequestException);
      expect(result).toThrow(
        'Минимальная цена не может быть больше максимальной',
      );
      expect(findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('выбрасывает ошибку, если ID товара некорректен', async () => {
      const productId = '';

      const result = service.findOne(productId);

      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow('Некорректный id товара');
      expect(findOne).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если товар не найден', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';

      findOne.mockResolvedValue(null);

      const result = service.findOne(productId);

      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Товар не найден');
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findOne).toHaveBeenCalledWith(productId);
    });

    it('возвращает найденный товар', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';

      const expectedResult: ProductWithDetails = createProductFixture();

      findOne.mockResolvedValue(expectedResult);

      const result = service.findOne(productId);

      await expect(result).resolves.toEqual(expectedResult);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findOne).toHaveBeenCalledWith(productId);
    });
  });

  describe('create', () => {
    it('выбрасывает ошибку, если категория не найдена', async () => {
      const data: CreateProductDto = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: '00000000-0000-4000-8000-000000000002',
        images: [],
        variants: [],
      };

      findCategory.mockRejectedValue(
        new NotFoundException('Категория не найдена'),
      );

      const result = service.create(data);

      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Категория не найдена');
      expect(findCategory).toHaveBeenCalledWith(data.categoryId);
      expect(findCategory).toHaveBeenCalledTimes(1);
      expect(create).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если размеры вариантов повторяются', async () => {
      const data: CreateProductDto = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: '00000000-0000-4000-8000-000000000002',
        images: [],
        variants: [
          {
            size: Size.SMALL,
            stock: 10,
            price: 1000,
            discountPercent: 0,
            sku: '0123456789123',
          },
          {
            size: Size.SMALL,
            stock: 10,
            price: 1000,
            discountPercent: 0,
            sku: '0123456789124',
          },
        ],
      };

      const expectedFindCategoryResult = createCategoryFixture();

      findCategory.mockResolvedValue(expectedFindCategoryResult);

      const result = service.create(data);

      await expect(result).rejects.toThrow(ConflictException);
      await expect(result).rejects.toThrow(
        'Товары с одинаковыми размерами не могут быть созданы',
      );
      expect(findCategory).toHaveBeenCalledWith(data.categoryId);
      expect(findCategory).toHaveBeenCalledTimes(1);
      expect(create).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если артикулы вариантов повторяются', async () => {
      const data: CreateProductDto = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: '00000000-0000-4000-8000-000000000002',
        images: [],
        variants: [
          {
            size: Size.SMALL,
            stock: 10,
            price: 1000,
            discountPercent: 0,
            sku: '0123456789123',
          },
          {
            size: Size.MEDIUM,
            stock: 10,
            price: 1000,
            discountPercent: 0,
            sku: '0123456789123',
          },
        ],
      };

      const expectedFindCategoryResult = createCategoryFixture();

      findCategory.mockResolvedValue(expectedFindCategoryResult);

      const result = service.create(data);

      await expect(result).rejects.toThrow(ConflictException);
      await expect(result).rejects.toThrow(
        'Товары с одинаковыми артикулами не могут быть созданы',
      );
      expect(findCategory).toHaveBeenCalledWith(data.categoryId);
      expect(findCategory).toHaveBeenCalledTimes(1);
      expect(create).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если позиции изображений повторяются', async () => {
      const data: CreateProductDto = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: '00000000-0000-4000-8000-000000000002',
        images: [
          { url: '/images/monstera.jpg', alt: 'Монстера', position: 1 },
          { url: '/images/monstera.jpg', alt: 'Монстера', position: 1 },
        ],
        variants: [],
      };

      const expectedFindCategoryResult = createCategoryFixture();

      findCategory.mockResolvedValue(expectedFindCategoryResult);

      const result = service.create(data);

      await expect(result).rejects.toThrow(ConflictException);
      await expect(result).rejects.toThrow(
        'Товары с одинаковым позициями фотографий не могут быть созданы',
      );
      expect(findCategory).toHaveBeenCalledWith(data.categoryId);
      expect(findCategory).toHaveBeenCalledTimes(1);
      expect(create).not.toHaveBeenCalled();
    });

    it('возвращает созданный товар', async () => {
      const data: CreateProductDto = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: '00000000-0000-4000-8000-000000000001',
        images: [],
        variants: [
          {
            size: Size.MEDIUM,
            price: 1000,
            stock: 5,
            sku: '0123456789123',
            discountPercent: 0,
          },
        ],
      };

      const expectedResult: ProductWithDetails = createProductFixture();

      const category = createCategoryFixture();

      findCategory.mockResolvedValue(category);
      create.mockResolvedValue(expectedResult);

      const result = service.create(data);

      await expect(result).resolves.toEqual(expectedResult);
      expect(findCategory).toHaveBeenCalledWith(data.categoryId);
      expect(findCategory).toHaveBeenCalledTimes(1);
      expect(create).toHaveBeenCalledWith(data);
      expect(create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('выбрасывает ошибку, если ID товара некорректен', async () => {
      const productId = '';
      const data: UpdateProductDto = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: '00000000-0000-4000-8000-000000000001',
      };

      const result = service.update(productId, data);

      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow('Некорректный id товара');
      expect(update).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если категория не найдена', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const data = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: '00000000-0000-4000-8000-000000000001',
      } satisfies UpdateProductDto;

      findCategory.mockRejectedValue(
        new NotFoundException('Категория не найдена'),
      );

      const result = service.update(productId, data);

      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Категория не найдена');
      expect(findCategory).toHaveBeenCalledWith(data.categoryId);
      expect(findCategory).toHaveBeenCalledTimes(1);
      expect(update).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если товар не найден', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const data = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: '00000000-0000-4000-8000-000000000001',
      } satisfies UpdateProductDto;

      const expectedFindCategoryResult = createCategoryFixture();

      findCategory.mockResolvedValue(expectedFindCategoryResult);
      findOne.mockResolvedValue(null);

      const result = service.update(productId, data);

      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Товар не найден');
      expect(findCategory).toHaveBeenCalledWith(data.categoryId);
      expect(findCategory).toHaveBeenCalledTimes(1);
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(update).not.toHaveBeenCalled();
    });

    it('возвращает обновлённый товар', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const data = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: '00000000-0000-4000-8000-000000000001',
      } satisfies UpdateProductDto;

      const product: ProductWithDetails = createProductFixture();

      const expectedResult: ProductWithDetails = createProductFixture({
        name: 'Фикус',
        description: 'Тестовое растение1',
        categoryId: '00000000-0000-4000-8000-000000000002',
      });

      findOne.mockResolvedValue(product);
      findCategory.mockResolvedValue(createCategoryFixture());
      update.mockResolvedValue(expectedResult);

      const result = service.update(productId, data);

      await expect(result).resolves.toEqual(expectedResult);
      expect(findCategory).toHaveBeenCalledWith(data.categoryId);
      expect(findCategory).toHaveBeenCalledTimes(1);
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledWith(productId, data);
      expect(update).toHaveBeenCalledTimes(1);
    });
  });

  describe('update без categoryId', () => {
    it('возвращает обновлённый товар без поиска категории', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const data = { name: 'Фикус' } satisfies UpdateProductDto;
      const product = createProductFixture();
      const expectedResult = createProductFixture({ name: data.name });

      findOne.mockResolvedValue(product);
      update.mockResolvedValue(expectedResult);

      const result = await service.update(productId, data);

      expect(result).toEqual(expectedResult);
      expect(findCategory).not.toHaveBeenCalled();
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledWith(productId, data);
      expect(update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('выбрасывает ошибку, если ID товара некорректен', async () => {
      const productId = '';
      const result = service.delete(productId);

      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow('Некорректный id товара');
      expect(deleteProduct).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если товар не найден', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';

      findOne.mockResolvedValue(null);

      const result = service.delete(productId);

      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Товар не найден');
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(deleteProduct).not.toHaveBeenCalled();
    });

    it('возвращает удалённый товар', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const expectedResult: ProductWithDetails = createProductFixture();

      findOne.mockResolvedValue(expectedResult);
      deleteProduct.mockResolvedValue(expectedResult);

      const result = service.delete(productId);

      await expect(result).resolves.toEqual(expectedResult);
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(deleteProduct).toHaveBeenCalledWith(productId);
      expect(deleteProduct).toHaveBeenCalledTimes(1);
    });
  });

  describe('addImage', () => {
    it('выбрасывает ошибку, если товар не найден', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';

      const image = {
        url: '/images/monstera.jpg',
        position: 1,
        alt: 'Монстера',
      };

      findOne.mockResolvedValue(null);

      const result = service.addImage(productId, image);

      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Товар не найден');
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(addImage).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если позиция изображения занята', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const expectedResult: ProductWithDetails = createProductFixture();

      const image = {
        url: '/images/monstera.jpg',
        position: 1,
        alt: 'Монстера',
      };

      findOne.mockResolvedValue(expectedResult);

      const result = service.addImage(productId, image);

      await expect(result).rejects.toThrow(ConflictException);
      await expect(result).rejects.toThrow(
        'Изображение с такой позицией уже существует',
      );
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(addImage).not.toHaveBeenCalled();
    });

    it('возвращает добавленное изображение', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const expectedFindResult: ProductWithDetails = createProductFixture();
      const expectedAddResult: ProductImage = createProductImageFixture();

      const image = {
        url: '/images/monstera.jpg',
        position: 2,
        alt: 'Монстера',
      };

      findOne.mockResolvedValue(expectedFindResult);
      addImage.mockResolvedValue(expectedAddResult);

      const result = await service.addImage(productId, image);

      expect(result).toEqual(expectedAddResult);
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(addImage).toHaveBeenCalledWith(productId, image);
      expect(addImage).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateImage', () => {
    it('выбрасывает ошибку, если товар не найден', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const imageId = '00000000-0000-4000-8000-000000000001';
      const data = {
        alt: 'photo2',
      };

      findOne.mockResolvedValue(null);

      const result = service.updateImage(productId, imageId, data);
      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Товар не найден');
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(updateImage).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если изображение не найдено', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const imageId = '00000000-0000-4000-8000-000000000002';
      const data = {
        alt: 'photo2',
      };

      const expectedFindResult = createProductFixture();

      findOne.mockResolvedValue(expectedFindResult);
      findImage.mockResolvedValue(null);

      const result = service.updateImage(productId, imageId, data);
      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Картинка не найдена');
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findImage).toHaveBeenCalledWith(productId, imageId);
      expect(findImage).toHaveBeenCalledTimes(1);
      expect(updateImage).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если позиция занята другим изображением', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const imageId = '00000000-0000-4000-8000-000000000001';
      const data = {
        alt: 'photo2',
        position: 2,
      };

      const expectedFindResult = createProductFixture({
        images: [
          createProductImageFixture(),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000002',
            position: 2,
          }),
        ],
      });
      const expectedFindImageResult = createProductImageFixture();

      findOne.mockResolvedValue(expectedFindResult);
      findImage.mockResolvedValue(expectedFindImageResult);

      const result = service.updateImage(productId, imageId, data);
      await expect(result).rejects.toThrow(ConflictException);
      await expect(result).rejects.toThrow(
        'Изображение с такой позицией уже существует',
      );
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findImage).toHaveBeenCalledWith(productId, imageId);
      expect(findImage).toHaveBeenCalledTimes(1);
      expect(updateImage).not.toHaveBeenCalled();
    });

    it('возвращает обновлённое изображение', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const imageId = '00000000-0000-4000-8000-000000000001';
      const data = {
        alt: 'photo2',
        position: 2,
      };

      const expectedFindResult = createProductFixture();
      const expectedFindImageResult = createProductImageFixture();
      const expectedUpdatedResult = createProductImageFixture({
        alt: 'photo2',
        position: 2,
      });

      findOne.mockResolvedValue(expectedFindResult);
      findImage.mockResolvedValue(expectedFindImageResult);
      updateImage.mockResolvedValue(expectedUpdatedResult);

      const result = service.updateImage(productId, imageId, data);

      await expect(result).resolves.toEqual(expectedUpdatedResult);
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findImage).toHaveBeenCalledWith(productId, imageId);
      expect(findImage).toHaveBeenCalledTimes(1);
      expect(updateImage).toHaveBeenCalledWith(productId, imageId, data);
      expect(updateImage).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateImage без изменения position', () => {
    it('возвращает обновлённое изображение при сохранении собственной позиции', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const imageId = '00000000-0000-4000-8000-000000000001';
      const data = { alt: 'Новое описание', position: 1 };
      const image = createProductImageFixture({ id: imageId, position: 1 });
      const product = createProductFixture({
        images: [
          image,
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000002',
            position: 2,
          }),
        ],
      });
      const expectedResult = createProductImageFixture({
        ...data,
        id: imageId,
      });

      findOne.mockResolvedValue(product);
      findImage.mockResolvedValue(image);
      updateImage.mockResolvedValue(expectedResult);

      const result = await service.updateImage(productId, imageId, data);

      expect(result).toEqual(expectedResult);
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findImage).toHaveBeenCalledWith(productId, imageId);
      expect(findImage).toHaveBeenCalledTimes(1);
      expect(updateImage).toHaveBeenCalledWith(productId, imageId, data);
      expect(updateImage).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteImage', () => {
    it('выбрасывает ошибку, если товар не найден', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const imageId = '00000000-0000-4000-8000-000000000001';

      findOne.mockResolvedValue(null);

      const result = service.deleteImage(productId, imageId);
      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Товар не найден');
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(deleteImage).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если изображение не найдено', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const imageId = '00000000-0000-4000-8000-000000000002';

      const expectedFindResult = createProductFixture();

      findOne.mockResolvedValue(expectedFindResult);
      findImage.mockResolvedValue(null);

      const result = service.deleteImage(productId, imageId);
      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Картинка не найдена');
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findImage).toHaveBeenCalledWith(productId, imageId);
      expect(findImage).toHaveBeenCalledTimes(1);
      expect(deleteImage).not.toHaveBeenCalled();
    });

    it('возвращает удалённое изображение', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const imageId = '00000000-0000-4000-8000-000000000001';

      const expectedFindResult = createProductFixture();
      const expectedFindImageResult = createProductImageFixture();
      const expectedDeleteResult = createProductImageFixture();

      findOne.mockResolvedValue(expectedFindResult);
      findImage.mockResolvedValue(expectedFindImageResult);
      deleteImage.mockResolvedValue(expectedDeleteResult);

      const result = service.deleteImage(productId, imageId);
      await expect(result).resolves.toEqual(expectedDeleteResult);
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(findImage).toHaveBeenCalledWith(productId, imageId);
      expect(findImage).toHaveBeenCalledTimes(1);
      expect(deleteImage).toHaveBeenCalledWith(productId, imageId);
      expect(deleteImage).toHaveBeenCalledTimes(1);
    });
  });

  describe('reorderImage', () => {
    it('выбрасывает ошибку, если товар не найден', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const data = {
        imageIds: [
          '00000000-0000-4000-8000-000000000008',
          '00000000-0000-4000-8000-000000000009',
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000002',
          '00000000-0000-4000-8000-000000000003',
          '00000000-0000-4000-8000-000000000005',
          '00000000-0000-4000-8000-000000000006',
          '00000000-0000-4000-8000-000000000004',
          '00000000-0000-4000-8000-000000000007',
          '00000000-0000-4000-8000-000000000010',
        ],
      };

      findOne.mockResolvedValue(null);

      const result = service.reorderImage(productId, data);
      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Товар не найден');
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(reorderImage).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если ID изображений повторяются', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const data = {
        imageIds: [
          '00000000-0000-4000-8000-000000000008',
          '00000000-0000-4000-8000-000000000009',
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000002',
          '00000000-0000-4000-8000-000000000005',
          '00000000-0000-4000-8000-000000000005',
          '00000000-0000-4000-8000-000000000006',
          '00000000-0000-4000-8000-000000000004',
          '00000000-0000-4000-8000-000000000007',
          '00000000-0000-4000-8000-000000000010',
        ],
      };

      const expectedFindResult = createProductFixture({
        images: [
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000001',
            position: 1,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000002',
            position: 2,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000003',
            position: 3,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000004',
            position: 4,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000005',
            position: 5,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000006',
            position: 6,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000007',
            position: 7,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000008',
            position: 8,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000009',
            position: 9,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000010',
            position: 10,
          }),
        ],
      });

      findOne.mockResolvedValue(expectedFindResult);

      const result = service.reorderImage(productId, data);
      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow('id картинок не могут повторяться');
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(reorderImage).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если переданы не все изображения товара', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const data = {
        imageIds: [
          '00000000-0000-4000-8000-000000000008',
          '00000000-0000-4000-8000-000000000009',
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000002',
          '00000000-0000-4000-8000-000000000003',
          '00000000-0000-4000-8000-000000000005',
          '00000000-0000-4000-8000-000000000006',
          '00000000-0000-4000-8000-000000000004',
          '00000000-0000-4000-8000-000000000007',
        ],
      };

      const expectedFindResult = createProductFixture({
        images: [
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000001',
            position: 1,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000002',
            position: 2,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000003',
            position: 3,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000004',
            position: 4,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000005',
            position: 5,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000006',
            position: 6,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000007',
            position: 7,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000008',
            position: 8,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000009',
            position: 9,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000010',
            position: 10,
          }),
        ],
      });

      findOne.mockResolvedValue(expectedFindResult);

      const result = service.reorderImage(productId, data);
      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow(
        'Нужно передать все изображения товара',
      );
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(reorderImage).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если изображение не принадлежит товару', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const data = {
        imageIds: [
          '00000000-0000-4000-8000-000000000008',
          '00000000-0000-4000-8000-000000000009',
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000003',
          '00000000-0000-4000-8000-000000000002',
          '00000000-0000-4000-8000-000000000005',
          '00000000-0000-4000-8000-000000000006',
          '00000000-0000-4000-8000-000000000004',
          '00000000-0000-4000-8000-000000000007',
          '00000000-0000-4000-8000-000000000011',
        ],
      };

      const expectedFindResult = createProductFixture({
        images: [
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000001',
            position: 1,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000002',
            position: 2,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000003',
            position: 3,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000004',
            position: 4,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000005',
            position: 5,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000006',
            position: 6,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000007',
            position: 7,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000008',
            position: 8,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000009',
            position: 9,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000010',
            position: 10,
          }),
        ],
      });

      findOne.mockResolvedValue(expectedFindResult);

      const result = service.reorderImage(productId, data);
      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow('Изображение не принадлежит товару');
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(reorderImage).not.toHaveBeenCalled();
    });

    it('возвращает изображения в обновлённом порядке', async () => {
      const productId = '00000000-0000-4000-8000-000000000001';
      const data = {
        imageIds: [
          '00000000-0000-4000-8000-000000000008',
          '00000000-0000-4000-8000-000000000009',
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000003',
          '00000000-0000-4000-8000-000000000002',
          '00000000-0000-4000-8000-000000000005',
          '00000000-0000-4000-8000-000000000006',
          '00000000-0000-4000-8000-000000000004',
          '00000000-0000-4000-8000-000000000007',
          '00000000-0000-4000-8000-000000000010',
        ],
      };

      const expectedFindResult = createProductFixture({
        images: [
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000001',
            position: 1,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000002',
            position: 2,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000003',
            position: 3,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000004',
            position: 4,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000005',
            position: 5,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000006',
            position: 6,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000007',
            position: 7,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000008',
            position: 8,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000009',
            position: 9,
          }),
          createProductImageFixture({
            id: '00000000-0000-4000-8000-000000000010',
            position: 10,
          }),
        ],
      });

      const expectReorderResult = [
        createProductImageFixture({
          id: '00000000-0000-4000-8000-000000000008',
          position: 1,
        }),
        createProductImageFixture({
          id: '00000000-0000-4000-8000-000000000009',
          position: 2,
        }),
        createProductImageFixture({
          id: '00000000-0000-4000-8000-000000000001',
          position: 3,
        }),
        createProductImageFixture({
          id: '00000000-0000-4000-8000-000000000003',
          position: 4,
        }),
        createProductImageFixture({
          id: '00000000-0000-4000-8000-000000000002',
          position: 5,
        }),
        createProductImageFixture({
          id: '00000000-0000-4000-8000-000000000005',
          position: 6,
        }),
        createProductImageFixture({
          id: '00000000-0000-4000-8000-000000000006',
          position: 7,
        }),
        createProductImageFixture({
          id: '00000000-0000-4000-8000-000000000004',
          position: 8,
        }),
        createProductImageFixture({
          id: '00000000-0000-4000-8000-000000000007',
          position: 9,
        }),
        createProductImageFixture({
          id: '00000000-0000-4000-8000-000000000010',
          position: 10,
        }),
      ];

      findOne.mockResolvedValue(expectedFindResult);
      reorderImage.mockResolvedValue(expectReorderResult);

      const result = service.reorderImage(productId, data);
      await expect(result).resolves.toEqual(expectReorderResult);
      expect(findOne).toHaveBeenCalledWith(productId);
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(reorderImage).toHaveBeenCalledWith(productId, data.imageIds);
      expect(reorderImage).toHaveBeenCalledTimes(1);
    });
  });
});
