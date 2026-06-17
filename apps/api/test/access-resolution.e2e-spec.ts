import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Access Resolution (e2e)', () => {
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

  it('resolves routine and action access from profile grants', async () => {
    const slug = `access-resolution-${Date.now()}`;
    const limitedEmail = `limited-${slug}@demo.local`;

    const onboardingResponse = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({
        slug,
        displayName: 'Access Resolution',
        adminEmail: `admin-${slug}@demo.local`,
      });

    expect(onboardingResponse.status).toBe(201);

    const tenantId = onboardingResponse.body.tenant.id;

    const [identity] = await dataSource.query(
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
      [tenantId, identity.id],
    );

    const [profile] = await dataSource.query(
      `INSERT INTO tenant_profile (tenant_id, code, name, is_system)
       VALUES ($1, $2, $3, false)
       RETURNING id`,
      [tenantId, `operador-${Date.now()}`, 'Operador Cadastro'],
    );

    const [routine] = await dataSource.query(
      `SELECT id FROM app_routine WHERE code = $1`,
      ['people'],
    );

    const [action] = await dataSource.query(
      `SELECT id FROM app_routine_action WHERE routine_id = $1 AND code = $2`,
      [routine.id, 'create'],
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
      `INSERT INTO tenant_user_profile (tenant_user_id, tenant_profile_id)
       VALUES ($1, $2)`,
      [tenantUser.id, profile.id],
    );

    const { AccessResolutionService } = await import('../src/access-control/access-resolution.service');
    const service = app.get(AccessResolutionService);
    const resolved = await service.resolveForUser({ tenantId, tenantUserId: tenantUser.id });

    expect(resolved.routines).toContain('people');
    expect(resolved.actions).toContain('people.create');
  });
});
