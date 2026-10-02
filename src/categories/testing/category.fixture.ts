import { Category } from '../../../generated/prisma/client.js';

const testDate = new Date('2026-01-01T00:00:00.000Z');

export function createCategoryFixture(
  overrides: Partial<Category> = {},
): Category {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Растения',
    createdAt: testDate,
    updatedAt: testDate,
    ...overrides,
  };
}
