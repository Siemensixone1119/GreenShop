import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsRepository } from './products.repository.js';
import type { ProductImage } from '../../generated/prisma/client.js';
import type { ProductWithDetails } from './types/product-with-detail.type.js';
import { CreateProductImageDto } from './dto/create-product-image.dto.js';
import { UpdateProductImageDto } from './dto/update-product-image.dto.js';
import { ProductFilterDto } from './dto/filter-product.dto.js';
import { PaginatedProducts } from './types/paginated-products.type.js';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  findAll(filters: ProductFilterDto): Promise<PaginatedProducts> {
    if (
      filters.minPrice !== undefined &&
      filters.maxPrice !== undefined &&
      filters.minPrice > filters.maxPrice
    ) {
      throw new BadRequestException(
        'Минимальная цена не может быть больше максимальной',
      );
    }

    return this.productsRepository.findAll(filters);
  }

  async findOne(productId: number): Promise<ProductWithDetails> {
    if (productId <= 0) {
      throw new BadRequestException('некорректный id товара');
    }

    const product = await this.productsRepository.findOne(productId);

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return product;
  }

  create(data: CreateProductDto): Promise<ProductWithDetails> {
    return this.productsRepository.create(data);
  }

  async update(
    productId: number,
    data: UpdateProductDto,
  ): Promise<ProductWithDetails> {
    if (productId <= 0) {
      throw new BadRequestException('id товара не передан');
    }

    await this.findOne(productId);
    return this.productsRepository.update(productId, data);
  }

  async delete(productId: number): Promise<ProductWithDetails> {
    if (productId <= 0) {
      throw new BadRequestException('id товара не передан');
    }

    await this.findOne(productId);
    return this.productsRepository.delete(productId);
  }

  async addImage(
    productId: number,
    imageData: CreateProductImageDto,
  ): Promise<ProductImage> {
    const product = await this.findOne(productId);
    product.images.forEach((image) => {
      if (image.position === imageData.position) {
        throw new ConflictException(
          'Изображение с такой позицией уже существует',
        );
      }
    });
    return this.productsRepository.addImage(productId, imageData);
  }

  async updateImage(
    productId: number,
    imageId: number,
    data: UpdateProductImageDto,
  ): Promise<ProductImage> {
    await this.findOne(productId);
    const image = await this.productsRepository.findImage(productId, imageId);

    if (!image) {
      throw new NotFoundException('Картинка не найдена');
    }

    return this.productsRepository.updateImage(productId, imageId, data);
  }

  async deleteImage(productId: number, imageId: number): Promise<ProductImage> {
    await this.findOne(productId);
    const image = await this.productsRepository.findImage(productId, imageId);

    if (!image) {
      throw new NotFoundException('Картинка не найдена');
    }
    return this.productsRepository.deleteImage(productId, imageId);
  }
}
