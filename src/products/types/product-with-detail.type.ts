import type { Prisma } from '../../../generated/prisma/client.js';

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: true;
  };
}>;
