import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals';
import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/setup-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { Role } from '../generated/prisma/enums.js';
import { createRegisterRequestData } from './fixtures/register-data.fixture.js';
import { createLoginRequestData } from './fixtures/login-data.fixture.js';
import { clearDataDB } from './helpers/clear-data.js';

type AuthResponseBody = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
};

type ErrorResponseBody = {
  statusCode: number;
  message: string | string[];
  error: string;
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    httpServer = app.getHttpServer() as App;
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await clearDataDB(prisma);
  });

  it('регистрирует пользователя', async () => {
    const registerRequestData = createRegisterRequestData();

    const response = await request(httpServer)
      .post('/api/auth/register')
      .send(registerRequestData);
    const cookies = response.headers['set-cookie'];
    const body = response.body as AuthResponseBody;

    expect(response.status).toBe(201);
    expect(body.user).toMatchObject({
      email: registerRequestData.email,
      name: registerRequestData.name,
    });
    expect(body.user).not.toHaveProperty('password');
    expect(body.user).not.toHaveProperty('passwordHash');
    expect(cookies).toBeDefined();
    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.stringContaining('accessToken='),
        expect.stringContaining('refreshToken='),
        expect.stringContaining('sessionId='),
      ]),
    );
  });

  it('отклоняет некорректные данные регистрации', async () => {
    const registerRequestData = createRegisterRequestData({
      email: 'alexandragreenshop.test',
    });

    const response = await request(httpServer)
      .post('/api/auth/register')
      .send(registerRequestData);
    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(400);
    expect(body.message).toContain('email must be an email');
  });

  it('не регистрирует пользователя с занятым email', async () => {
    const registerRequestData = createRegisterRequestData();

    await request(httpServer)
      .post('/api/auth/register')
      .send(registerRequestData)
      .expect(201);
    const response = await request(httpServer)
      .post('/api/auth/register')
      .send(registerRequestData);
    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(409);
    expect(body.message).toBe('Пользователь с таким email уже существует');
  });

  it('авторизует пользователя', async () => {
    const registerRequestData = createRegisterRequestData();
    const loginRequestData = createLoginRequestData();

    await request(httpServer)
      .post('/api/auth/register')
      .send(registerRequestData)
      .expect(201);
    const response = await request(httpServer)
      .post('/api/auth/login')
      .send(loginRequestData);
    const cookies = response.headers['set-cookie'];
    const body = response.body as AuthResponseBody;

    expect(response.status).toBe(200);
    expect(body.user).toMatchObject({
      email: loginRequestData.email,
    });
    expect(body.user).not.toHaveProperty('password');
    expect(body.user).not.toHaveProperty('passwordHash');
    expect(cookies).toBeDefined();
    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.stringContaining('accessToken='),
        expect.stringContaining('refreshToken='),
        expect.stringContaining('sessionId='),
      ]),
    );
  });

  it('не авторизует пользователя с неверным паролем', async () => {
    const registerRequestData = createRegisterRequestData();
    const loginRequestData = createLoginRequestData({ password: '123!' });

    await request(httpServer)
      .post('/api/auth/register')
      .send(registerRequestData)
      .expect(201);
    const response = await request(httpServer)
      .post('/api/auth/login')
      .send(loginRequestData);
    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(401);
    expect(body.message).toBe('Неверный email или пароль');
  });

  it('возвращает текущего пользователя', async () => {
    const registerRequestData = createRegisterRequestData();

    const agent = request.agent(httpServer);
    const registration = await agent
      .post('/api/auth/register')
      .send(registerRequestData)
      .expect(201);
    const response = await agent.get('/api/auth/me');
    const body = response.body as AuthResponseBody;
    const registrationBody = registration.body as AuthResponseBody;

    expect(response.status).toBe(200);
    expect(body.user).toMatchObject({
      id: registrationBody.user.id,
      email: registerRequestData.email,
      name: registerRequestData.name,
      role: Role.USER,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(body.user).not.toHaveProperty('password');
    expect(body.user).not.toHaveProperty('passwordHash');
  });

  it('не возвращает текущего пользователя без авторизации', async () => {
    const response = await request(httpServer).get('/api/auth/me');
    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(401);
    expect(body.message).toBe('Unauthorized');
  });

  it('обновляет токены', async () => {
    const registerRequestData = createRegisterRequestData();

    const agent = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(registerRequestData)
      .expect(201);
    const response = await agent.post('/api/auth/refresh');
    const cookies = response.headers['set-cookie'];
    const body = response.body as AuthResponseBody;

    expect(response.status).toBe(200);
    expect(body.user).toMatchObject({
      id: expect.any(String),
      email: registerRequestData.email,
      name: registerRequestData.name,
      role: Role.USER,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(body.user).not.toHaveProperty('password');
    expect(body.user).not.toHaveProperty('passwordHash');
    expect(cookies).toBeDefined();
    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.stringContaining('accessToken='),
        expect.stringContaining('refreshToken='),
        expect.stringContaining('sessionId='),
      ]),
    );
  });

  it('завершает текущую сессию', async () => {
    const registerRequestData = createRegisterRequestData();

    const agent = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(registerRequestData)
      .expect(201);
    const response = await agent.post('/api/auth/logout');
    await agent.get('/api/auth/me').expect(401);

    expect(response.status).toBe(204);
  });

  it('завершает все сессии пользователя', async () => {
    const registerRequestData = createRegisterRequestData();
    const loginRequestData = createLoginRequestData();

    const agent = request.agent(httpServer);
    const agent1 = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(registerRequestData)
      .expect(201);
    await agent1.post('/api/auth/login').send(loginRequestData).expect(200);
    await agent.get('/api/auth/me').expect(200);
    await agent1.get('/api/auth/me').expect(200);
    const response = await agent1.post('/api/auth/logout-all');
    await agent.get('/api/auth/me').expect(401);
    await agent1.get('/api/auth/me').expect(401);

    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    await clearDataDB(prisma);
    await app.close();
  });
});
