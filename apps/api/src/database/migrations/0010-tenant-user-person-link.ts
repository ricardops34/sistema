import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantUserPersonLink1781638919160 implements MigrationInterface {
  name = 'TenantUserPersonLink1781638919160';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenant_user"
      ADD COLUMN "person_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_user"
      ADD CONSTRAINT "FK_tenant_user_person_tenant"
      FOREIGN KEY ("tenant_id", "person_id")
      REFERENCES "person" ("tenant_id", "id")
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_user_tenant_person" ON "tenant_user" ("tenant_id", "person_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tenant_user_tenant_person"`);
    await queryRunner.query(`
      ALTER TABLE "tenant_user"
      DROP CONSTRAINT IF EXISTS "FK_tenant_user_person_tenant"
    `);
    await queryRunner.query(`
      ALTER TABLE "tenant_user"
      DROP COLUMN IF EXISTS "person_id"
    `);
  }
}
