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
import { Role, Size } from '../generated/prisma/enums.js';
import { clearDataDB } from './helpers/clear-data.js';
import { createRegisterRequestData } from './fixtures/register-data.fixture.js';
import { createCategoryFixture } from './fixtures/category.fixture.js';
import {
  createProductFixture,
  createProductVariantFixture,
  createProductVariantRequestData,
  createUpdateProductVariantRequestData,
} from './fixtures/product.fixture.js';

type VariantBody = {
  id: string;
  productId: string;
  size: Size;
  price: number;
  stock: number;
  sku: string;
};
type ErrorBody = { message: string };

describe('Product variants (e2e)', () => {
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

  it('возвращает варианты товара', async () => {
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    const variant = await createProductVariantFixture(prisma, product.id);
    const response = await request(httpServer).get(
      `/api/products/${product.id}/variants`,
    );
    const body = response.body as VariantBody[];
    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: variant.id, productId: product.id });
  });

  it('возвращает вариант товара по ID', async () => {
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    const variant = await createProductVariantFixture(prisma, product.id);
    const response = await request(httpServer).get(
      `/api/products/${product.id}/variants/${variant.id}`,
    );
    const body = response.body as VariantBody;
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: variant.id,
      productId: product.id,
      size: variant.size,
      price: variant.price,
    });
  });

  it('позволяет администратору создать вариант', async () => {
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    await createProductVariantFixture(prisma, product.id);
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
    const requestData = createProductVariantRequestData({ size: Size.LARGE });
    const response = await agent
      .post(`/api/products/${product.id}/variants`)
      .send(requestData);
    const body = response.body as VariantBody;
    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      productId: product.id,
      size: requestData.size,
      sku: requestData.sku,
    });
  });

  it('не создаёт повторяющийся размер или артикул', async () => {
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    const variant = await createProductVariantFixture(prisma, product.id);
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
    const duplicateSize = createProductVariantRequestData({
      size: variant.size,
    });
    const sizeResponse = await agent
      .post(`/api/products/${product.id}/variants`)
      .send(duplicateSize);
    const sizeBody = sizeResponse.body as ErrorBody;
    expect(sizeResponse.status).toBe(409);
    expect(sizeBody.message).toBe('Вариант такого размера уже существует');
    const duplicateSku = createProductVariantRequestData({
      size: Size.LARGE,
      sku: variant.sku,
    });
    const skuResponse = await agent
      .post(`/api/products/${product.id}/variants`)
      .send(duplicateSku);
    const skuBody = skuResponse.body as ErrorBody;
    expect(skuResponse.status).toBe(409);
    expect(skuBody.message).toBe('Вариант с таким артикулом уже существует');
  });

  it('позволяет администратору обновить вариант', async () => {
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    const variant = await createProductVariantFixture(prisma, product.id);
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
    const requestData = createUpdateProductVariantRequestData({
      price: 1500,
      stock: 7,
    });
    const response = await agent
      .patch(`/api/products/${product.id}/variants/${variant.id}`)
      .send(requestData);
    const body = response.body as VariantBody;
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: variant.id,
      price: requestData.price,
      stock: requestData.stock,
    });
  });

  it('не удаляет последний вариант товара', async () => {
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    const variant = await createProductVariantFixture(prisma, product.id);
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
    const response = await agent.delete(
      `/api/products/${product.id}/variants/${variant.id}`,
    );
    const body = response.body as ErrorBody;
    expect(response.status).toBe(409);
    expect(body.message).toBe('Нельзя удалить последний вариант товара');
  });

  it('позволяет администратору удалить вариант', async () => {
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    const variant = await createProductVariantFixture(prisma, product.id);
    await createProductVariantFixture(prisma, product.id, { size: Size.LARGE });
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
    const response = await agent.delete(
      `/api/products/${product.id}/variants/${variant.id}`,
    );
    const body = response.body as VariantBody;
    expect(response.status).toBe(200);
    expect(body.id).toBe(variant.id);
    await expect(
      prisma.productVariant.findUnique({ where: { id: variant.id } }),
    ).resolves.toBeNull();
  });

  afterAll(async () => {
    await clearDataDB(prisma);
    await prisma.$disconnect();
    await app.close();
  });
});
