import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service.js';
import type { Category } from '../../generated/prisma/client.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query?: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: query
        ? {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          }
        : undefined,
    });
  }

  findOne(categoryId: number): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });
  }

  create(data: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({
      data,
    });
  }

  update(categoryId: number, data: UpdateCategoryDto): Promise<Category> {
    return this.prisma.category.update({
      where: { id: categoryId },
      data,
    });
  }

  delete(categoryId: number): Promise<Category> {
    return this.prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async hasProducts(categoryId: number): Promise<boolean> {
    return (
      (await this.prisma.product.findFirst({
        where: { categoryId },
        select: { id: true },
      })) !== null
    );
  }
}
