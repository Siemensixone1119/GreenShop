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
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CategoriesService } from '../categories/categories.service.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let findAll: jest.MockedFunction<ProductsRepository['findAll']>;
  let findOne: jest.MockedFunction<ProductsRepository['findOne']>;
  let create: jest.MockedFunction<ProductsRepository['create']>;
  let update: jest.MockedFunction<ProductsRepository['update']>;
  let deleteProduct: jest.MockedFunction<ProductsRepository['delete']>;
  let addImage: jest.MockedFunction<ProductsRepository['addImage']>;
  let updateImage: jest.MockedFunction<ProductsRepository['updateImage']>;
  let findCategory: jest.MockedFunction<CategoriesService['findOne']>;

  beforeEach(async () => {
    findAll = jest.fn();
    findOne = jest.fn();
    create = jest.fn();
    update = jest.fn();
    deleteProduct = jest.fn();
    addImage = jest.fn();
    updateImage = jest.fn();
    findCategory = jest.fn();
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
    it('получение результата репозитория для корректных фильтров', async () => {
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

      const result = await service.findAll(filters);

      expect(result).toEqual(expectedResult);
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
    it('выбрасывает ошибку, если id товара <= 0', async () => {
      const productId = 0;

      const result = service.findOne(productId);

      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow('Некорректный id товара');
      expect(findOne).not.toHaveBeenCalled();
    });

    it('выбрасывает ошибку, если товар не найден', async () => {
      const productId = 1;

      findOne.mockResolvedValue(null);

      const result = service.findOne(productId);

      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Товар не найден');
      expect(findOne).toHaveBeenCalledTimes(1);
    });

    it('', async () => {
      const productId = 1;
      const date = new Date();

      const expectedResult: ProductWithDetails = {
        id: 1,
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: 1,
        createdAt: date,
        updatedAt: date,
        category: {
          id: 1,
          name: 'Комнатные растения',
          createdAt: date,
          updatedAt: date,
        },
        images: [],
        variants: [],
      };

      findOne.mockResolvedValue(expectedResult);

      const result = await service.findOne(productId);

      expect(result).toEqual(expectedResult);
      expect(findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('успешное создание товара', async () => {
      const date = new Date();

      const data: CreateProductDto = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: 1,
        images: [],
        variants: [],
      };

      const expectedResult: ProductWithDetails = {
        id: 1,
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: 1,
        createdAt: date,
        updatedAt: date,
        category: {
          id: 1,
          name: 'Комнатные растения',
          createdAt: date,
          updatedAt: date,
        },
        images: [],
        variants: [],
      };

      const category = {
        id: 1,
        name: 'plants',
        createdAt: date,
        updatedAt: date,
      };

      findCategory.mockResolvedValue(category);
      create.mockResolvedValue(expectedResult);

      const result = await service.create(data);

      expect(result).toEqual(expectedResult);
      expect(create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('выбрасывает ошибку, если id товара <= 0', async () => {
      const productId = 0;
      const data: UpdateProductDto = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: 1,
      };

      const result = service.update(productId, data);

      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow('Некорректный id товара');
      expect(update).not.toHaveBeenCalled();
    });

    it('обновление товара', async () => {
      const productId = 1;
      const date = new Date();
      const data: UpdateProductDto = {
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: 1,
      };

      const product: ProductWithDetails = {
        id: 1,
        name: 'Фикус',
        description: 'Тестовое растение1',
        categoryId: 2,
        createdAt: date,
        updatedAt: date,
        category: {
          id: 1,
          name: 'Комнатные растения',
          createdAt: date,
          updatedAt: date,
        },
        images: [],
        variants: [],
      };

      const expectedResult: ProductWithDetails = {
        id: 1,
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: 1,
        createdAt: date,
        updatedAt: date,
        category: {
          id: 1,
          name: 'Комнатные растения',
          createdAt: date,
          updatedAt: date,
        },
        images: [],
        variants: [],
      };

      findOne.mockResolvedValue(product);
      update.mockResolvedValue(expectedResult);

      const result = await service.update(productId, data);

      expect(result).toEqual(expectedResult);
      expect(update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('выбрасывает ошибку, если id товара <= 0', async () => {
      const productId = 0;
      const result = service.delete(productId);

      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow('Некорректный id товара');
      expect(deleteProduct).not.toHaveBeenCalled();
    });

    it('удаление товара', async () => {
      const productId = 1;
      const date = new Date();
      const expectedResult: ProductWithDetails = {
        id: 1,
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: 1,
        createdAt: date,
        updatedAt: date,
        category: {
          id: 1,
          name: 'Комнатные растения',
          createdAt: date,
          updatedAt: date,
        },
        images: [],
        variants: [],
      };

      findOne.mockResolvedValue(expectedResult);
      deleteProduct.mockResolvedValue(expectedResult);

      const result = await service.delete(productId);

      expect(result).toEqual(expectedResult);
      expect(deleteProduct).toHaveBeenCalledTimes(1);
    });
  });

  describe('addImage', () => {
    it('Возвращает ошибку если изображение с такой позицией уже существует', async () => {
      const productId = 1;
      const date = new Date();
      const expectedResult: ProductWithDetails = {
        id: 1,
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: 1,
        createdAt: date,
        updatedAt: date,
        category: {
          id: 1,
          name: 'Комнатные растения',
          createdAt: date,
          updatedAt: date,
        },
        images: [
          {
            id: 1,
            productId: 1,
            url: '',
            position: 1,
            alt: null,
          },
        ],
        variants: [],
      };

      const image = {
        url: '/images/monstera.jpg',
        position: 1,
        alt: undefined,
      };

      findOne.mockResolvedValue(expectedResult);

      const result = service.addImage(productId, image);

      await expect(result).rejects.toThrow(ConflictException);
      await expect(result).rejects.toThrow(
        'Изображение с такой позицией уже существует',
      );
      expect(addImage).not.toHaveBeenCalled();
    });

    it('Добавление картинки к продукту', async () => {
      const productId = 1;
      const date = new Date();
      const expectedResult: ProductWithDetails = {
        id: 1,
        name: 'Монстера',
        description: 'Тестовое растение',
        categoryId: 1,
        createdAt: date,
        updatedAt: date,
        category: {
          id: 1,
          name: 'Комнатные растения',
          createdAt: date,
          updatedAt: date,
        },
        images: [
          {
            id: 1,
            productId: 1,
            url: '',
            position: 1,
            alt: 'photo1',
          },
        ],
        variants: [],
      };

      const image = {
        id: 2,
        productId: 1,
        url: '',
        position: 2,
        alt: 'photo2',
      };

      findOne.mockResolvedValue(expectedResult);
      addImage.mockResolvedValue(image);

      const result = await service.addImage(productId, image);

      expect(result).toEqual(image);
      expect(addImage).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateImage', () => {
    it('Выводит ошибку если товар не найден', async () => {
      const productId = 1;
      const imageId = 1;
      const data = {
        alt: 'photo2',
      };

      findOne.mockResolvedValue(null);

      const result = service.updateImage(productId, imageId, data);
      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Товар не найден');
      expect(updateImage).not.toHaveBeenCalled();
    });

    it('Выводит ошибку если изображение не найдено', async () => {
      const productId = 1;
      const imageId = 1;
      const data = {
        alt: 'photo2',
      };

      const result = service.updateImage(productId, imageId, data);
      await expect(result).rejects.toThrow(NotFoundException);
      await expect(result).rejects.toThrow('Товар не найден');
      expect(updateImage).not.toHaveBeenCalled();
    });
  });
});
