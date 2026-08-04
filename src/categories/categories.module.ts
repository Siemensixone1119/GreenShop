import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { CategoriesRepository } from './categories.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  providers: [CategoriesService, CategoriesRepository],
  controllers: [CategoriesController],
  imports: [PrismaModule],
})
export class CategoriesModule {}
