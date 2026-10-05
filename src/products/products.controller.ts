import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Patch,
  Delete,
  ParseUUIDPipe,
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
import { ProductFilterDto } from './dto/filter-product.dto.js';
import { PaginatedProducts } from './types/paginated-products.type.js';
import { ReorderProductImagesDto } from './dto/reorder-product-image.dto.js';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto.js';
import { ProductResponseDto } from './dto/product-response.dto.js';
import { ProductImageResponseDto } from './dto/product-image-response.dto.js';

@ApiTags('Products')
@ApiTooManyRequestsResponse({ description: 'Превышен лимит запросов' })
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Получение списка товаров' })
  @ApiOkResponse({
    description: 'Список товаров',
    type: PaginatedProductsResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные фильтры' })
  @Get()
  findAll(@Query() filters: ProductFilterDto): Promise<PaginatedProducts> {
    return this.productsService.findAll(filters);
  }

  @ApiOperation({ summary: 'Получение товара по id' })
  @ApiOkResponse({ description: 'Товар найден', type: ProductResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректный id товара' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @Get(':productId')
  findOne(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductWithDetails> {
    return this.productsService.findOne(productId);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Создание товара' })
  @ApiCreatedResponse({ description: 'Товар создан', type: ProductResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @ApiConflictResponse({
    description: 'Название, размер или артикул уже используются',
  })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Post()
  create(@Body() body: CreateProductDto): Promise<ProductWithDetails> {
    return this.productsService.create(body);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление товара' })
  @ApiOkResponse({ description: 'Товар обновлён', type: ProductResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные id или данные' })
  @ApiNotFoundResponse({ description: 'Товар или категория не найдены' })
  @ApiConflictResponse({ description: 'Товар с такими данными уже существует' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Patch(':productId')
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: UpdateProductDto,
  ): Promise<ProductWithDetails> {
    return this.productsService.update(productId, body);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Удаление товара' })
  @ApiOkResponse({ description: 'Товар удалён', type: ProductResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректный id товара' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Delete(':productId')
  delete(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductWithDetails> {
    return this.productsService.delete(productId);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Добавление изображения товара' })
  @ApiCreatedResponse({
    description: 'Изображение добавлено',
    type: ProductImageResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные id или данные' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @ApiConflictResponse({ description: 'Позиция изображения уже занята' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Post(':productId/images')
  addImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: CreateProductImageDto,
  ): Promise<ProductImage> {
    return this.productsService.addImage(productId, body);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Изменение порядка изображений' })
  @ApiOkResponse({
    description: 'Порядок изображений изменён',
    type: [ProductImageResponseDto],
  })
  @ApiBadRequestResponse({ description: 'Некорректный список изображений' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Patch(':productId/images/reorder')
  reorderImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: ReorderProductImagesDto,
  ): Promise<ProductImage[]> {
    return this.productsService.reorderImage(productId, body);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление изображения товара' })
  @ApiOkResponse({
    description: 'Изображение обновлено',
    type: ProductImageResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные id или данные' })
  @ApiNotFoundResponse({ description: 'Товар или изображение не найдены' })
  @ApiConflictResponse({ description: 'Позиция изображения уже занята' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Patch(':productId/images/:imageId')
  updateImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() body: UpdateProductImageDto,
  ): Promise<ProductImage> {
    return this.productsService.updateImage(productId, imageId, body);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Удаление изображения товара' })
  @ApiOkResponse({
    description: 'Изображение удалено',
    type: ProductImageResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные id' })
  @ApiNotFoundResponse({ description: 'Товар или изображение не найдены' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Delete(':productId/images/:imageId')
  deleteImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<ProductImage> {
    return this.productsService.deleteImage(productId, imageId);
  }
}
