import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ProductVariant } from '../../generated/prisma/client.js';
import type { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import type { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';
import type { Size } from '../../generated/prisma/enums.js';

@Injectable()
export class ProductVariantsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async productExists(productId: number): Promise<boolean> {
    const product = await this.prismaService.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
      },
    });

    return product !== null;
  }

  findOneById(variantId: number): Promise<ProductVariant | null> {
    return this.prismaService.productVariant.findUnique({
      where: {
        id: variantId,
      },
    });
  }

  findOneByProductId(
    productId: number,
    variantId: number,
  ): Promise<ProductVariant | null> {
    return this.prismaService.productVariant.findUnique({
      where: {
        id: variantId,
        productId,
      },
    });
  }

  findAllByProductId(productId: number): Promise<ProductVariant[]> {
    return this.prismaService.productVariant.findMany({
      where: {
        productId,
      },
    });
  }

  create(
    productId: number,
    data: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    return this.prismaService.productVariant.create({
      data: {
        ...data,
        productId,
      },
    });
  }

  update(
    productId: number,
    variantId: number,
    data: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    return this.prismaService.productVariant.update({
      where: { id: variantId, productId },
      data: { ...data },
    });
  }

  delete(productId: number, variantId: number): Promise<ProductVariant> {
    return this.prismaService.productVariant.delete({
      where: {
        id: variantId,
        productId,
      },
    });
  }

  findBySku(sku: string): Promise<ProductVariant | null> {
    return this.prismaService.productVariant.findUnique({
      where: { sku },
    });
  }

  findBySize(productId: number, size: Size): Promise<ProductVariant | null> {
    return this.prismaService.productVariant.findUnique({
      where: {
        productId_size: {
          productId,
          size,
        },
      },
    });
  }

  countVariants(productId: number): Promise<number> {
    return this.prismaService.productVariant.count({
      where: {
        productId,
      },
    });
  }
}
