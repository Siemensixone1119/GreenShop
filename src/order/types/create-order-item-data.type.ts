import type { Size } from '../../../generated/prisma/enums.js';

export type CreateOrderItemData = {
  productVariantId: number;
  productName: string;
  size: Size;
  price: number;
  quantity: number;
  image: string | null;
};
