import { Prisma } from '../../../generated/prisma/client.js';

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: true;
  };
}>;
