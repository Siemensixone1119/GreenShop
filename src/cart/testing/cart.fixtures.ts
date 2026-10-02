import type { Cart, CartItem } from '../../../generated/prisma/client.js';
import type { CartWithItems } from '../types/cart-with-items.type.js';
import { createProductFixture } from '../../products/testing/product.fixtures.js';
import { createProductVariantFixture } from '../../products/testing/product.fixtures.js';

const testDate = new Date('2026-01-01T00:00:00.000Z');

export function createCartFixture(overrides: Partial<Cart> = {}): Cart {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    userId: '00000000-0000-4000-8000-000000000002',
    createdAt: testDate,
    updatedAt: testDate,
    ...overrides,
  };
}

export function createCartItemFixture(
  overrides: Partial<CartItem> = {},
): CartItem {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    cartId: '00000000-0000-4000-8000-000000000003',
    productVariantId: '00000000-0000-4000-8000-000000000006',
    quantity: 2,
    createdAt: testDate,
    updatedAt: testDate,
    ...overrides,
  };
}

export function createCartWithItemsFixture(
  overrides: Partial<CartWithItems> = {},
): CartWithItems {
  const product = createProductFixture();
  const productVariant = {
    ...createProductVariantFixture(),
    product,
  };

  return {
    ...createCartFixture(),
    items: [
      {
        ...createCartItemFixture(),
        productVariant,
      },
    ],
    ...overrides,
  };
}
