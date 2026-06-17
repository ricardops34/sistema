import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Tenant Users (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let tenantId: string;
  let assignableProfileId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const dataSource = app.get(DataSource);
    const tenantSlug = `tenant-users-${Date.now()}`;
    const adminEmail = `tenant-users-admin-${Date.now()}@test.local`;

    const onboardingResponse = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({
        slug: tenantSlug,
        displayName: 'Tenant Users',
        adminEmail,
        adminPassword: 'Mudar@123',
      });

    tenantId = onboardingResponse.body.tenant.id;

    const [profile] = await dataSource.query(
      `INSERT INTO tenant_profile (tenant_id, code, name, is_system, is_assignable_by_tenant)
       VALUES ($1, $2, $3, false, true)
       RETURNING id`,
      [tenantId, `operador-${Date.now()}`, 'Operador'],
    );

    const [routine] = await dataSource.query(
      `SELECT id
       FROM app_routine
       WHERE code = $1`,
      ['people'],
    );

    const [action] = await dataSource.query(
      `SELECT ara.id
       FROM app_routine_action ara
       INNER JOIN app_routine ar ON ar.id = ara.routine_id
       WHERE ar.code = $1 AND ara.code = $2`,
      ['people', 'read'],
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

    assignableProfileId = profile.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: adminEmail,
        password: 'Mudar@123',
        channel: 'backoffice',
        tenantSlug,
      });

    adminAccessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates, blocks, unblocks and resets password for a tenant user', async () => {
    const uniqueSuffix = Date.now();
    const email = `tenant-user-${uniqueSuffix}@test.local`;

    const create = await request(app.getHttpServer())
      .post('/tenant-admin/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        email,
        password: 'Inicial@123',
        profileIds: [assignableProfileId],
      });

    expect(create.status).toBe(201);
    expect(create.body.email).toBe(email);

    const userId = create.body.id;

    const block = await request(app.getHttpServer())
      .put(`/tenant-admin/users/${userId}/block`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(block.status).toBe(200);

    const blockedLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: email,
        password: 'Inicial@123',
        channel: 'backoffice',
        tenantSlug: create.body.tenantSlug,
      });

    expect(blockedLogin.status).toBe(401);

    const unblock = await request(app.getHttpServer())
      .put(`/tenant-admin/users/${userId}/unblock`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(unblock.status).toBe(200);

    const reset = await request(app.getHttpServer())
      .put(`/tenant-admin/users/${userId}/reset-password`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ password: 'Nova@12345' });

    expect(reset.status).toBe(200);

    const oldPasswordLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: email,
        password: 'Inicial@123',
        channel: 'backoffice',
        tenantSlug: create.body.tenantSlug,
      });

    expect(oldPasswordLogin.status).toBe(401);

    const newPasswordLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: email,
        password: 'Nova@12345',
        channel: 'backoffice',
        tenantSlug: create.body.tenantSlug,
      });

    expect(newPasswordLogin.status).toBe(201);
  });
});
