import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service.js';
import { Category } from '../../generated/prisma/client.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';



@Injectable()
export class CategoriesRepository {
    constructor(private readonly prisma: PrismaService) { }

    findAll(query?: string): Promise<Category[]> {
        return this.prisma.category.findMany(
            {
                where: query ?
                    {
                        name:
                        {
                            contains: query,
                            mode: 'insensitive'
                        }
                    } : undefined
            })
    }

    findOne(id: number): Promise<Category | null> {
        return this.prisma.category.findUnique(
            {
                where:
                {
                    id: id
                }
            })
    }

    create(data: CreateCategoryDto): Promise<Category> {
        return this.prisma.category.create({
            data
        })
    }

    update(id: number, data: UpdateCategoryDto): Promise<Category> {
        return this.prisma.category.update(
            {
                where: { id },
                data
            })
    }

    delete(id: number): Promise<Category> {
        return this.prisma.category.delete(
            {
                where: { id }
            }
        )
    }

    async hasProduct(id: number): Promise<boolean> {
        return await this.prisma.product.findFirst(
            {
                where: { categoryId: id },
                select: { id: true }
            }
        ) !== null
    }
}