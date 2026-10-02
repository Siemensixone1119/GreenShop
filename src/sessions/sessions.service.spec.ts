import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { SessionsRepository } from './sessions.repository.js';
import { createSessionFixture } from './testing/session.fixture.js';

describe('SessionsService', () => {
  let service: SessionsService;
  let repository: {
    create: jest.MockedFunction<SessionsRepository['create']>;
    findById: jest.MockedFunction<SessionsRepository['findById']>;
    revokeById: jest.MockedFunction<SessionsRepository['revokeById']>;
    revokeAllByUserId: jest.MockedFunction<
      SessionsRepository['revokeAllByUserId']
    >;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      revokeById: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: SessionsRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(SessionsService);
  });

  it.each([
    [
      {
        userId: '',
        refreshHash: 'hash',
        expiresAt: new Date('2099-01-01'),
      },
      'id пользователя не передан',
    ],
    [
      {
        userId: '00000000-0000-4000-8000-000000000001',
        refreshHash: ' ',
        expiresAt: new Date('2099-01-01'),
      },
      'refreshHash не передан',
    ],
    [
      {
        userId: '00000000-0000-4000-8000-000000000001',
        refreshHash: 'hash',
        expiresAt: undefined as unknown as Date,
      },
      'expires_at пользователя не передан',
    ],
    [
      {
        userId: '00000000-0000-4000-8000-000000000001',
        refreshHash: 'hash',
        expiresAt: new Date('2020-01-01'),
      },
      'Некорректный expires_at',
    ],
  ])('проверяет данные новой сессии', (data, message) => {
    expect(() => service.createSession(data)).toThrow(message);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('обрезает hash и создаёт сессию', async () => {
    const session = createSessionFixture();
    const data = {
      userId: '00000000-0000-4000-8000-000000000001',
      refreshHash: ' hash ',
      expiresAt: session.expiresAt,
    };
    repository.create.mockResolvedValue(session);
    await expect(service.createSession(data)).resolves.toEqual(session);
    expect(repository.create).toHaveBeenCalledWith({
      ...data,
      refreshHash: 'hash',
    });
  });

  it('выбрасывает ошибку, если ID сессии некорректен', () => {
    expect(() => service.findById('')).toThrow(BadRequestException);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('возвращает результат поиска сессии', async () => {
    const session = createSessionFixture();
    repository.findById.mockResolvedValue(session);
    await expect(
      service.findById('00000000-0000-4000-8000-000000000001'),
    ).resolves.toEqual(session);
  });

  it.each([
    null,
    createSessionFixture({ revokedAt: new Date() }),
    createSessionFixture({ expiresAt: new Date('2020-01-01') }),
  ])(
    'возвращает null для отсутствующей или неактивной сессии',
    async (session) => {
      repository.findById.mockResolvedValue(session);
      await expect(
        service.findActiveById('00000000-0000-4000-8000-000000000001'),
      ).resolves.toBeNull();
    },
  );

  it('возвращает активную сессию', async () => {
    const session = createSessionFixture();
    repository.findById.mockResolvedValue(session);
    await expect(
      service.findActiveById('00000000-0000-4000-8000-000000000001'),
    ).resolves.toEqual(session);
  });

  it('отзывает сессию по id', async () => {
    const session = createSessionFixture({ revokedAt: new Date() });
    repository.revokeById.mockResolvedValue(session);
    await expect(
      service.revokeById('00000000-0000-4000-8000-000000000001'),
    ).resolves.toEqual(session);
    expect(repository.revokeById).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000001',
    );
  });

  it('отзывает все сессии пользователя', async () => {
    repository.revokeAllByUserId.mockResolvedValue({ count: 2 });
    await expect(
      service.revokeAllByUserId('00000000-0000-4000-8000-000000000001'),
    ).resolves.toEqual({ count: 2 });
    expect(repository.revokeAllByUserId).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000001',
    );
  });
});
