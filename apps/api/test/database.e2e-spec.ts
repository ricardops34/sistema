import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Database (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('database connection initializes', async () => {
    expect(dataSource.isInitialized).toBe(true);
  });

  it('rejects cross-tenant person update requests at the database level', async () => {
    const suffix = Date.now().toString();

    const [tenantA] = await dataSource.query(
      `INSERT INTO "tenant" ("slug", "display_name") VALUES ($1, $2) RETURNING "id"`,
      [`db-tenant-a-${suffix}`, 'DB Tenant A'],
    );
    const [tenantB] = await dataSource.query(
      `INSERT INTO "tenant" ("slug", "display_name") VALUES ($1, $2) RETURNING "id"`,
      [`db-tenant-b-${suffix}`, 'DB Tenant B'],
    );

    const [person] = await dataSource.query(
      `INSERT INTO "person" ("tenant_id", "internal_code", "name_legal")
       VALUES ($1, $2, $3)
       RETURNING "id"`,
      [tenantA.id, `PA-${suffix}`, 'Pessoa Tenant A'],
    );

    await expect(
      dataSource.query(
        `INSERT INTO "person_update_request" ("tenant_id", "person_id", "requester_identity_id", "payload")
         VALUES ($1, $2, gen_random_uuid(), '{}'::jsonb)`,
        [tenantB.id, person.id],
      ),
    ).rejects.toThrow();
  });

  it('rejects cross-tenant person contacts at the database level', async () => {
    const suffix = `${Date.now()}-contact`;

    const [tenantA] = await dataSource.query(
      `INSERT INTO "tenant" ("slug", "display_name") VALUES ($1, $2) RETURNING "id"`,
      [`db-tenant-a-${suffix}`, 'DB Tenant A Contact'],
    );
    const [tenantB] = await dataSource.query(
      `INSERT INTO "tenant" ("slug", "display_name") VALUES ($1, $2) RETURNING "id"`,
      [`db-tenant-b-${suffix}`, 'DB Tenant B Contact'],
    );

    const [person] = await dataSource.query(
      `INSERT INTO "person" ("tenant_id", "internal_code", "name_legal")
       VALUES ($1, $2, $3)
       RETURNING "id"`,
      [tenantA.id, `PC-${suffix}`, 'Pessoa Contact'],
    );

    await expect(
      dataSource.query(
        `INSERT INTO "person_contact" ("tenant_id", "person_id", "type", "value")
         VALUES ($1, $2, $3, $4)`,
        [tenantB.id, person.id, 'email', `contato-${suffix}@test.local`],
      ),
    ).rejects.toThrow();
  });

  it('rejects cross-tenant role assignment at the database level', async () => {
    const suffix = `${Date.now()}-role`;

    const [tenantA] = await dataSource.query(
      `INSERT INTO "tenant" ("slug", "display_name") VALUES ($1, $2) RETURNING "id"`,
      [`db-tenant-a-${suffix}`, 'DB Tenant A Role'],
    );
    const [tenantB] = await dataSource.query(
      `INSERT INTO "tenant" ("slug", "display_name") VALUES ($1, $2) RETURNING "id"`,
      [`db-tenant-b-${suffix}`, 'DB Tenant B Role'],
    );

    const [role] = await dataSource.query(
      `INSERT INTO "tenant_role" ("tenant_id", "name", "slug", "scopes")
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING "id"`,
      [tenantA.id, 'Administrador', `admin-${suffix}`, '["*"]'],
    );

    const [identity] = await dataSource.query(
      `SELECT "id" FROM "platform_identity" LIMIT 1`,
    );

    await expect(
      dataSource.query(
        `INSERT INTO "tenant_user" ("tenant_id", "platform_identity_id", "role_id", "channel")
         VALUES ($1, $2, $3, $4)`,
        [tenantB.id, identity.id, role.id, 'backoffice'],
      ),
    ).rejects.toThrow();
  });
});
