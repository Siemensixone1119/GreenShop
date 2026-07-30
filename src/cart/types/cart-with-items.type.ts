import { Prisma } from "../../../generated/prisma/client.js";

export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      }
    }
  };
}>;