import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { CategoriesRepository } from './categories.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, PrismaService]
})
export class CategoriesModule {}
