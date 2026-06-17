import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Menu (e2e)', () => {
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

    const dataSource = app.get(DataSource);
    const tenantSlug = `menu-${Date.now()}`;
    const adminEmail = `menu-admin-${Date.now()}@test.local`;
    const limitedEmail = `menu-limited-${Date.now()}@test.local`;

    const onboardingResponse = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({
        slug: tenantSlug,
        displayName: 'Menu Test',
        adminEmail,
        adminPassword: 'Mudar@123',
      });

    tenantId = onboardingResponse.body.tenant.id;

    const [limitedIdentity] = await dataSource.query(
      `INSERT INTO platform_identity (email, password_hash, status)
       VALUES ($1, $2, 'active')
       RETURNING id`,
      [
        limitedEmail,
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      ],
    );

    const [tenantUser] = await dataSource.query(
      `INSERT INTO tenant_user (tenant_id, platform_identity_id, channel, is_active)
       VALUES ($1, $2, 'backoffice', true)
       RETURNING id`,
      [tenantId, limitedIdentity.id],
    );

    const [profile] = await dataSource.query(
      `INSERT INTO tenant_profile (tenant_id, code, name, is_system, is_assignable_by_tenant)
       VALUES ($1, $2, $3, false, true)
       RETURNING id`,
      [tenantId, `menu-profile-${Date.now()}`, 'Consulta Menu'],
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

    await dataSource.query(
      `INSERT INTO tenant_user_profile (tenant_user_id, tenant_profile_id, granted_by_type, is_locked_by_platform)
       VALUES ($1, $2, 'tenant', false)`,
      [tenantUser.id, profile.id],
    );

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: limitedEmail, password: 'password', channel: 'backoffice', tenantSlug });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns filtered menu tree for authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .get('/me/menu')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.modules[0].code).toBe('cadastro');
    expect(response.body.modules[0].groups[0].routines[0].code).toBe('people');
  });

  it('returns resolved permissions for authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .get('/me/permissions')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.tenantId).toBe(tenantId);
    expect(response.body.routines).toContain('people');
    expect(response.body.actions).toContain('people.read');
  });
});
