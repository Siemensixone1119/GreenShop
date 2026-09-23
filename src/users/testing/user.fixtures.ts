import { Role } from '../../../generated/prisma/enums.js';
import type { AuthUser } from '../types/auth-user-data.type.js';
import type { PublicUser } from '../types/public-user.type.js';

const testDate = new Date('2026-01-01T00:00:00.000Z');

export function createPublicUserFixture(
  overrides: Partial<PublicUser> = {},
): PublicUser {
  return {
    id: 1,
    email: 'user@greenshop.test',
    name: 'Тестовый пользователь',
    role: Role.USER,
    createdAt: testDate,
    updatedAt: testDate,
    ...overrides,
  };
}

export function createAuthUserFixture(
  overrides: Partial<AuthUser> = {},
): AuthUser {
  return {
    ...createPublicUserFixture(overrides),
    passwordHash: 'password-hash',
    ...overrides,
  };
}
