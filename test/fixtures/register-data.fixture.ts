import type { RegisterUserDto } from '../../src/auth/dto/register.dto.js';

export function createRegisterRequestData(
  overrides: Partial<RegisterUserDto> = {},
): RegisterUserDto {
  return {
    email: 'alexandra@greenshop.test',
    password: 'GreenShop123!',
    passwordRepeat: 'GreenShop123!',
    name: 'Александра',
    ...overrides,
  };
}
