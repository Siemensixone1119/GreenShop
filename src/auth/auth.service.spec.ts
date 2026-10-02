import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import {
  createAuthUserFixture,
  createPublicUserFixture,
} from '../users/testing/user.fixtures.js';
import { createSessionFixture } from '../sessions/testing/session.fixture.js';

describe('AuthService', () => {
  let service: AuthService;
  let users: {
    create: jest.MockedFunction<UsersService['create']>;
    findAuthByEmail: jest.MockedFunction<UsersService['findAuthByEmail']>;
    findById: jest.MockedFunction<UsersService['findById']>;
  };
  let sessions: {
    createSession: jest.MockedFunction<SessionsService['createSession']>;
    findActiveById: jest.MockedFunction<SessionsService['findActiveById']>;
    revokeById: jest.MockedFunction<SessionsService['revokeById']>;
    revokeAllByUserId: jest.MockedFunction<
      SessionsService['revokeAllByUserId']
    >;
  };
  let signAsync: jest.MockedFunction<(payload: object) => Promise<string>>;

  beforeEach(async () => {
    users = {
      create: jest.fn(),
      findAuthByEmail: jest.fn(),
      findById: jest.fn(),
    };
    sessions = {
      createSession: jest.fn(),
      findActiveById: jest.fn(),
      revokeById: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };
    signAsync = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: SessionsService, useValue: sessions },
        { provide: JwtService, useValue: { signAsync } },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  function prepareIssuedTokens(): void {
    sessions.createSession.mockResolvedValue(createSessionFixture());
    signAsync.mockResolvedValue('access-token');
  }

  it('не регистрирует пользователя с несовпадающими паролями', async () => {
    await expect(
      service.register({
        email: 'user@test.ru',
        name: 'Иван',
        password: 'password1',
        passwordRepeat: 'password2',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(users.create).not.toHaveBeenCalled();
  });

  it('регистрирует пользователя и выдаёт токены', async () => {
    const user = createPublicUserFixture();
    users.create.mockResolvedValue(user);
    prepareIssuedTokens();
    const result = await service.register({
      email: user.email,
      name: user.name,
      password: 'password1',
      passwordRepeat: 'password1',
    });
    expect(result.user).toEqual(user);
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toHaveLength(128);
    expect(users.create).toHaveBeenCalledWith({
      email: user.email,
      name: user.name,
      passwordHash: expect.any(String),
    });
    expect(sessions.createSession).toHaveBeenCalledWith({
      userId: user.id,
      refreshHash: expect.any(String),
      expiresAt: expect.any(Date),
    });
  });

  it('не авторизует отсутствующего пользователя', async () => {
    users.findAuthByEmail.mockResolvedValue(null);
    await expect(
      service.login({ email: 'missing@test.ru', password: 'password1' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(sessions.createSession).not.toHaveBeenCalled();
  });

  it('не авторизует пользователя с неверным паролем', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    users.findAuthByEmail.mockResolvedValue(
      createAuthUserFixture({ passwordHash }),
    );
    await expect(
      service.login({ email: 'user@test.ru', password: 'wrong-password' }),
    ).rejects.toThrow('Неверный email или пароль');
  });

  it('авторизует пользователя без возврата passwordHash', async () => {
    const password = 'correct-password';
    const authUser = createAuthUserFixture({
      passwordHash: await bcrypt.hash(password, 4),
    });
    users.findAuthByEmail.mockResolvedValue(authUser);
    prepareIssuedTokens();
    const result = await service.login({ email: authUser.email, password });
    expect(result.user).toEqual(createPublicUserFixture());
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(signAsync).toHaveBeenCalledWith({
      sub: authUser.id,
      sessionId: '00000000-0000-4000-8000-000000000001',
      role: authUser.role,
    });
  });

  describe('refresh', () => {
    it.each([
      { cookies: {} },
      { cookies: { refreshToken: 'token' } },
      {
        cookies: {
          refreshToken: 'token',
          sessionId: '',
        },
      },
    ])('отклоняет запрос без корректных cookies', async (data) => {
      await expect(service.refresh(data)).rejects.toThrow('Не авторизован');
      expect(sessions.findActiveById).not.toHaveBeenCalled();
    });

    it('отклоняет отсутствующую сессию', async () => {
      sessions.findActiveById.mockResolvedValue(null);
      await expect(
        service.refresh({
          cookies: {
            refreshToken: 'token',
            sessionId: '00000000-0000-4000-8000-000000000001',
          },
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('отзывает сессию при неверном refresh token', async () => {
      sessions.findActiveById.mockResolvedValue(
        createSessionFixture({ refreshHash: await bcrypt.hash('correct', 4) }),
      );
      sessions.revokeById.mockResolvedValue(createSessionFixture());
      await expect(
        service.refresh({
          cookies: {
            refreshToken: 'wrong',
            sessionId: '00000000-0000-4000-8000-000000000001',
          },
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(sessions.revokeById).toHaveBeenCalledWith(
        '00000000-0000-4000-8000-000000000001',
      );
    });

    it('отзывает старую сессию и выдаёт новые токены', async () => {
      const refreshToken = 'correct';
      const user = createPublicUserFixture();
      sessions.findActiveById.mockResolvedValue(
        createSessionFixture({
          refreshHash: await bcrypt.hash(refreshToken, 4),
        }),
      );
      users.findById.mockResolvedValue(user);
      sessions.revokeById.mockResolvedValue(createSessionFixture());
      prepareIssuedTokens();
      const result = await service.refresh({
        cookies: {
          refreshToken,
          sessionId: '00000000-0000-4000-8000-000000000001',
        },
      });
      expect(result.user).toEqual(user);
      expect(sessions.revokeById).toHaveBeenCalledWith(
        '00000000-0000-4000-8000-000000000001',
      );
      expect(sessions.createSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('ничего не делает без refresh token', async () => {
      await service.logout({ cookies: {} });
      expect(sessions.findActiveById).not.toHaveBeenCalled();
    });

    it('не отзывает сессию при неверном токене', async () => {
      sessions.findActiveById.mockResolvedValue(
        createSessionFixture({ refreshHash: await bcrypt.hash('correct', 4) }),
      );
      await service.logout({
        cookies: {
          refreshToken: 'wrong',
          sessionId: '00000000-0000-4000-8000-000000000001',
        },
      });
      expect(sessions.revokeById).not.toHaveBeenCalled();
    });

    it('отзывает сессию при верном токене', async () => {
      const refreshToken = 'correct';
      sessions.findActiveById.mockResolvedValue(
        createSessionFixture({
          refreshHash: await bcrypt.hash(refreshToken, 4),
        }),
      );
      sessions.revokeById.mockResolvedValue(createSessionFixture());
      await service.logout({
        cookies: {
          refreshToken,
          sessionId: '00000000-0000-4000-8000-000000000001',
        },
      });
      expect(sessions.revokeById).toHaveBeenCalledWith(
        '00000000-0000-4000-8000-000000000001',
      );
    });
  });

  it('logoutAll отзывает все сессии пользователя при верном токене', async () => {
    const refreshToken = 'correct';
    const session = createSessionFixture({
      refreshHash: await bcrypt.hash(refreshToken, 4),
    });
    sessions.findActiveById.mockResolvedValue(session);
    sessions.revokeAllByUserId.mockResolvedValue({ count: 2 });
    await service.logoutAll({
      cookies: { refreshToken, sessionId: session.id },
    });
    expect(sessions.revokeAllByUserId).toHaveBeenCalledWith(session.userId);
  });
});
