import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantSettings1781638919154 implements MigrationInterface {
  name = 'TenantSettings1781638919154';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tenant_branding" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "display_name" character varying(200),
        "logo_url" character varying(500),
        "primary_color" character varying(20),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_branding_tenant" UNIQUE ("tenant_id"),
        CONSTRAINT "PK_tenant_branding" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_person_policy" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "require_document" boolean NOT NULL DEFAULT false,
        "require_birth_date" boolean NOT NULL DEFAULT false,
        "require_email" boolean NOT NULL DEFAULT false,
        "duplicate_check_criteria" jsonb NOT NULL DEFAULT '["name"]',
        "duplicate_check_mode" character varying(20) NOT NULL DEFAULT 'alert',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_person_policy_tenant" UNIQUE ("tenant_id"),
        CONSTRAINT "PK_tenant_person_policy" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_branding"
        ADD CONSTRAINT "FK_tenant_branding_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_person_policy"
        ADD CONSTRAINT "FK_tenant_person_policy_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_person_policy"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_branding"`);
  }
}
