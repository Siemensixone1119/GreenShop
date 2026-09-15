import {
  ProductImage,
  ProductVariant,
  Size,
} from '../../../generated/prisma/client.js';
import { createCategoryFixtures } from '../../categories/testing/category.fixture.js';
import { ProductWithDetails } from '../types/product-with-detail.type.js';

const testDate = new Date('2026-01-01T00:00:00.000Z');

export function createProductImageFixtures(
  overrides: Partial<ProductImage> = {},
): ProductImage {
  return {
    id: 1,
    productId: 1,
    url: '/images/monstera.jpg',
    alt: 'Монстера',
    position: 1,
    ...overrides,
  };
}

export function createProductVariantFixtures(
  overrides: Partial<ProductVariant> = {},
): ProductVariant {
  return {
    id: 1,
    productId: 1,
    size: Size.MEDIUM,
    price: 1000,
    stock: 5,
    sku: '0123456789123',
    discountPercent: 0,
    createdAt: testDate,
    updatedAt: testDate,
    ...overrides,
  };
}

export function createProductFixtures(
  overrides: Partial<ProductWithDetails> = {},
): ProductWithDetails {
  return {
    id: 1,
    name: 'Монстера',
    description: 'Тестовое растение',
    categoryId: 1,
    createdAt: testDate,
    updatedAt: testDate,

    category: createCategoryFixtures(),
    variants: [createProductVariantFixtures()],
    images: [createProductImageFixtures()],
    ...overrides,
  };
}
