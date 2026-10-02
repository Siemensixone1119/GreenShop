import type { Cart, CartItem, Prisma } from '../../generated/prisma/client.js';
import type { AddCartItemDto } from '../../src/cart/dto/add-cart-item.dto.js';
import type { UpdateCartItemDto } from '../../src/cart/dto/update-cart-item.dto.js';
import type { PrismaService } from '../../src/prisma/prisma.service.js';

export function createAddCartItemRequestData(
  productVariantId: string,
  overrides: Partial<AddCartItemDto> = {},
): AddCartItemDto {
  return {
    productVariantId,
    quantity: 2,
    ...overrides,
  };
}

export function createUpdateCartItemRequestData(
  overrides: Partial<UpdateCartItemDto> = {},
): UpdateCartItemDto {
  return {
    quantity: 3,
    ...overrides,
  };
}

export function createCartFixture(
  prisma: PrismaService,
  userId: string,
  overrides: Partial<Prisma.CartUncheckedCreateInput> = {},
): Promise<Cart> {
  return prisma.cart.create({
    data: { userId, ...overrides },
  });
}

export function createCartItemFixture(
  prisma: PrismaService,
  cartId: string,
  productVariantId: string,
  overrides: Partial<Prisma.CartItemUncheckedCreateInput> = {},
): Promise<CartItem> {
  return prisma.cartItem.create({
    data: { cartId, productVariantId, quantity: 2, ...overrides },
  });
}
