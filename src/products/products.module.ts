import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { ProductsRepository } from './products.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProductVariantModule } from '../product-variant/product-variant.module.js';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
  imports: [PrismaModule, ProductVariantModule],
})
export class ProductsModule {}
