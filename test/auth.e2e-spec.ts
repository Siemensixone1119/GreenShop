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
import { createRegisterData } from './fixtures/register-data.fixture.js';
import { createLoginData } from './fixtures/login-data.fixture.js';

type AuthResponseBody = {
  user: {
    id: number;
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
    await prisma.session.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
  });

  it('регистрирует пользователя', async () => {
    const dataRegister = createRegisterData();

    const response = await request(httpServer)
      .post('/api/auth/register')
      .send(dataRegister);
    const cookies = response.headers['set-cookie'];

    const body = response.body as AuthResponseBody;

    expect(response.status).toBe(201);
    expect(body.user).toMatchObject({
      email: dataRegister.email,
      name: dataRegister.name,
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
    const dataRegister = createRegisterData();

    const response = await request(httpServer)
      .post('/api/auth/register')
      .send(dataRegister);

    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(400);
    expect(body.message).toContain('email must be an email');
  });

  it('не регистрирует пользователя с занятым email', async () => {
    const dataRegister = createRegisterData();

    await request(httpServer)
      .post('/api/auth/register')
      .send(dataRegister)
      .expect(201);
    const response = await request(httpServer)
      .post('/api/auth/register')
      .send(dataRegister);

    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(409);
    expect(body.message).toBe('Пользователь с таким email уже существует');
  });

  it('авторизует пользователя', async () => {
    const dataRegister = createRegisterData();
    const dataLogin = createLoginData();

    await request(httpServer)
      .post('/api/auth/register')
      .send(dataRegister)
      .expect(201);
    const response = await request(httpServer)
      .post('/api/auth/login')
      .send(dataLogin);
    const cookies = response.headers['set-cookie'];

    const body = response.body as AuthResponseBody;

    expect(response.status).toBe(200);
    expect(body.user).toMatchObject({
      email: dataLogin.email,
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
    const dataRegister = createRegisterData();
    const dataLogin = createLoginData();

    await request(httpServer)
      .post('/api/auth/register')
      .send(dataRegister)
      .expect(201);
    const response = await request(httpServer)
      .post('/api/auth/login')
      .send(dataLogin);

    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(401);
    expect(body.message).toBe('Неверный email или пароль');
  });

  it('возвращает текущего пользователя', async () => {
    const dataRegister = createRegisterData();

    const agent = request.agent(httpServer);
    const registration = await agent
      .post('/api/auth/register')
      .send(dataRegister)
      .expect(201);
    const response = await agent.get('/api/auth/me');

    const body = response.body as AuthResponseBody;

    expect(response.status).toBe(200);
    expect(body.user).toMatchObject({
      id: registration.body.user.id,
      email: dataRegister.email,
      name: dataRegister.name,
      role: Role.USER,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('не возвращает текущего пользователя без авторизации', async () => {
    const response = await request(httpServer).get('/api/auth/me');

    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(401);
    expect(body.message).toBe('Unauthorized');
  });

  it('обновляет токены', async () => {
    const dataRegister = createRegisterData();

    const agent = request.agent(httpServer);
    await agent.post('/api/auth/register').send(dataRegister).expect(201);
    const response = await agent.post('/api/auth/refresh');
    const cookies = response.headers['set-cookie'];

    const body = response.body as AuthResponseBody;

    expect(response.status).toBe(200);
    expect(body.user).toMatchObject({
      id: expect.any(Number),
      email: dataRegister.email,
      name: dataRegister.name,
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
    const dataRegister = createRegisterData();

    const agent = request.agent(httpServer);
    await agent.post('/api/auth/register').send(dataRegister).expect(201);
    const response = await agent.post('/api/auth/logout');
    await agent.get('/api/auth/me').expect(401);

    expect(response.status).toBe(204);
  });

  it('завершает все сессии пользователя', async () => {
    const dataRegister = createRegisterData();
    const dataLogin = createLoginData();

    const agent = request.agent(httpServer);
    const agent1 = request.agent(httpServer);
    await agent.post('/api/auth/register').send(dataRegister).expect(201);
    await agent1.post('/api/auth/login').send(dataLogin).expect(200);
    await agent.get('/api/auth/me').expect(200);
    await agent1.get('/api/auth/me').expect(200);
    const response = await agent1.post('/api/auth/logout-all');
    await agent.get('/api/auth/me').expect(401);
    await agent1.get('/api/auth/me').expect(401);

    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
