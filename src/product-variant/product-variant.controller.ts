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
import { ProductVariantResponseDto } from './dto/product-variant-response.dto.js';

@ApiTags('Product variants')
@ApiTooManyRequestsResponse({ description: 'Превышен лимит запросов' })
@Controller('products/:productId/variants')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  @ApiOperation({ summary: 'Получение вариантов товара' })
  @ApiOkResponse({
    description: 'Список вариантов товара',
    type: [ProductVariantResponseDto],
  })
  @ApiBadRequestResponse({ description: 'Некорректный id товара' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @Get()
  findAll(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductVariant[]> {
    return this.productVariantService.findAll(productId);
  }

  @ApiOperation({ summary: 'Получение варианта товара по id' })
  @ApiOkResponse({
    description: 'Вариант товара найден',
    type: ProductVariantResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректный id' })
  @ApiNotFoundResponse({ description: 'Вариант товара не найден' })
  @Get(':variantId')
  findOne(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<ProductVariant> {
    return this.productVariantService.findOne(productId, variantId);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Создание варианта товара' })
  @ApiCreatedResponse({
    description: 'Вариант товара создан',
    type: ProductVariantResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные id или данные' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @ApiConflictResponse({ description: 'Размер или артикул уже используются' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Post()
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() data: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    return this.productVariantService.create(productId, data);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление варианта товара' })
  @ApiOkResponse({
    description: 'Вариант товара обновлён',
    type: ProductVariantResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные id или данные' })
  @ApiNotFoundResponse({ description: 'Вариант товара не найден' })
  @ApiConflictResponse({ description: 'Размер или артикул уже используются' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Patch(':variantId')
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() data: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    return this.productVariantService.update(productId, variantId, data);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Удаление варианта товара' })
  @ApiOkResponse({
    description: 'Вариант товара удалён',
    type: ProductVariantResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные id' })
  @ApiNotFoundResponse({ description: 'Вариант товара не найден' })
  @ApiConflictResponse({ description: 'Нельзя удалить последний вариант' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Delete(':variantId')
  delete(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<ProductVariant> {
    return this.productVariantService.delete(productId, variantId);
  }
}
