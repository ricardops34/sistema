import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Onboarding (e2e)', () => {
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

  it('creates tenant with initial branding and person policy', async () => {
    const slug = `test-${Date.now()}`;
    const response = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug, displayName: 'Demo', adminEmail: `admin-${slug}@demo.local` });

    expect(response.status).toBe(201);
    expect(response.body.tenant.slug).toBe(slug);
    expect(response.body.adminEmail).toBeDefined();
  });

  it('rejects duplicate slug', async () => {
    const slug = `dup-${Date.now()}`;
    await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug, displayName: 'Demo', adminEmail: `adm-${slug}@demo.local` });

    const response = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug, displayName: 'Demo2', adminEmail: `adm2-${slug}@demo.local` });

    expect(response.status).toBe(409);
  });

  it('creates default admin profile and grants during onboarding', async () => {
    const slug = `access-admin-${Date.now()}`;
    const response = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({
        slug,
        displayName: 'Access Admin',
        adminEmail: `admin-${slug}@demo.local`,
      });

    expect(response.status).toBe(201);

    const tenantId = response.body.tenant.id;
    const [profile] = await dataSource.query(
      `SELECT id, code FROM tenant_profile WHERE tenant_id = $1`,
      [tenantId],
    );

    expect(profile.code).toBe('admin');

    const [tenantUser] = await dataSource.query(
      `SELECT id FROM tenant_user WHERE tenant_id = $1 AND channel = 'backoffice' ORDER BY created_at ASC`,
      [tenantId],
    );

    const userProfiles = await dataSource.query(
      `SELECT tenant_profile_id FROM tenant_user_profile WHERE tenant_user_id = $1`,
      [tenantUser.id],
    );

    const routineGrants = await dataSource.query(
      `SELECT COUNT(*)::int AS total FROM tenant_profile_routine_grant WHERE tenant_profile_id = $1`,
      [profile.id],
    );

    const actionGrants = await dataSource.query(
      `SELECT COUNT(*)::int AS total FROM tenant_profile_action_grant WHERE tenant_profile_id = $1`,
      [profile.id],
    );

    expect(userProfiles.length).toBe(1);
    expect(routineGrants[0].total).toBeGreaterThan(0);
    expect(actionGrants[0].total).toBeGreaterThan(0);
  });
});
