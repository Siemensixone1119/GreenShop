import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { ProductVariant } from '../../generated/prisma/client.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';
import { ProductVariantService } from './product-variant.service.js';

@Controller('products/:productId/variants')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  @Get()
  findAll(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductVariant[]> {
    return this.productVariantService.findAll(productId);
  }

  @Get(':variantId')
  findOne(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<ProductVariant> {
    return this.productVariantService.findOne(productId, variantId);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() data: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    return this.productVariantService.create(productId, data);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':variantId')
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() data: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    return this.productVariantService.update(productId, variantId, data);
  }

  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':variantId')
  delete(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<ProductVariant> {
    return this.productVariantService.delete(productId, variantId);
  }
}
