import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CategoriesRepository } from './categories.repository.js';
import { createCategoryFixture } from './testing/category.fixture.js';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: {
    findAll: jest.MockedFunction<CategoriesRepository['findAll']>;
    findOne: jest.MockedFunction<CategoriesRepository['findOne']>;
    create: jest.MockedFunction<CategoriesRepository['create']>;
    update: jest.MockedFunction<CategoriesRepository['update']>;
    delete: jest.MockedFunction<CategoriesRepository['delete']>;
    hasProducts: jest.MockedFunction<CategoriesRepository['hasProducts']>;
  };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasProducts: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(CategoriesService);
  });

  it('передаёт обрезанную строку поиска в репозиторий', async () => {
    const categories = [createCategoryFixture()];
    repository.findAll.mockResolvedValue(categories);
    await expect(service.findAll('  растения  ')).resolves.toEqual(categories);
    expect(repository.findAll).toHaveBeenCalledWith('растения');
  });

  it('передаёт undefined, если поиск не указан', async () => {
    repository.findAll.mockResolvedValue([]);
    await service.findAll();
    expect(repository.findAll).toHaveBeenCalledWith(undefined);
  });

  it('выбрасывает ошибку, если ID категории некорректен', async () => {
    await expect(service.findOne('')).rejects.toThrow(BadRequestException);
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('выбрасывает ошибку, если категория не найдена', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(
      service.findOne('00000000-0000-4000-8000-000000000001'),
    ).rejects.toThrow('Категория не найдена');
    expect(repository.findOne).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000001',
    );
  });

  it('возвращает найденную категорию', async () => {
    const category = createCategoryFixture();
    repository.findOne.mockResolvedValue(category);
    await expect(
      service.findOne('00000000-0000-4000-8000-000000000001'),
    ).resolves.toEqual(category);
  });

  it('возвращает созданную категорию', async () => {
    const data = { name: 'Комнатные' };
    const category = createCategoryFixture(data);
    repository.create.mockResolvedValue(category);
    await expect(service.create(data)).resolves.toEqual(category);
    expect(repository.create).toHaveBeenCalledWith(data);
  });

  it('не обновляет отсутствующую категорию', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(
      service.update('00000000-0000-4000-8000-000000000001', {
        name: 'Новое имя',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('возвращает обновлённую категорию', async () => {
    const category = createCategoryFixture();
    const updated = createCategoryFixture({ name: 'Новое имя' });
    repository.findOne.mockResolvedValue(category);
    repository.update.mockResolvedValue(updated);
    await expect(
      service.update('00000000-0000-4000-8000-000000000001', {
        name: 'Новое имя',
      }),
    ).resolves.toEqual(updated);
    expect(repository.update).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000001',
      { name: 'Новое имя' },
    );
  });

  it('не удаляет категорию с товарами', async () => {
    repository.findOne.mockResolvedValue(createCategoryFixture());
    repository.hasProducts.mockResolvedValue(true);
    await expect(
      service.delete('00000000-0000-4000-8000-000000000001'),
    ).rejects.toThrow('Нельзя удалить категорию, в которой есть товары');
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('возвращает удалённую пустую категорию', async () => {
    const category = createCategoryFixture();
    repository.findOne.mockResolvedValue(category);
    repository.hasProducts.mockResolvedValue(false);
    repository.delete.mockResolvedValue(category);
    await expect(
      service.delete('00000000-0000-4000-8000-000000000001'),
    ).resolves.toEqual(category);
    expect(repository.hasProducts).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000001',
    );
    expect(repository.delete).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000001',
    );
  });
});
