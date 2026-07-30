import { Module } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { CartController } from './cart.controller.js';
import { CartItemRepository } from './cart-item.repository.js';
import { CartRepository } from './cart.repository.js';
import { ProductsModule } from '../products/products.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  providers: [CartService, CartItemRepository, CartRepository],
  controllers: [CartController],
  imports: [ProductsModule, PrismaModule]
})
export class CartModule {}
