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
import { CategoriesService } from '../categories/categories.service.js';
import { ReorderProductImagesDto } from './dto/reorder-product-image.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

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
      throw new BadRequestException('Некорректный id товара');
    }

    const product = await this.productsRepository.findOne(productId);

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return product;
  }

  async create(data: CreateProductDto): Promise<ProductWithDetails> {
    await this.categoriesService.findOne(data.categoryId);

    const sizes = data.variants.map((variant) => variant.size);
    const uniqueSizes = new Set(sizes);

    if (sizes.length !== uniqueSizes.size) {
      throw new ConflictException(
        'Товары с одинаковыми размерами не могут быть созданы',
      );
    }

    const sku = data.variants.map((variant) => variant.sku);
    const uniqueSku = new Set(sku);

    if (sku.length !== uniqueSku.size) {
      throw new ConflictException(
        'Товары с одинаковыми артикулами не могут быть созданы',
      );
    }

    const imgPosition = data.images?.map((img) => img.position) ?? [];
    const uniqueImgPosition = new Set(imgPosition);

    if (imgPosition.length !== uniqueImgPosition.size) {
      throw new ConflictException(
        'Товары с одинаковым позициями фотографий не могут быть созданы',
      );
    }

    return this.productsRepository.create(data);
  }

  async update(
    productId: number,
    data: UpdateProductDto,
  ): Promise<ProductWithDetails> {
    if (productId <= 0) {
      throw new BadRequestException('Некорректный id товара');
    }

    if (data.categoryId) {
      await this.categoriesService.findOne(data.categoryId);
    }

    await this.findOne(productId);
    return this.productsRepository.update(productId, data);
  }

  async delete(productId: number): Promise<ProductWithDetails> {
    if (productId <= 0) {
      throw new BadRequestException('Некорректный id товара');
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
    const product = await this.findOne(productId);
    const image = await this.productsRepository.findImage(productId, imageId);

    if (!image) {
      throw new NotFoundException('Картинка не найдена');
    }

    product.images.forEach((item) => {
      if (item.position === data.position && item.id !== imageId) {
        throw new ConflictException(
          'Изображение с такой позицией уже существует',
        );
      }
    });

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

  async reorderImage(
    productId: number,
    data: ReorderProductImagesDto,
  ): Promise<ProductImage[]> {
    const product = await this.findOne(productId);

    const imageIdsUnique = new Set(data.imageIds);

    if (imageIdsUnique.size !== data.imageIds.length) {
      throw new BadRequestException('id картинок не могут повторяться');
    }

    if (product.images.length !== data.imageIds.length) {
      throw new BadRequestException('Нужно передать все изображения товара');
    }

    data.imageIds.forEach((id) => {
      if (!product.images.some((image) => image.id === id)) {
        throw new BadRequestException('Изображение не принадлежит товару');
      }
    });

    return this.productsRepository.reorderImage(productId, data.imageIds);
  }
}
