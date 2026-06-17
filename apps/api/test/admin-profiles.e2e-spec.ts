import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Admin Profiles (e2e)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let tenantId: string;
  let tenantUserId: string;
  let routineId: string;
  let actionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const dataSource = app.get(DataSource);
    const tenantSlug = `admin-profiles-${Date.now()}`;

    const onboardingResponse = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({
        slug: tenantSlug,
        displayName: 'Admin Profiles',
        adminEmail: `admin-profiles-${Date.now()}@test.local`,
        adminPassword: 'Mudar@123',
      });

    tenantId = onboardingResponse.body.tenant.id;

    const [identity] = await dataSource.query(
      `INSERT INTO platform_identity (email, password_hash, status)
       VALUES ($1, $2, 'active')
       RETURNING id`,
      [
        `super-managed-${Date.now()}@test.local`,
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      ],
    );

    const [tenantUser] = await dataSource.query(
      `INSERT INTO tenant_user (tenant_id, platform_identity_id, channel, is_active)
       VALUES ($1, $2, 'backoffice', true)
       RETURNING id`,
      [tenantId, identity.id],
    );

    tenantUserId = tenantUser.id;

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

    routineId = routine.id;
    actionId = action.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: 'admin@demo.local',
        password: 'password',
        channel: 'platform',
      });

    superAdminToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates a profile, marks assignability, updates routine grants and locks protected profile assignment', async () => {
    const create = await request(app.getHttpServer())
      .post('/super-admin/profiles')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        tenantId,
        code: `super-admin-profile-${Date.now()}`,
        name: 'Perfil Supervisionado',
        isAssignableByTenant: true,
      });

    expect(create.status).toBe(201);
    expect(create.body.isAssignableByTenant).toBe(true);

    const profileId = create.body.id;

    const routines = await request(app.getHttpServer())
      .put(`/super-admin/profiles/${profileId}/routines`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        routineIds: [routineId],
      });

    expect(routines.status).toBe(200);

    const actions = await request(app.getHttpServer())
      .put(`/super-admin/profiles/${profileId}/actions`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        actionIds: [actionId],
      });

    expect(actions.status).toBe(200);

    const lock = await request(app.getHttpServer())
      .put(`/super-admin/users/${tenantUserId}/profiles`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        tenantId,
        profileIds: [{ id: profileId, isLockedByPlatform: true }],
      });

    expect(lock.status).toBe(200);
    expect(lock.body.assignedProfiles[0].isLockedByPlatform).toBe(true);
  });
});
