import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Onboarding (e2e)', () => {
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

  it('creates tenant with initial branding and person policy', async () => {
    const slug = `test-${Date.now()}`;
    const response = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug, displayName: 'Demo', adminEmail: `admin-${slug}@demo.local` });

    expect(response.status).toBe(201);
    expect(response.body.tenant.slug).toBe(slug);
    expect(response.body.adminEmail).toBeDefined();
  });

  it('rejects duplicate slug', async () => {
    const slug = `dup-${Date.now()}`;
    await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug, displayName: 'Demo', adminEmail: `adm-${slug}@demo.local` });

    const response = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug, displayName: 'Demo2', adminEmail: `adm2-${slug}@demo.local` });

    expect(response.status).toBe(409);
  });
});
