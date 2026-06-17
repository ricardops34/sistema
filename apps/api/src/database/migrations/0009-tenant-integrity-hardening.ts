import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantIntegrityHardening1781638919159 implements MigrationInterface {
  name = 'TenantIntegrityHardening1781638919159';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "person_update_request" pur
      USING "person" p
      WHERE pur."person_id" = p."id"
        AND pur."tenant_id" <> p."tenant_id"
    `);

    await queryRunner.query(`
      DELETE FROM "person_contact" pc
      USING "person" p
      WHERE pc."person_id" = p."id"
        AND pc."tenant_id" <> p."tenant_id"
    `);

    await queryRunner.query(`
      DELETE FROM "person_document" pd
      USING "person" p
      WHERE pd."person_id" = p."id"
        AND pd."tenant_id" <> p."tenant_id"
    `);

    await queryRunner.query(`
      DELETE FROM "person_context_code" pcc
      USING "person" p
      WHERE pcc."person_id" = p."id"
        AND pcc."tenant_id" <> p."tenant_id"
    `);

    await queryRunner.query(`
      UPDATE "tenant_user" tu
      SET "role_id" = NULL
      FROM "tenant_role" tr
      WHERE tu."role_id" = tr."id"
        AND tu."tenant_id" <> tr."tenant_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "person"
      ADD CONSTRAINT "UQ_person_tenant_id" UNIQUE ("tenant_id", "id")
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_role"
      ADD CONSTRAINT "UQ_tenant_role_tenant_id" UNIQUE ("tenant_id", "id")
    `);

    await queryRunner.query(`
      ALTER TABLE "person_contact"
      ADD CONSTRAINT "FK_person_contact_person_tenant"
      FOREIGN KEY ("tenant_id", "person_id")
      REFERENCES "person" ("tenant_id", "id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "person_document"
      ADD CONSTRAINT "FK_person_document_person_tenant"
      FOREIGN KEY ("tenant_id", "person_id")
      REFERENCES "person" ("tenant_id", "id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "person_context_code"
      ADD CONSTRAINT "FK_person_context_code_person_tenant"
      FOREIGN KEY ("tenant_id", "person_id")
      REFERENCES "person" ("tenant_id", "id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "person_update_request"
      ADD CONSTRAINT "FK_person_update_request_person_tenant"
      FOREIGN KEY ("tenant_id", "person_id")
      REFERENCES "person" ("tenant_id", "id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_user"
      ADD CONSTRAINT "FK_tenant_user_role_tenant"
      FOREIGN KEY ("tenant_id", "role_id")
      REFERENCES "tenant_role" ("tenant_id", "id")
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_person_contact_tenant_person" ON "person_contact" ("tenant_id", "person_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_person_document_tenant_person" ON "person_document" ("tenant_id", "person_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_person_context_code_tenant_person" ON "person_context_code" ("tenant_id", "person_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_person_update_request_tenant_person" ON "person_update_request" ("tenant_id", "person_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_person_update_request_tenant_person"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_person_context_code_tenant_person"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_person_document_tenant_person"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_person_contact_tenant_person"`);

    await queryRunner.query(`
      ALTER TABLE "tenant_user"
      DROP CONSTRAINT IF EXISTS "FK_tenant_user_role_tenant"
    `);

    await queryRunner.query(`
      ALTER TABLE "person_update_request"
      DROP CONSTRAINT IF EXISTS "FK_person_update_request_person_tenant"
    `);

    await queryRunner.query(`
      ALTER TABLE "person_context_code"
      DROP CONSTRAINT IF EXISTS "FK_person_context_code_person_tenant"
    `);

    await queryRunner.query(`
      ALTER TABLE "person_document"
      DROP CONSTRAINT IF EXISTS "FK_person_document_person_tenant"
    `);

    await queryRunner.query(`
      ALTER TABLE "person_contact"
      DROP CONSTRAINT IF EXISTS "FK_person_contact_person_tenant"
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_role"
      DROP CONSTRAINT IF EXISTS "UQ_tenant_role_tenant_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "person"
      DROP CONSTRAINT IF EXISTS "UQ_person_tenant_id"
    `);
  }
}
