import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductVariantsRepository } from './product-variant.repository.js';
import type { ProductVariant } from '../../generated/prisma/client.js';
import type { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import type { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';

@Injectable()
export class ProductVariantService {
  constructor(
    private readonly productVariantRepository: ProductVariantsRepository,
  ) {}

  async findOne(productId: number, variantId: number): Promise<ProductVariant> {
    if (!productId || productId <= 0) {
      throw new BadRequestException('Некорректный id товара');
    }

    if (!variantId || variantId <= 0) {
      throw new BadRequestException('Некорректный id варианта');
    }

    const productVariant =
      await this.productVariantRepository.findOneByProductId(
        productId,
        variantId,
      );

    if (!productVariant) {
      throw new NotFoundException('Вариант товара не найден');
    }

    return productVariant;
  }

  async findOneById(variantId: number): Promise<ProductVariant> {
    if (!variantId || variantId <= 0) {
      throw new BadRequestException('Некорректный id варианта');
    }

    const productVariant =
      await this.productVariantRepository.findOneById(variantId);

    if (!productVariant) {
      throw new NotFoundException('Вариант товара не найден');
    }

    return productVariant;
  }

  async findAll(productId: number): Promise<ProductVariant[]> {
    if (!productId || productId <= 0) {
      throw new BadRequestException('Некорректный id товара');
    }

    await this.ensureProductExists(productId);

    return this.productVariantRepository.findAllByProductId(productId);
  }

  async create(
    productId: number,
    data: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    if (!productId || productId <= 0) {
      throw new BadRequestException('Некорректный id товара');
    }

    await this.ensureProductExists(productId);

    const size = data.size;
    if (size) {
      const variantWithCurrentSize =
        await this.productVariantRepository.findBySize(productId, size);
      if (variantWithCurrentSize) {
        throw new ConflictException('Вариант такого размера уже существует');
      }
    }

    const sku = data.sku;
    if (sku) {
      if (await this.productVariantRepository.findBySku(sku)) {
        throw new ConflictException('Вариант с таким артикулом уже существует');
      }
    }

    return this.productVariantRepository.create(productId, data);
  }

  async update(
    productId: number,
    variantId: number,
    data: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    if (!productId || productId <= 0) {
      throw new BadRequestException('Некорректный id товара');
    }

    if (!variantId || variantId <= 0) {
      throw new BadRequestException('Некорректный id варианта');
    }

    await this.findOne(productId, variantId);

    const size = data.size;
    if (size) {
      const variantWithCurrentSize =
        await this.productVariantRepository.findBySize(productId, size);
      if (variantWithCurrentSize && variantWithCurrentSize.id !== variantId) {
        throw new ConflictException('Вариант такого размера уже существует');
      }
    }

    const sku = data.sku;
    if (sku) {
      const variantWithSku = await this.productVariantRepository.findBySku(sku);
      if (variantWithSku && variantWithSku.id !== variantId) {
        throw new ConflictException('Вариант с таким артикулом уже существует');
      }
    }

    return this.productVariantRepository.update(productId, variantId, data);
  }

  async delete(productId: number, variantId: number): Promise<ProductVariant> {
    if (!productId || productId <= 0) {
      throw new BadRequestException('Некорректный id товара');
    }

    if (!variantId || variantId <= 0) {
      throw new BadRequestException('Некорректный id варианта');
    }

    await this.findOne(productId, variantId);

    const variantsCount =
      await this.productVariantRepository.countVariants(productId);
    if (variantsCount <= 1) {
      throw new ConflictException('Нельзя удалить последний вариант товара');
    }

    return this.productVariantRepository.delete(productId, variantId);
  }

  private async ensureProductExists(productId: number): Promise<void> {
    const productExists =
      await this.productVariantRepository.productExists(productId);

    if (!productExists) {
      throw new NotFoundException('Товар не найден');
    }
  }
}
