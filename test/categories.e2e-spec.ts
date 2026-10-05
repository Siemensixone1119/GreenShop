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
import {
  createCategoryFixture,
  createCategoryRequestData,
  createUpdateCategoryRequestData,
} from './fixtures/category.fixture.js';
import { createProductFixture } from './fixtures/product.fixture.js';

type CategoryBody = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};
type ErrorBody = { message: string };

describe('Categories (e2e)', () => {
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

  it('возвращает список категорий', async () => {
    const category = await createCategoryFixture(prisma);
    const response = await request(httpServer).get('/api/categories');
    const body = response.body as CategoryBody[];
    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      id: category.id,
      name: category.name,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('возвращает категорию по ID', async () => {
    const category = await createCategoryFixture(prisma);
    const response = await request(httpServer).get(
      `/api/categories/${category.id}`,
    );
    const body = response.body as CategoryBody;
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ id: category.id, name: category.name });
  });

  it('позволяет администратору создать категорию', async () => {
    const agent = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const user = await prisma.user.findFirstOrThrow();
    await prisma.user.update({
      where: { id: user.id },
      data: { role: Role.ADMIN },
    });
    await agent.post('/api/auth/refresh').expect(200);
    const requestData = createCategoryRequestData({ name: 'Новая категория' });
    const response = await agent.post('/api/categories').send(requestData);
    const body = response.body as CategoryBody;
    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      id: expect.any(String),
      name: requestData.name,
    });
  });

  it('позволяет администратору обновить категорию', async () => {
    const category = await createCategoryFixture(prisma);
    const agent = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const user = await prisma.user.findFirstOrThrow();
    await prisma.user.update({
      where: { id: user.id },
      data: { role: Role.ADMIN },
    });
    await agent.post('/api/auth/refresh').expect(200);
    const requestData = createUpdateCategoryRequestData({
      name: 'Изменённая категория',
    });
    const response = await agent
      .patch(`/api/categories/${category.id}`)
      .send(requestData);
    const body = response.body as CategoryBody;
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ id: category.id, name: requestData.name });
  });

  it('не удаляет категорию с товарами', async () => {
    const category = await createCategoryFixture(prisma);
    await createProductFixture(prisma, category.id);
    const agent = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const user = await prisma.user.findFirstOrThrow();
    await prisma.user.update({
      where: { id: user.id },
      data: { role: Role.ADMIN },
    });
    await agent.post('/api/auth/refresh').expect(200);
    const response = await agent.delete(`/api/categories/${category.id}`);
    const body = response.body as ErrorBody;
    expect(response.status).toBe(400);
    expect(body.message).toBe(
      'Нельзя удалить категорию, в которой есть товары',
    );
  });

  it('позволяет администратору удалить пустую категорию', async () => {
    const category = await createCategoryFixture(prisma);
    const agent = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const user = await prisma.user.findFirstOrThrow();
    await prisma.user.update({
      where: { id: user.id },
      data: { role: Role.ADMIN },
    });
    await agent.post('/api/auth/refresh').expect(200);
    const response = await agent.delete(`/api/categories/${category.id}`);
    const body = response.body as CategoryBody;
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ id: category.id, name: category.name });
    await expect(
      prisma.category.findUnique({ where: { id: category.id } }),
    ).resolves.toBeNull();
  });

  afterAll(async () => {
    await clearDataDB(prisma);
    await prisma.$disconnect();
    await app.close();
  });
});
