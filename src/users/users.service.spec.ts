import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';
import {
  createAuthUserFixture,
  createPublicUserFixture,
} from './testing/user.fixtures.js';

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    findAll: jest.MockedFunction<UsersRepository['findAll']>;
    findByEmail: jest.MockedFunction<UsersRepository['findByEmail']>;
    findAuthByEmail: jest.MockedFunction<UsersRepository['findAuthByEmail']>;
    findById: jest.MockedFunction<UsersRepository['findById']>;
    create: jest.MockedFunction<UsersRepository['create']>;
    update: jest.MockedFunction<UsersRepository['update']>;
    delete: jest.MockedFunction<UsersRepository['delete']>;
  };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('возвращает всех пользователей', async () => {
    const users = [createPublicUserFixture()];
    repository.findAll.mockResolvedValue(users);
    await expect(service.findAll()).resolves.toEqual(users);
  });

  it.each(['', '   '])('не ищет пользователя по пустому email', (email) => {
    expect(() => service.findByEmail(email)).toThrow(BadRequestException);
    expect(repository.findByEmail).not.toHaveBeenCalled();
  });

  it('передаёт email в публичный поиск', async () => {
    const user = createPublicUserFixture();
    repository.findByEmail.mockResolvedValue(user);
    await expect(service.findByEmail(user.email)).resolves.toEqual(user);
    expect(repository.findByEmail).toHaveBeenCalledWith(user.email);
  });

  it('передаёт email в поиск с данными авторизации', async () => {
    const user = createAuthUserFixture();
    repository.findAuthByEmail.mockResolvedValue(user);
    await expect(service.findAuthByEmail(user.email)).resolves.toEqual(user);
    expect(repository.findAuthByEmail).toHaveBeenCalledWith(user.email);
  });

  it('выбрасывает ошибку, если ID пользователя некорректен', async () => {
    await expect(service.findById('')).rejects.toThrow(BadRequestException);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('выбрасывает ошибку, если пользователь не найден', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(
      service.findById('00000000-0000-4000-8000-000000000001'),
    ).rejects.toThrow(NotFoundException);
  });

  it('возвращает пользователя по id', async () => {
    const user = createPublicUserFixture();
    repository.findById.mockResolvedValue(user);
    await expect(
      service.findById('00000000-0000-4000-8000-000000000001'),
    ).resolves.toEqual(user);
    expect(repository.findById).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000001',
    );
  });

  it.each([
    [{ email: ' ', passwordHash: 'hash', name: 'Иван' }, 'Email не передан'],
    [
      { email: 'a@b.ru', passwordHash: ' ', name: 'Иван' },
      'Хеш пароля не передан',
    ],
    [{ email: 'a@b.ru', passwordHash: 'hash', name: ' ' }, 'Имя не передано'],
  ])('проверяет обязательные данные создания', async (data, message) => {
    await expect(service.create(data)).rejects.toThrow(message);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('не создаёт пользователя с занятым email', async () => {
    repository.findByEmail.mockResolvedValue(createPublicUserFixture());
    await expect(
      service.create({
        email: 'user@test.ru',
        passwordHash: 'hash',
        name: 'Иван',
      }),
    ).rejects.toThrow(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('обрезает строки и создаёт пользователя', async () => {
    const user = createPublicUserFixture();
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(user);
    await expect(
      service.create({
        email: ' user@test.ru ',
        passwordHash: ' hash ',
        name: ' Иван ',
      }),
    ).resolves.toEqual(user);
    expect(repository.create).toHaveBeenCalledWith({
      email: 'user@test.ru',
      passwordHash: 'hash',
      name: 'Иван',
    });
  });

  it('не обновляет отсутствующего пользователя', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(
      service.update('00000000-0000-4000-8000-000000000001', { name: 'Иван' }),
    ).rejects.toThrow(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('не устанавливает email другого пользователя', async () => {
    repository.findById.mockResolvedValue(createPublicUserFixture());
    repository.findByEmail.mockResolvedValue(
      createPublicUserFixture({ id: '00000000-0000-4000-8000-000000000002' }),
    );
    await expect(
      service.update('00000000-0000-4000-8000-000000000001', {
        email: 'used@test.ru',
      }),
    ).rejects.toThrow(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('разрешает сохранить собственный email и обрезает данные', async () => {
    const user = createPublicUserFixture();
    const updated = createPublicUserFixture({ name: 'Новое имя' });
    repository.findById.mockResolvedValue(user);
    repository.findByEmail.mockResolvedValue(user);
    repository.update.mockResolvedValue(updated);
    await expect(
      service.update('00000000-0000-4000-8000-000000000001', {
        email: ` ${user.email} `,
        name: ' Новое имя ',
      }),
    ).resolves.toEqual(updated);
    expect(repository.update).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000001',
      {
        email: user.email,
        name: 'Новое имя',
      },
    );
  });

  it('возвращает удалённого пользователя', async () => {
    const user = createPublicUserFixture();
    repository.findById.mockResolvedValue(user);
    repository.delete.mockResolvedValue(user);
    await expect(
      service.delete('00000000-0000-4000-8000-000000000001'),
    ).resolves.toEqual(user);
    expect(repository.delete).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000001',
    );
  });
});
