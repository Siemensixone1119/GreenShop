import type { PrismaService } from '../../src/prisma/prisma.service.js';

export async function clearDataDB(prisma: PrismaService) {
  await prisma.session.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
}
