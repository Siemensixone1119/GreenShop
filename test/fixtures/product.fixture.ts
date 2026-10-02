import { randomInt } from 'node:crypto';
import type {
  Prisma,
  Product,
  ProductImage,
  ProductVariant,
} from '../../generated/prisma/client.js';
import { Size } from '../../generated/prisma/enums.js';
import type { CreateProductVariantDto } from '../../src/product-variant/dto/create-product-variant.dto.js';
import type { UpdateProductVariantDto } from '../../src/product-variant/dto/update-product-variant.dto.js';
import type { PrismaService } from '../../src/prisma/prisma.service.js';
import type { CreateProductImageDto } from '../../src/products/dto/create-product-image.dto.js';
import type { CreateProductDto } from '../../src/products/dto/create-product.dto.js';
import type { ProductFilterDto } from '../../src/products/dto/filter-product.dto.js';
import type { ReorderProductImagesDto } from '../../src/products/dto/reorder-product-image.dto.js';
import type { UpdateProductImageDto } from '../../src/products/dto/update-product-image.dto.js';
import type { UpdateProductDto } from '../../src/products/dto/update-product.dto.js';

export function createProductVariantRequestData(
  overrides: Partial<CreateProductVariantDto> = {},
): CreateProductVariantDto {
  return {
    size: Size.MEDIUM,
    price: 1000,
    stock: 10,
    discountPercent: 0,
    sku: randomInt(1_000_000_000_000, 10_000_000_000_000).toString(),
    ...overrides,
  };
}

export function createUpdateProductVariantRequestData(
  overrides: Partial<UpdateProductVariantDto> = {},
): UpdateProductVariantDto {
  return {
    price: 1200,
    stock: 8,
    ...overrides,
  };
}

export function createProductImageRequestData(
  overrides: Partial<CreateProductImageDto> = {},
): CreateProductImageDto {
  return {
    url: '/images/products/monstera.jpg',
    alt: 'Монстера',
    position: 1,
    ...overrides,
  };
}

export function createUpdateProductImageRequestData(
  overrides: Partial<UpdateProductImageDto> = {},
): UpdateProductImageDto {
  return {
    alt: 'Обновлённое описание изображения',
    ...overrides,
  };
}

export function createReorderProductImagesRequestData(
  imageIds: string[],
  overrides: Partial<ReorderProductImagesDto> = {},
): ReorderProductImagesDto {
  return {
    imageIds,
    ...overrides,
  };
}

export function createProductRequestData(
  categoryId: string,
  overrides: Partial<CreateProductDto> = {},
): CreateProductDto {
  return {
    name: 'Монстера',
    description: 'Тестовое растение',
    categoryId,
    images: [createProductImageRequestData()],
    variants: [createProductVariantRequestData()],
    ...overrides,
  };
}

export function createUpdateProductRequestData(
  overrides: Partial<UpdateProductDto> = {},
): UpdateProductDto {
  return {
    name: 'Обновлённая монстера',
    ...overrides,
  };
}

export function createProductFilterRequestData(
  overrides: Partial<ProductFilterDto> = {},
): ProductFilterDto {
  return {
    page: 1,
    limit: 9,
    ...overrides,
  };
}

export function createProductFixture(
  prisma: PrismaService,
  categoryId: string,
  overrides: Partial<Prisma.ProductUncheckedCreateInput> = {},
): Promise<Product> {
  return prisma.product.create({
    data: {
      name: 'Монстера',
      description: 'Тестовое растение',
      categoryId,
      ...overrides,
    },
  });
}

export function createProductImageFixture(
  prisma: PrismaService,
  productId: string,
  overrides: Partial<Prisma.ProductImageUncheckedCreateInput> = {},
): Promise<ProductImage> {
  return prisma.productImage.create({
    data: {
      productId,
      url: '/images/products/monstera.jpg',
      alt: 'Монстера',
      position: 1,
      ...overrides,
    },
  });
}

export function createProductVariantFixture(
  prisma: PrismaService,
  productId: string,
  overrides: Partial<Prisma.ProductVariantUncheckedCreateInput> = {},
): Promise<ProductVariant> {
  return prisma.productVariant.create({
    data: {
      productId,
      size: Size.MEDIUM,
      price: 1000,
      stock: 10,
      sku: randomInt(1_000_000_000_000, 10_000_000_000_000).toString(),
      discountPercent: 0,
      ...overrides,
    },
  });
}
