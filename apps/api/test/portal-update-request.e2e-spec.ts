import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Portal Update Request (e2e)', () => {
  let app: INestApplication;
  let portalAccessToken: string;
  let backofficeAccessToken: string;
  let tenantId: string;
  let personId: string;
  let anotherPersonId: string;
  let tenantSlug: string;
  let adminEmail: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const ds = app.get(DataSource);
    tenantSlug = `portal-${Date.now()}`;
    adminEmail = `portal-admin-${Date.now()}@test.local`;

    const onboardRes = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug: tenantSlug, displayName: 'Portal Test', adminEmail });

    tenantId = onboardRes.body.tenant.id;

    const [identity] = await ds.query(
      `SELECT id FROM platform_identity WHERE email = $1`,
      [adminEmail],
    );

    const backofficeLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: adminEmail, password: 'Mudar@123', channel: 'backoffice', tenantSlug });

    backofficeAccessToken = backofficeLoginRes.body.accessToken;

    const personRes = await request(app.getHttpServer())
      .post('/people')
      .set('Authorization', `Bearer ${backofficeAccessToken}`)
      .send({ nameLegal: 'Portal User' });

    personId = personRes.body.id;

    const anotherPersonRes = await request(app.getHttpServer())
      .post('/people')
      .set('Authorization', `Bearer ${backofficeAccessToken}`)
      .send({ nameLegal: 'Other Person' });

    anotherPersonId = anotherPersonRes.body.id;

    const [portalRole] = await ds.query(
      `INSERT INTO tenant_role (tenant_id, name, slug, scopes, is_system)
       VALUES ($1, $2, $3, $4::jsonb, false)
       RETURNING id`,
      [tenantId, 'Portal Requester', `portal-requester-${Date.now()}`, '["people.request.create"]'],
    );

    await ds.query(
      `INSERT INTO tenant_user (tenant_id, platform_identity_id, person_id, role_id, channel, is_active)
       VALUES ($1, $2, $3, $4, 'portal', true)`,
      [tenantId, identity.id, personId, portalRole.id],
    );

    const portalLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: adminEmail, password: 'Mudar@123', channel: 'portal', tenantSlug });

    portalAccessToken = portalLoginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('portal user creates person update request', async () => {
    const response = await request(app.getHttpServer())
      .post('/people-requests')
      .set('Authorization', `Bearer ${portalAccessToken}`)
      .send({ personId, payload: { nameLegal: 'Portal User Updated', notes: 'Atualizacao via portal' } });

    expect(response.status).toBe(201);
    expect(response.body.personId).toBe(personId);
    expect(response.body.status).toBe('pending');
  });

  it('rejects backoffice token on portal endpoint', async () => {
    const response = await request(app.getHttpServer())
      .post('/people-requests')
      .set('Authorization', `Bearer ${backofficeAccessToken}`)
      .send({ personId, payload: { notes: 'should fail' } });

    expect(response.status).toBe(403);
  });

  it('rejects portal request for person not owned by the portal user', async () => {
    const response = await request(app.getHttpServer())
      .post('/people-requests')
      .set('Authorization', `Bearer ${portalAccessToken}`)
      .send({ personId: anotherPersonId, payload: { notes: 'should fail by ownership' } });

    expect(response.status).toBe(403);
  });
});
