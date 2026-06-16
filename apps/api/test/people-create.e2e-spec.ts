import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('People (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const ds = app.get(DataSource);
    const slug = `people-${Date.now()}`;
    const adminEmail = `people-admin-${Date.now()}@test.local`;

    const onboardRes = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug, displayName: 'People Test', adminEmail });

    tenantId = onboardRes.body.tenant.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: adminEmail, password: 'Mudar@123' });

    accessToken = loginRes.body.accessToken;

    await ds.query(
      `UPDATE auth_session SET tenant_id = $1 WHERE platform_identity_id = (SELECT id FROM platform_identity WHERE email = $2)`,
      [tenantId, adminEmail],
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates person with generated internal code', async () => {
    const response = await request(app.getHttpServer())
      .post('/people')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nameLegal: 'Maria Silva' });

    expect(response.status).toBe(201);
    expect(response.body.internalCode).toBeDefined();
    expect(response.body.nameLegal).toBe('Maria Silva');
  });

  it('lists people filtered by tenant', async () => {
    await request(app.getHttpServer())
      .post('/people')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nameLegal: 'João Santos' });

    const response = await request(app.getHttpServer())
      .get('/people')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeGreaterThanOrEqual(1);
    expect(response.body.items.every((p: { tenantId: string }) => p.tenantId === tenantId)).toBe(true);
  });
});
