import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('People Duplicate (e2e)', () => {
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
    const slug = `dup-${Date.now()}`;
    const adminEmail = `dup-admin-${Date.now()}@test.local`;

    const onboardRes = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug, displayName: 'Dup Test', adminEmail });

    tenantId = onboardRes.body.tenant.id;

    await ds.query(
      `UPDATE tenant_person_policy SET duplicate_check_mode = 'block', duplicate_check_criteria = '["name"]' WHERE tenant_id = $1`,
      [tenantId],
    );

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: adminEmail, password: 'Mudar@123', channel: 'backoffice', tenantSlug: slug });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('blocks duplicate person when tenant policy is block', async () => {
    await request(app.getHttpServer())
      .post('/people')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nameLegal: 'Carlos Duplicate' });

    const response = await request(app.getHttpServer())
      .post('/people')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nameLegal: 'Carlos Duplicate' });

    expect(response.status).toBe(409);
  });
});
