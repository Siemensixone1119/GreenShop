import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { ProductWithDetails } from './types/product-with-detail.type.js';
import { CreateProductImageDto } from './dto/create-product-image.dto.js';
import type { ProductImage } from '../../generated/prisma/client.js';
import { UpdateProductImageDto } from './dto/update-product-image.dto.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('search') search?: string): Promise<ProductWithDetails[]> {
    return this.productsService.findAll(search);
  }

  @Get(':productId')
  findOne(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductWithDetails> {
    return this.productsService.findOne(productId);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() body: CreateProductDto): Promise<ProductWithDetails> {
    return this.productsService.create(body);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':productId')
  update(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: UpdateProductDto,
  ): Promise<ProductWithDetails> {
    return this.productsService.update(productId, body);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':productId')
  delete(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductWithDetails> {
    return this.productsService.delete(productId);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':productId/images')
  addImage(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateProductImageDto,
  ): Promise<ProductImage> {
    return this.productsService.addImage(productId, body);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':productId/images/:imageId')
  updateImage(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() body: UpdateProductImageDto,
  ): Promise<ProductImage> {
    return this.productsService.updateImage(productId, imageId, body);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':productId/images/:imageId')
  deleteImage(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<ProductImage> {
    return this.productsService.deleteImage(productId, imageId);
  }
}
