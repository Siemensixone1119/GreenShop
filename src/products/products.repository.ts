import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service.js';
import type { Product } from '../../generated/prisma/client.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import type { ProductWithCategory } from './types/product-with-category.type.js';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query?: string): Promise<ProductWithCategory[]> {
    return this.prisma.product.findMany({
      where: query
        ? {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          }
        : undefined,
      include: {
        category: true,
      },
    });
  }

  findOne(id: number): Promise<ProductWithCategory | null> {
    return this.prisma.product.findUnique({
      where: {
        id: id,
      },
      include: {
        category: true,
      },
    });
  }

  create(data: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  update(id: number, data: UpdateProductDto): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  delete(id: number): Promise<Product> {
    return this.prisma.product.delete({
      where: {
        id: id,
      },
    });
  }
}
