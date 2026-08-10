import {
  BadRequestException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository.js';
import type { Category } from '../../generated/prisma/client.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  findAll(search?: string): Promise<Category[]> {
    const query = search?.trim();
    return this.categoriesRepository.findAll(query);
  }

  async findOne(categoryId: number): Promise<Category> {
    if (categoryId <= 0) {
      throw new BadRequestException('некорректный id категории');
    }

    const category = await this.categoriesRepository.findOne(categoryId);

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  create(data: CreateCategoryDto): Promise<Category> {
    return this.categoriesRepository.create(data);
  }

  async update(categoryId: number, data: UpdateCategoryDto): Promise<Category> {
    if (categoryId <= 0) {
      throw new BadRequestException('некорректный id категории');
    }

    await this.findOne(categoryId);
    return this.categoriesRepository.update(categoryId, data);
  }

  async delete(categoryId: number): Promise<Category> {
    if (categoryId <= 0) {
      throw new BadRequestException('некорректный id категории');
    }

    await this.findOne(categoryId);

    if (await this.categoriesRepository.hasProducts(categoryId)) {
      throw new BadRequestException(
        'Нельзя удалить категорию, в которой есть товары',
      );
    }

    return this.categoriesRepository.delete(categoryId);
  }
}
