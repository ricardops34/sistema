import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let firstRefreshToken: string;
  let dataSource: DataSource;
  let tenantSlug: string;
  let adminEmail: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    dataSource = app.get(DataSource);

    tenantSlug = `auth-${Date.now()}`;
    adminEmail = `auth-admin-${Date.now()}@test.local`;

    await request(app.getHttpServer()).post('/onboarding/tenants').send({
      slug: tenantSlug,
      displayName: 'Auth Tenant',
      adminEmail,
      adminPassword: 'Mudar@123',
    });

    const [identity] = await dataSource.query(
      `SELECT id FROM platform_identity WHERE email = $1`,
      [adminEmail],
    );

    await dataSource.query(
      `INSERT INTO tenant_user (tenant_id, platform_identity_id, channel, is_active)
       SELECT id, $1, 'portal', true
       FROM tenant
       WHERE slug = $2`,
      [identity.id, tenantSlug],
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns access and refresh token on valid login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'admin@demo.local', password: 'password', channel: 'platform' });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.expiresIn).toBeDefined();

    firstRefreshToken = response.body.refreshToken;
  });

  it('rejects invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'admin@demo.local', password: 'wrong', channel: 'platform' });

    expect(response.status).toBe(401);
  });

  it('rejects tenant login without tenant slug', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: adminEmail, password: 'Mudar@123', channel: 'backoffice' });

    expect(response.status).toBe(401);
  });

  it('creates portal session with tenant context', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: adminEmail, password: 'Mudar@123', channel: 'portal', tenantSlug });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();

    const [session] = await dataSource.query(
      `SELECT tenant_id, channel
       FROM auth_session
       WHERE id = $1`,
      [response.body.sessionId],
    );

    expect(session.tenant_id).toBeDefined();
    expect(session.channel).toBe('portal');
  });

  it('rotates refresh token', async () => {
    const first = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: firstRefreshToken });

    expect(first.status).toBe(200);
    const newRefreshToken = first.body.refreshToken;

    const second = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: newRefreshToken });

    expect(second.status).toBe(200);
    expect(second.body.refreshToken).not.toEqual(newRefreshToken);
  });
});
