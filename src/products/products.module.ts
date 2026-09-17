import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { ProductsRepository } from './products.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProductVariantModule } from '../product-variant/product-variant.module.js';
import { CategoriesModule } from '../categories/categories.module.js';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
  imports: [PrismaModule, ProductVariantModule, CategoriesModule],
})
export class ProductsModule {}
