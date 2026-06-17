import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PeopleMetadata (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const slug = `meta-${Date.now()}`;
    const adminEmail = `meta-admin-${Date.now()}@test.local`;

    const onboardRes = await request(app.getHttpServer())
      .post('/onboarding/tenants')
      .send({ slug, displayName: 'Meta Test', adminEmail });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: adminEmail, password: 'Mudar@123', channel: 'backoffice', tenantSlug: slug });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns tenant person metadata', async () => {
    const response = await request(app.getHttpServer())
      .get('/people-metadata')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.documentTypes).toBeInstanceOf(Array);
    expect(response.body.contextCodeTypes).toBeInstanceOf(Array);
  });
});
