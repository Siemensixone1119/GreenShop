import { Module } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service.js';
import { ProductVariantsRepository } from './product-variant.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProductVariantController } from './product-variant.controller.js';

@Module({
  controllers: [ProductVariantController],
  providers: [ProductVariantService, ProductVariantsRepository],
  imports: [PrismaModule],
  exports: [ProductVariantService],
})
export class ProductVariantModule {}
