import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { AuditInterceptor } from '../src/audit/audit.interceptor';
import { AuditService } from '../src/audit/audit.service';

describe('Audit (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let tenantId: string;
  let auditService: AuditService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    auditService = moduleFixture.get(AuditService);
    const auditInterceptor = moduleFixture.get(AuditInterceptor);
    app.useGlobalInterceptors(auditInterceptor);

    await app.init();

    const ds = app.get(DataSource);
    const slug = `audit-${Date.now()}`;
    const adminEmail = `audit-admin-${Date.now()}@test.local`;

    const onboardRes = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug, displayName: 'Audit Test', adminEmail });

    tenantId = onboardRes.body.tenant.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: adminEmail, password: 'Mudar@123' });

    accessToken = loginRes.body.accessToken;

    await ds.query(
      `UPDATE auth_session SET tenant_id = $1 WHERE platform_identity_id = (SELECT id FROM platform_identity WHERE email = $2)`,
      [tenantId, adminEmail],
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('stores audit event after person creation', async () => {
    const logSpy = jest.spyOn(auditService, 'log');

    await request(app.getHttpServer())
      .post('/people')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nameLegal: 'Auditado Silva' });

    await new Promise((r) => setTimeout(r, 100));

    const audited = logSpy.mock.calls.find(
      ([data]) => data.action === 'person.create',
    );

    expect(audited).toBeDefined();
    expect(audited?.[0].action).toBe('person.create');
  });
});
