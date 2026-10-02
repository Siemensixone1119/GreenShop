import type { Category, Prisma } from '../../generated/prisma/client.js';
import type { CreateCategoryDto } from '../../src/categories/dto/create-category.dto.js';
import type { UpdateCategoryDto } from '../../src/categories/dto/update-category.dto.js';
import type { PrismaService } from '../../src/prisma/prisma.service.js';

export function createCategoryRequestData(
  overrides: Partial<CreateCategoryDto> = {},
): CreateCategoryDto {
  return {
    name: 'Комнатные растения',
    ...overrides,
  };
}

export function createUpdateCategoryRequestData(
  overrides: Partial<UpdateCategoryDto> = {},
): UpdateCategoryDto {
  return {
    name: 'Обновлённая категория',
    ...overrides,
  };
}

export function createCategoryFixture(
  prisma: PrismaService,
  overrides: Partial<Prisma.CategoryUncheckedCreateInput> = {},
): Promise<Category> {
  return prisma.category.create({
    data: {
      name: 'Комнатные растения',
      ...overrides,
    },
  });
}
