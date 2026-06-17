import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Tenant Settings (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let tenantId: string;
  let planCode: string;
  let featureCodes: string[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const dataSource = app.get(DataSource);
    const tenantSlug = `tenant-settings-${Date.now()}`;
    const adminEmail = `tenant-settings-admin-${Date.now()}@test.local`;

    const onboardingResponse = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({
        slug: tenantSlug,
        displayName: 'Tenant Settings',
        adminEmail,
        adminPassword: 'Mudar@123',
      });

    tenantId = onboardingResponse.body.tenant.id;

    planCode = `plan-${Date.now()}`;
    featureCodes = [`feature-a-${Date.now()}`, `feature-b-${Date.now()}`];

    await dataSource.query(
      `INSERT INTO plan (code, name) VALUES ($1, $2)`,
      [planCode, 'Plano Admin'],
    );

    await dataSource.query(
      `INSERT INTO feature (code, name) VALUES ($1, $2), ($3, $4)`,
      [featureCodes[0], 'Feature A', featureCodes[1], 'Feature B'],
    );

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: adminEmail,
        password: 'Mudar@123',
        channel: 'backoffice',
        tenantSlug,
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('updates tenant display data, plan, limits and enabled features but forbids slug change and self-inactivation', async () => {
    const update = await request(app.getHttpServer())
      .put('/tenant-admin/tenant')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        displayName: 'Tenant Settings Atualizado',
        planCode,
        limits: {
          maxUsers: 25,
          maxRequestsPerMonth: 1000,
        },
        enabledFeatures: [featureCodes[0]],
      });

    expect(update.status).toBe(200);
    expect(update.body.tenantId).toBe(tenantId);
    expect(update.body.displayName).toBe('Tenant Settings Atualizado');
    expect(update.body.plan.code).toBe(planCode);
    expect(update.body.limits.maxUsers).toBe(25);
    expect(update.body.enabledFeatures).toEqual([featureCodes[0]]);

    const slugChange = await request(app.getHttpServer())
      .put('/tenant-admin/tenant')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        slug: 'novo-slug-proibido',
      });

    expect(slugChange.status).toBe(400);

    const inactivate = await request(app.getHttpServer())
      .put('/tenant-admin/tenant')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'inactive',
      });

    expect(inactivate.status).toBe(403);
  });
});
