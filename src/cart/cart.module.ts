import { Module } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { CartController } from './cart.controller.js';
import { CartItemRepository } from './cart-item.repository.js';
import { CartRepository } from './cart.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProductVariantModule } from '../product-variant/product-variant.module.js';

@Module({
  providers: [CartService, CartItemRepository, CartRepository],
  controllers: [CartController],
  imports: [PrismaModule, ProductVariantModule],
  exports: [CartService],
})
export class CartModule {}
