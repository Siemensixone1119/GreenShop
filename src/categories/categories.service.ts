import { BadRequestException, NotFoundException, Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository.js';
import { Category } from '../../generated/prisma/client.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
    constructor(private readonly categoriesRepository: CategoriesRepository) { }

    findAll(search?: string): Promise<Category[]> {
        const query = search?.trim()
        return this.categoriesRepository.findAll(query)
    }

    async findOne(id: number): Promise<Category> {
        if (id <= 0) {
            throw new BadRequestException("некорректный id категории")
        }

        const category = await this.categoriesRepository.findOne(id)

        if (!category) {
            throw new NotFoundException('Категория не найден')
        }

        return category
    }

    create(data: CreateCategoryDto): Promise<Category> {
        return this.categoriesRepository.create(data)
    }

    async update(id: number, data: UpdateCategoryDto): Promise<Category> {
        if (id <= 0) {
            throw new BadRequestException("некорректный id категории")
        }

        await this.findOne(id)
        return this.categoriesRepository.update(id, data)
    }

    async delete(id: number): Promise<Category> {
        if (id <= 0) {
            throw new BadRequestException("некорректный id категории")
        }

        await this.findOne(id)

        if(await this.categoriesRepository.hasProduct(id)){
           throw new BadRequestException('Нельзя удалить категорию, в которой есть товары'); 
        }

        return this.categoriesRepository.delete(id)
    }
}
