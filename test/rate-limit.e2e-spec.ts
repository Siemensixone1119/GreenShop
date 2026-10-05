import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { setupApp } from '../src/setup-app.js';
import { createLoginRequestData } from './fixtures/login-data.fixture.js';
import { clearDataDB } from './helpers/clear-data.js';

type ErrorResponseBody = {
  statusCode: number;
  message: string;
};

describe('Rate limit (e2e)', () => {
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
    await clearDataDB(prisma);
  });

  it('ограничивает количество попыток входа', async () => {
    const loginRequestData = createLoginRequestData({
      email: 'missing@greenshop.test',
    });

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await request(httpServer)
        .post('/api/auth/login')
        .send(loginRequestData)
        .expect(401);
    }

    const response = await request(httpServer)
      .post('/api/auth/login')
      .send(loginRequestData);
    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(429);
    expect(body.statusCode).toBe(429);
    expect(body.message).toContain('Too Many Requests');
  });

  afterAll(async () => {
    await clearDataDB(prisma);
    await prisma.$disconnect();
    await app.close();
  });
});
