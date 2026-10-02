import type { Size } from '../../../generated/prisma/enums.js';

export type CreateOrderItemData = {
  productVariantId: string;
  productName: string;
  size: Size;
  price: number;
  quantity: number;
  image: string | null;
};
