import type { LoginUserDto } from '../../src/auth/dto/login.dto.js';

export function createLoginRequestData(
  overrides: Partial<LoginUserDto> = {},
): LoginUserDto {
  return {
    email: 'alexandra@greenshop.test',
    password: 'GreenShop123!',
    ...overrides,
  };
}
