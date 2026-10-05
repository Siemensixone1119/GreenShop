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
import { OrderStatus, Role } from '../generated/prisma/enums.js';
import { clearDataDB } from './helpers/clear-data.js';
import { createRegisterRequestData } from './fixtures/register-data.fixture.js';
import { createCategoryFixture } from './fixtures/category.fixture.js';
import {
  createProductFixture,
  createProductVariantFixture,
} from './fixtures/product.fixture.js';
import {
  createCartFixture,
  createCartItemFixture,
} from './fixtures/cart.fixture.js';
import {
  createOrderFixture,
  createOrderRequestData,
  createOrderItemFixture,
  createUpdateOrderStatusRequestData,
} from './fixtures/order.fixture.js';

type UserBody = { user: { id: string } };
type OrderBody = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalPrice: number;
  items?: Array<{
    productVariantId: string;
    quantity: number;
    productName: string;
    price: number;
  }>;
};
type ErrorBody = { message: string };

describe('Orders (e2e)', () => {
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

  it('создаёт заказ из корзины', async () => {
    const agent = request.agent(httpServer);
    const registration = await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const userBody = registration.body as UserBody;
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    const variant = await createProductVariantFixture(prisma, product.id, {
      price: 1000,
      stock: 5,
      discountPercent: 10,
    });
    const cart = await createCartFixture(prisma, userBody.user.id);
    await createCartItemFixture(prisma, cart.id, variant.id, { quantity: 2 });
    const requestData = createOrderRequestData();
    const response = await agent.post('/api/order').send(requestData);
    const body = response.body as OrderBody;
    const cartResponse = await agent.get('/api/cart');

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      userId: userBody.user.id,
      status: OrderStatus.NEW,
      totalPrice: 1800,
    });
    expect(cartResponse.body.items).toHaveLength(0);
    await expect(
      prisma.productVariant.findUnique({ where: { id: variant.id } }),
    ).resolves.toMatchObject({ stock: 3 });
    const orderResponse = await agent.get(`/api/order/my/${body.id}`);
    const orderBody = orderResponse.body as OrderBody;
    expect(orderBody.items).toHaveLength(1);
    expect(orderBody.items?.[0]).toMatchObject({
      productVariantId: variant.id,
      quantity: 2,
      price: 900,
    });
  });

  it('не создаёт заказ из пустой корзины', async () => {
    const agent = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const response = await agent
      .post('/api/order')
      .send(createOrderRequestData());
    const body = response.body as ErrorBody;
    expect(response.status).toBe(400);
    expect(body.message).toBe('Корзина пуста');
  });

  it('возвращает заказы текущего пользователя', async () => {
    const agent = request.agent(httpServer);
    const registration = await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const userBody = registration.body as UserBody;
    const order = await createOrderFixture(prisma, userBody.user.id);
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    const variant = await createProductVariantFixture(prisma, product.id);
    await createOrderItemFixture(prisma, order.id, variant.id);
    const response = await agent.get('/api/order/my');
    const body = response.body as OrderBody[];
    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      id: order.id,
      userId: userBody.user.id,
      items: [expect.objectContaining({ productVariantId: variant.id })],
    });
  });

  it('не позволяет получить чужой заказ', async () => {
    const agent = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(createRegisterRequestData())
      .expect(201);
    const anotherUser = await prisma.user.create({
      data: {
        email: `other-${crypto.randomUUID()}@greenshop.test`,
        name: 'Другой пользователь',
        passwordHash: 'hash',
      },
    });
    const order = await createOrderFixture(prisma, anotherUser.id);
    const response = await agent.get(`/api/order/my/${order.id}`);
    const body = response.body as ErrorBody;
    expect(response.status).toBe(404);
    expect(body.message).toBe('Заказ не найден');
  });

  it('позволяет администратору получить все заказы', async () => {
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
    const order = await createOrderFixture(prisma, user.id);
    const response = await agent.get('/api/order/all');
    const body = response.body as OrderBody[];
    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: order.id, userId: user.id });
  });

  it('позволяет администратору изменить статус заказа', async () => {
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
    const order = await createOrderFixture(prisma, user.id);
    const updateRequestData = createUpdateOrderStatusRequestData({
      status: OrderStatus.SHIPPED,
    });
    const response = await agent
      .patch(`/api/order/${order.id}/status`)
      .send(updateRequestData);
    const body = response.body as OrderBody;
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: order.id,
      status: updateRequestData.status,
    });
  });

  afterAll(async () => {
    await clearDataDB(prisma);
    await prisma.$disconnect();
    await app.close();
  });
});
