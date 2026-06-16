import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let firstRefreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns access and refresh token on valid login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'admin@demo.local', password: 'password' });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.expiresIn).toBeDefined();

    firstRefreshToken = response.body.refreshToken;
  });

  it('rejects invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'admin@demo.local', password: 'wrong' });

    expect(response.status).toBe(401);
  });

  it('rotates refresh token', async () => {
    const first = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: firstRefreshToken });

    expect(first.status).toBe(200);
    const newRefreshToken = first.body.refreshToken;

    const second = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: newRefreshToken });

    expect(second.status).toBe(200);
    expect(second.body.refreshToken).not.toEqual(newRefreshToken);
  });
});
