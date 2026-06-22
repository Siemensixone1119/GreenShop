import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsRepository } from './products.repository.js';
import type { Product } from '../../generated/prisma/client.js';
import type { ProductWithCategory } from './types/product-with-category.type.js';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  findAll(search?: string): Promise<ProductWithCategory[]> {
    const query = search?.trim();
    return this.productsRepository.findAll(query);
  }

  async findOne(id: number): Promise<ProductWithCategory> {
    if (id <= 0) {
      throw new BadRequestException('некорректный id товара');
    }

    const product = await this.productsRepository.findOne(id);

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return product;
  }

  create(data: CreateProductDto): Promise<Product> {
    return this.productsRepository.create(data);
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    if (id <= 0) {
      throw new BadRequestException('id товара не передан');
    }

    await this.findOne(id);
    return this.productsRepository.update(id, data);
  }

  async delete(id: number): Promise<Product> {
    if (id <= 0) {
      throw new BadRequestException('id товара не передан');
    }

    await this.findOne(id);
    return this.productsRepository.delete(id);
  }
}
