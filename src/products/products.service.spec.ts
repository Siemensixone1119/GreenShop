import { Test } from '@nestjs/testing'
import type { TestingModule } from '@nestjs/testing'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ProductsService } from './products.service.js';
import { ProductsRepository } from './products.repository.js';
import { BadRequestException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let findAll: jest.MockedFunction<ProductsRepository['findAll']>;
  let findOne: jest.MockedFunction<ProductsRepository['findOne']>;

  beforeEach(async () => {
    findAll = jest.fn()
    findOne = jest.fn()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: {
            findAll
          }
        }
      ]
    }).compile()

    service = module.get<ProductsService>(ProductsService)
  })

  describe('findAll', () => {
    it('получение результата репозитория для корректных фильтров', async () => {
      const filters = {
        minPrice: 1000,
        maxPrice: 3000
      }

      const expectedResult = {
        items: [],
        total: 0,
        page: 1,
        limit: 9,
        totalPages: 0
      }

      findAll.mockResolvedValue(expectedResult)

      const result = await service.findAll(filters)

      expect(result).toEqual(expectedResult)
      expect(findAll).toHaveBeenCalledTimes(1)
      expect(findAll).toHaveBeenCalledWith(filters)
    })

    it('выбрасывает ошибку, если минимальная цена больше максимальной', () => {
      const filters = {
        minPrice: 3000,
        maxPrice: 1000
      }

      const resultCallback = () => service.findAll(filters)

      expect(resultCallback).toThrow(BadRequestException)
      expect(resultCallback).toThrow('Минимальная цена не может быть больше максимальной')
      expect(findAll).not.toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('выбрасывает ошибку, если id товара <= 0', async () => {
      const productId = 0;

      const resultCallback = () => service.findOne(productId)

      await expect(resultCallback).rejects.toThrow(BadRequestException)
      await expect(resultCallback).rejects.toThrow('Некорректный id товара')
      expect(findOne).not.toHaveBeenCalled()
    })
  })
})