import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Portal Update Request (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let tenantId: string;
  let personId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const ds = app.get(DataSource);
    const slug = `portal-${Date.now()}`;
    const adminEmail = `portal-admin-${Date.now()}@test.local`;

    const onboardRes = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug, displayName: 'Portal Test', adminEmail });

    tenantId = onboardRes.body.tenant.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: adminEmail, password: 'Mudar@123' });

    accessToken = loginRes.body.accessToken;

    await ds.query(
      `UPDATE auth_session SET tenant_id = $1 WHERE platform_identity_id = (SELECT id FROM platform_identity WHERE email = $2)`,
      [tenantId, adminEmail],
    );

    const personRes = await request(app.getHttpServer())
      .post('/people')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nameLegal: 'Portal User' });

    personId = personRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('portal user creates person update request', async () => {
    const response = await request(app.getHttpServer())
      .post('/people-requests')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ personId, payload: { nameLegal: 'Portal User Updated', notes: 'Atualização via portal' } });

    expect(response.status).toBe(201);
    expect(response.body.personId).toBe(personId);
    expect(response.body.status).toBe('pending');
  });
});
