import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TenantContext (e2e)', () => {
  let app: INestApplication;

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

  it('rejects request without tenant context (no auth header)', async () => {
    const response = await request(app.getHttpServer()).get('/people');
    expect(response.status).toBe(401);
  });

  it('rejects request with invalid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/people')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(response.status).toBe(401);
  });
});
