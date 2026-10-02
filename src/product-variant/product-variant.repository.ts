import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ProductVariant } from '../../generated/prisma/client.js';
import type { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import type { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';
import type { Size } from '../../generated/prisma/enums.js';

@Injectable()
export class ProductVariantsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findProduct(productId: string): Promise<boolean> {
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

  findOneById(variantId: string): Promise<ProductVariant | null> {
    return this.prismaService.productVariant.findUnique({
      where: {
        id: variantId,
      },
    });
  }

  findOneByProductId(
    productId: string,
    variantId: string,
  ): Promise<ProductVariant | null> {
    return this.prismaService.productVariant.findUnique({
      where: {
        id: variantId,
        productId,
      },
    });
  }

  findAllByProductId(productId: string): Promise<ProductVariant[]> {
    return this.prismaService.productVariant.findMany({
      where: {
        productId,
      },
    });
  }

  create(
    productId: string,
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
    productId: string,
    variantId: string,
    data: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    return this.prismaService.productVariant.update({
      where: { id: variantId, productId },
      data: { ...data },
    });
  }

  delete(productId: string, variantId: string): Promise<ProductVariant> {
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

  findBySize(productId: string, size: Size): Promise<ProductVariant | null> {
    return this.prismaService.productVariant.findUnique({
      where: {
        productId_size: {
          productId,
          size,
        },
      },
    });
  }

  countVariants(productId: string): Promise<number> {
    return this.prismaService.productVariant.count({
      where: {
        productId,
      },
    });
  }
}
