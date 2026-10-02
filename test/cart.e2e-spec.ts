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
import { clearDataDB } from './helpers/clear-data.js';
import { createRegisterRequestData } from './fixtures/register-data.fixture.js';
import {
  createAddCartItemRequestData,
  createCartFixture,
  createCartItemFixture,
  createUpdateCartItemRequestData,
} from './fixtures/cart.fixture.js';
import {
  createProductFixture,
  createProductVariantFixture,
} from './fixtures/product.fixture.js';
import { createCategoryFixture } from './fixtures/category.fixture.js';

type RegistrationResponseBody = {
  user: {
    id: string;
  };
};

type CartResponseBody = {
  userId: string;
  items: Array<{
    id: string;
    productVariantId: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

type CartItemResponseBody = {
  id: string;
  cartId: string;
  productVariantId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

type ErrorResponseBody = {
  message: string;
};

describe('Cart (e2e)', () => {
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

  it('возвращает корзину авторизованного пользователя', async () => {
    const registerRequestData = createRegisterRequestData();

    const agent = request.agent(httpServer);
    const registrationResponse = await agent
      .post('/api/auth/register')
      .send(registerRequestData)
      .expect(201);
    const response = await agent.get('/api/cart');
    const registrationBody =
      registrationResponse.body as RegistrationResponseBody;
    const body = response.body as CartResponseBody;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      userId: registrationBody.user.id,
      items: [],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('не возвращает корзину без авторизации', async () => {
    const response = await request(httpServer).get('/api/cart');
    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(401);
    expect(body.message).toBe('Unauthorized');
  });

  it('добавляет вариант товара в корзину', async () => {
    const registerRequestData = createRegisterRequestData();

    const agent = request.agent(httpServer);
    await agent
      .post('/api/auth/register')
      .send(registerRequestData)
      .expect(201);
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    const productVariant = await createProductVariantFixture(
      prisma,
      product.id,
    );
    const addCartItemRequestData = createAddCartItemRequestData(
      productVariant.id,
    );
    await agent
      .post('/api/cart/items')
      .send(addCartItemRequestData)
      .expect(201);
    const cartResponse = await agent.get('/api/cart');
    const body = cartResponse.body as CartResponseBody;

    expect(cartResponse.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: expect.any(String),
      productVariantId: productVariant.id,
      quantity: addCartItemRequestData.quantity,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('увеличивает количество существующей позиции', async () => {
    const registerRequestData = createRegisterRequestData();
    const cartItemUpdateRequestData = createUpdateCartItemRequestData();

    const agent = request.agent(httpServer);
    const user = await agent
      .post('/api/auth/register')
      .send(registerRequestData)
      .expect(201);
    const category = await createCategoryFixture(prisma);
    const product = await createProductFixture(prisma, category.id);
    const productVariant = await createProductVariantFixture(
      prisma,
      product.id,
    );
    const userBody = user.body as RegistrationResponseBody;
    const cart = await createCartFixture(prisma, userBody.user.id);
    const cartItem = await createCartItemFixture(
      prisma,
      cart.id,
      productVariant.id,
    );
    const response = await agent
      .patch(`/api/cart/items/${productVariant.id}`)
      .send(cartItemUpdateRequestData);
    const body = response.body as CartItemResponseBody;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: cartItem.id,
      cartId: cart.id,
      productVariantId: productVariant.id,
      quantity: cartItemUpdateRequestData.quantity,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it.todo('не добавляет количество больше остатка');
  it.todo('устанавливает новое количество позиции');
  it.todo('удаляет позицию из корзины');

  afterAll(async () => {
    await clearDataDB(prisma);
    await app.close();
  });
});
