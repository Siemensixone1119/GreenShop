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
import { ProductSort } from '../src/products/enums/product-sort.enum.js';
import { clearDataDB } from './helpers/clear-data.js';
import { createRegisterRequestData } from './fixtures/register-data.fixture.js';
import { createCategoryFixture } from './fixtures/category.fixture.js';
import {
  createProductFixture,
  createProductImageFixture,
  createProductRequestData,
  createProductVariantFixture,
  createUpdateProductRequestData,
} from './fixtures/product.fixture.js';

type ProductBody = {
  id: string;
  name: string;
  categoryId: string;
  category: { id: string };
  images: Array<{ id: string; url: string; position: number }>;
  variants: Array<{ id: string; size: Size; price: number; stock: number }>;
};
type ProductsBody = {
  items: ProductBody[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
type ErrorBody = { message: string };

describe('Products (e2e)', () => {
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

  it('возвращает каталог товаров', async () => {
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    await createProductImageFixture(prisma, product.id);
    await createProductVariantFixture(prisma, product.id);
    const response = await request(httpServer).get('/api/products');
    const body = response.body as ProductsBody;
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      total: 1,
      page: 1,
      limit: 9,
      totalPages: 1,
    });
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: product.id,
      categoryId: category.id,
      images: [
        expect.objectContaining({ url: '/images/products/monstera.jpg' }),
      ],
      variants: [expect.objectContaining({ stock: 10 })],
    });
  });

  it('фильтрует, сортирует и разбивает товары на страницы', async () => {
    const category = await createCategoryFixture(prisma);
    const first = await createProductFixture(prisma, category.id, {
      name: 'Алоэ',
    });
    const second = await createProductFixture(prisma, category.id, {
      name: 'Замиокулькас',
    });
    await createProductVariantFixture(prisma, first.id, { price: 500 });
    await createProductVariantFixture(prisma, second.id, { price: 1500 });
    const response = await request(httpServer)
      .get('/api/products')
      .query({ sort: ProductSort.PRICE_ASC, page: 1, limit: 1 });
    const body = response.body as ProductsBody;
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ total: 2, page: 1, limit: 1, totalPages: 2 });
    expect(body.items).toHaveLength(1);
    expect(body.items[0].id).toBe(first.id);
  });

  it('возвращает товар по ID', async () => {
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    const response = await request(httpServer).get(
      `/api/products/${product.id}`,
    );
    const body = response.body as ProductBody;
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: product.id,
      name: product.name,
      categoryId: category.id,
      category: { id: category.id },
    });
  });

  it('возвращает 404 для отсутствующего товара', async () => {
    const response = await request(httpServer).get(
      `/api/products/${crypto.randomUUID()}`,
    );
    const body = response.body as ErrorBody;
    expect(response.status).toBe(404);
    expect(body.message).toBe('Товар не найден');
  });

  it('позволяет администратору создать товар', async () => {
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
    const productRequestData = createProductRequestData(category.id);
    const response = await agent.post('/api/products').send(productRequestData);
    const body = response.body as ProductBody;
    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      name: productRequestData.name,
      categoryId: category.id,
    });
    expect(body.images).toHaveLength(1);
    expect(body.variants).toHaveLength(1);
  });

  it('запрещает обычному пользователю создать товар', async () => {
    const category = await createCategoryFixture(prisma);
    const agent = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const response = await agent
      .post('/api/products')
      .send(createProductRequestData(category.id));
    const body = response.body as ErrorBody;
    expect(response.status).toBe(403);
    expect(body.message).toBe('Forbidden resource');
  });

  it('позволяет администратору обновить товар', async () => {
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
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
    const updateRequestData = createUpdateProductRequestData();
    const response = await agent
      .patch(`/api/products/${product.id}`)
      .send(updateRequestData);
    const body = response.body as ProductBody;
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: product.id,
      name: updateRequestData.name,
    });
  });

  it('позволяет администратору удалить товар', async () => {
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    await createProductImageFixture(prisma, product.id);
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
    const response = await agent.delete(`/api/products/${product.id}`);
    const body = response.body as ProductBody;
    expect(response.status).toBe(200);
    expect(body.id).toBe(product.id);
    await expect(
      prisma.product.findUnique({ where: { id: product.id } }),
    ).resolves.toBeNull();
  });

  afterAll(async () => {
    await clearDataDB(prisma);
    await prisma.$disconnect();
    await app.close();
  });
});
