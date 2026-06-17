import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Tenant User Profiles (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let tenantId: string;
  let tenantUserId: string;
  let assignableProfileId: string;
  let protectedProfileId: string;
  let hiddenProfileId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const dataSource = app.get(DataSource);
    const tenantSlug = `tenant-user-profiles-${Date.now()}`;
    const adminEmail = `tenant-user-profiles-admin-${Date.now()}@test.local`;

    const onboardingResponse = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({
        slug: tenantSlug,
        displayName: 'Tenant User Profiles',
        adminEmail,
        adminPassword: 'Mudar@123',
      });

    tenantId = onboardingResponse.body.tenant.id;

    const [identity] = await dataSource.query(
      `INSERT INTO platform_identity (email, password_hash, status)
       VALUES ($1, $2, 'active')
       RETURNING id`,
      [
        `target-${Date.now()}@test.local`,
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

    const [assignableProfile] = await dataSource.query(
      `INSERT INTO tenant_profile (tenant_id, code, name, is_system, is_assignable_by_tenant)
       VALUES ($1, $2, $3, false, true)
       RETURNING id`,
      [tenantId, `assignable-${Date.now()}`, 'Atribuível'],
    );

    const [protectedProfile] = await dataSource.query(
      `INSERT INTO tenant_profile (tenant_id, code, name, is_system, is_assignable_by_tenant, is_active)
       VALUES ($1, $2, $3, false, true, false)
       RETURNING id`,
      [tenantId, `protected-${Date.now()}`, 'Protegido'],
    );

    const [hiddenProfile] = await dataSource.query(
      `INSERT INTO tenant_profile (tenant_id, code, name, is_system, is_assignable_by_tenant)
       VALUES ($1, $2, $3, false, false)
       RETURNING id`,
      [tenantId, `hidden-${Date.now()}`, 'Não Atribuível'],
    );

    assignableProfileId = assignableProfile.id;
    protectedProfileId = protectedProfile.id;
    hiddenProfileId = hiddenProfile.id;

    await dataSource.query(
      `INSERT INTO tenant_user_profile (tenant_user_id, tenant_profile_id, granted_by_type, is_locked_by_platform)
       VALUES ($1, $2, 'tenant', false),
              ($1, $3, 'platform', true)`,
      [tenantUserId, assignableProfileId, protectedProfileId],
    );

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

  it('assigns only tenant-assignable profiles and blocks removal of the last active profile', async () => {
    const list = await request(app.getHttpServer())
      .get(`/tenant-admin/users/${tenantUserId}/profiles`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(list.status).toBe(200);
    expect(list.body.assignedProfiles.map((item) => item.id)).toContain(assignableProfileId);
    expect(list.body.assignedProfiles.map((item) => item.id)).not.toContain(protectedProfileId);
    expect(list.body.availableProfiles.map((item) => item.id)).not.toContain(hiddenProfileId);

    const assign = await request(app.getHttpServer())
      .put(`/tenant-admin/users/${tenantUserId}/profiles`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ profileIds: [assignableProfileId, hiddenProfileId] });

    expect(assign.status).toBe(400);

    const removeLast = await request(app.getHttpServer())
      .put(`/tenant-admin/users/${tenantUserId}/profiles`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ profileIds: [] });

    expect(removeLast.status).toBe(409);
  });
});
