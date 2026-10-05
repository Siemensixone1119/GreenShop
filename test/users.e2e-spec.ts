import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/setup-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals';
import { Role } from '../generated/prisma/enums.js';
import { clearDataDB } from './helpers/clear-data.js';
import { createRegisterRequestData } from './fixtures/register-data.fixture.js';

type UserBody = {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};
type RegistrationBody = { user: { id: string } };
type ErrorBody = { message: string };

describe('Users (e2e)', () => {
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

  it('позволяет администратору получить список пользователей', async () => {
    const agent = request.agent(httpServer);
    const registration = await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const registrationBody = registration.body as RegistrationBody;
    await prisma.user.update({
      where: { id: registrationBody.user.id },
      data: { role: Role.ADMIN },
    });
    await agent.post('/api/auth/refresh').expect(200);
    const response = await agent.get('/api/users');
    const body = response.body as UserBody[];
    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      id: registrationBody.user.id,
      role: Role.ADMIN,
    });
    expect(body[0]).not.toHaveProperty('password');
    expect(body[0]).not.toHaveProperty('passwordHash');
  });

  it('позволяет администратору получить пользователя по ID', async () => {
    const agent = request.agent(httpServer);
    const registration = await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const registrationBody = registration.body as RegistrationBody;
    await prisma.user.update({
      where: { id: registrationBody.user.id },
      data: { role: Role.ADMIN },
    });
    await agent.post('/api/auth/refresh').expect(200);
    const response = await agent.get(`/api/users/${registrationBody.user.id}`);
    const body = response.body as UserBody;
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: registrationBody.user.id,
      role: Role.ADMIN,
      email: expect.any(String),
      name: expect.any(String),
    });
    expect(body).not.toHaveProperty('password');
    expect(body).not.toHaveProperty('passwordHash');
  });

  it('запрещает обычному пользователю просматривать пользователей', async () => {
    const agent = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const response = await agent.get('/api/users');
    const body = response.body as ErrorBody;
    expect(response.status).toBe(403);
    expect(body.message).toBe('Forbidden resource');
  });

  afterAll(async () => {
    await clearDataDB(prisma);
    await prisma.$disconnect();
    await app.close();
  });
});
