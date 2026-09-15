import { Category } from '../../../generated/prisma/client.js';

const testDate = new Date('2026-01-01T00:00:00.000Z');

export function createCategoryFixtures(
  overrides: Partial<Category> = {},
): Category {
  return {
    id: 1,
    name: 'Растения',
    createdAt: testDate,
    updatedAt: testDate,
    ...overrides,
  };
}
