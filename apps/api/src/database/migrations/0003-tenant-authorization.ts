import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantAuthorization1781638919153 implements MigrationInterface {
  name = 'TenantAuthorization1781638919153';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tenant_role" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "slug" character varying(100) NOT NULL,
        "scopes" jsonb NOT NULL DEFAULT '[]',
        "is_system" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_role_slug" UNIQUE ("tenant_id", "slug"),
        CONSTRAINT "PK_tenant_role" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_user" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "platform_identity_id" uuid NOT NULL,
        "role_id" uuid,
        "channel" character varying(50) NOT NULL DEFAULT 'backoffice',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_user" UNIQUE ("tenant_id", "platform_identity_id", "channel"),
        CONSTRAINT "PK_tenant_user" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_role"
        ADD CONSTRAINT "FK_tenant_role_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_user"
        ADD CONSTRAINT "FK_tenant_user_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_tenant_user_identity" FOREIGN KEY ("platform_identity_id") REFERENCES "platform_identity"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_tenant_user_role" FOREIGN KEY ("role_id") REFERENCES "tenant_role"("id") ON DELETE SET NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_role"`);
  }
}
