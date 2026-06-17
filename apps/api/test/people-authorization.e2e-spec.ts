import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('People Authorization (e2e)', () => {
  let app: INestApplication;
  let tenantSlug: string;
  let limitedAccessToken: string;
  let adminAccessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const dataSource = app.get(DataSource);
    tenantSlug = `authz-${Date.now()}`;
    const adminEmail = `authz-admin-${Date.now()}@test.local`;
    const limitedEmail = `authz-limited-${Date.now()}@test.local`;

    const onboardingResponse = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({
        slug: tenantSlug,
        displayName: 'Authorization Test',
        adminEmail,
        adminPassword: 'Mudar@123',
      });

    const tenantId = onboardingResponse.body.tenant.id;

    const [adminIdentity] = await dataSource.query(
      `SELECT id FROM platform_identity WHERE email = $1`,
      [adminEmail],
    );

    const [limitedIdentity] = await dataSource.query(
      `INSERT INTO platform_identity (email, password_hash, status)
       VALUES ($1, $2, 'active')
       RETURNING id`,
      [
        limitedEmail,
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      ],
    );

    const [readonlyRole] = await dataSource.query(
      `INSERT INTO tenant_role (tenant_id, name, slug, scopes, is_system)
       VALUES ($1, $2, $3, $4::jsonb, false)
       RETURNING id`,
      [tenantId, 'Consulta Pessoas', `readonly-${Date.now()}`, '["people.read"]'],
    );

    await dataSource.query(
      `INSERT INTO tenant_user (tenant_id, platform_identity_id, role_id, channel, is_active)
       VALUES ($1, $2, $3, 'backoffice', true)`,
      [tenantId, limitedIdentity.id, readonlyRole.id],
    );

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: adminEmail, password: 'Mudar@123', channel: 'backoffice', tenantSlug });

    adminAccessToken = adminLogin.body.accessToken;

    const limitedLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: limitedEmail, password: 'password', channel: 'backoffice', tenantSlug });

    limitedAccessToken = limitedLogin.body.accessToken;

    expect(adminIdentity.id).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  it('forbids creating people without create permission', async () => {
    const response = await request(app.getHttpServer())
      .post('/people')
      .set('Authorization', `Bearer ${limitedAccessToken}`)
      .send({ nameLegal: 'Sem Permissao' });

    expect(response.status).toBe(403);
  });

  it('allows listing people with read permission', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/people')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ nameLegal: 'Pessoa Autorizada' });

    expect(createResponse.status).toBe(201);

    const listResponse = await request(app.getHttpServer())
      .get('/people')
      .set('Authorization', `Bearer ${limitedAccessToken}`);

    expect(listResponse.status).toBe(200);
  });

  it('forbids metadata changes without metadata scope', async () => {
    const response = await request(app.getHttpServer())
      .put('/people-metadata/policy')
      .set('Authorization', `Bearer ${limitedAccessToken}`)
      .send({ duplicateCheckMode: 'block' });

    expect(response.status).toBe(403);
  });
});
