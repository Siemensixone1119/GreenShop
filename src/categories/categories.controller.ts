import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import type { Category } from '../../generated/prisma/client.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('search') search?: string): Promise<Category[]> {
    return this.categoriesService.findAll(search);
  }

  @Get(':categoryId')
  findOne(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<Category> {
    return this.categoriesService.findOne(categoryId);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() body: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(body);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':categoryId')
  update(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() body: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(categoryId, body);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':categoryId')
  delete(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<Category> {
    return this.categoriesService.delete(categoryId);
  }
}
