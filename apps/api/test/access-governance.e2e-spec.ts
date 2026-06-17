import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Access Governance (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('stores tenant profile with routine and action grants', async () => {
    const slug = `access-governance-${Date.now()}`;
    const onboardingResponse = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({
        slug,
        displayName: 'Access Governance',
        adminEmail: `admin-${slug}@demo.local`,
      });

    expect(onboardingResponse.status).toBe(201);

    const tenantId = onboardingResponse.body.tenant.id;
    const [routine] = await dataSource.query(
      `SELECT id FROM app_routine WHERE code = $1`,
      ['people'],
    );

    const [action] = await dataSource.query(
      `SELECT id FROM app_routine_action WHERE code = $1`,
      ['create'],
    );

    const [profile] = await dataSource.query(
      `INSERT INTO tenant_profile (tenant_id, code, name, is_system)
       VALUES ($1, $2, $3, false)
       RETURNING id, code`,
      [tenantId, `operador-${Date.now()}`, 'Operador Cadastro'],
    );

    await dataSource.query(
      `INSERT INTO tenant_profile_routine_grant (tenant_profile_id, app_routine_id, is_allowed)
       VALUES ($1, $2, true)`,
      [profile.id, routine.id],
    );

    await dataSource.query(
      `INSERT INTO tenant_profile_action_grant (tenant_profile_id, app_routine_action_id, is_allowed)
       VALUES ($1, $2, true)`,
      [profile.id, action.id],
    );

    const storedProfiles = await dataSource.query(
      `SELECT code FROM tenant_profile WHERE tenant_id = $1`,
      [tenantId],
    );

    expect(storedProfiles.length).toBeGreaterThan(0);
  });
});
