import type { Cart, CartItem } from '../../../generated/prisma/client.js';
import type { CartWithItems } from '../types/cart-with-items.type.js';
import { createProductFixture } from '../../products/testing/product.fixtures.js';
import { createProductVariantFixture } from '../../products/testing/product.fixtures.js';

const testDate = new Date('2026-01-01T00:00:00.000Z');

export function createCartFixture(overrides: Partial<Cart> = {}): Cart {
  return {
    id: 1,
    userId: 1,
    createdAt: testDate,
    updatedAt: testDate,
    ...overrides,
  };
}

export function createCartItemFixture(
  overrides: Partial<CartItem> = {},
): CartItem {
  return {
    id: 1,
    cartId: 1,
    productVariantId: 1,
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
