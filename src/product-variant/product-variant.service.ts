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

  async findOne(productId: string, variantId: string): Promise<ProductVariant> {
    if (!productId) {
      throw new BadRequestException('Некорректный id товара');
    }

    if (!variantId) {
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

  async findOneById(variantId: string): Promise<ProductVariant> {
    if (!variantId) {
      throw new BadRequestException('Некорректный id варианта');
    }

    const productVariant =
      await this.productVariantRepository.findOneById(variantId);

    if (!productVariant) {
      throw new NotFoundException('Вариант товара не найден');
    }

    return productVariant;
  }

  async findAll(productId: string): Promise<ProductVariant[]> {
    if (!productId) {
      throw new BadRequestException('Некорректный id товара');
    }

    await this.findProduct(productId);

    return this.productVariantRepository.findAllByProductId(productId);
  }

  async create(
    productId: string,
    data: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    if (!productId) {
      throw new BadRequestException('Некорректный id товара');
    }

    await this.findProduct(productId);

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
    productId: string,
    variantId: string,
    data: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    if (!productId) {
      throw new BadRequestException('Некорректный id товара');
    }

    if (!variantId) {
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

  async delete(productId: string, variantId: string): Promise<ProductVariant> {
    if (!productId) {
      throw new BadRequestException('Некорректный id товара');
    }

    if (!variantId) {
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

  private async findProduct(productId: string): Promise<void> {
    const productExists =
      await this.productVariantRepository.findProduct(productId);

    if (!productExists) {
      throw new NotFoundException('Товар не найден');
    }
  }
}
