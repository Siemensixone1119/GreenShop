import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import {
  ApiBadRequestResponse,
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
import { CategoryResponseDto } from './dto/category-response.dto.js';

@ApiTags('Categories')
@ApiTooManyRequestsResponse({ description: 'Превышен лимит запросов' })
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Получение списка категорий' })
  @ApiOkResponse({
    description: 'Список категорий',
    type: [CategoryResponseDto],
  })
  @Get()
  findAll(@Query('search') search?: string): Promise<Category[]> {
    return this.categoriesService.findAll(search);
  }

  @ApiOperation({ summary: 'Получение категории по id' })
  @ApiOkResponse({
    description: 'Категория найдена',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректный id категории' })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @Get(':categoryId')
  findOne(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<Category> {
    return this.categoriesService.findOne(categoryId);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Создание категории' })
  @ApiCreatedResponse({
    description: 'Категория создана',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Post()
  create(@Body() body: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(body);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление категории' })
  @ApiOkResponse({
    description: 'Категория обновлена',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Некорректные id или данные' })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Patch(':categoryId')
  update(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() body: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(categoryId, body);
  }

  @ApiCookieAuth('accessToken')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Удаление категории' })
  @ApiOkResponse({
    description: 'Категория удалена',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный id или категория содержит товары',
  })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @ApiUnauthorizedResponse({ description: 'Нет авторизации' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав' })
  @Delete(':categoryId')
  delete(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<Category> {
    return this.categoriesService.delete(categoryId);
  }
}
