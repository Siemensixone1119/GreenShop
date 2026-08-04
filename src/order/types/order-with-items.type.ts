import { Prisma } from '../../../generated/prisma/client.js';

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true;
  };
}>;
