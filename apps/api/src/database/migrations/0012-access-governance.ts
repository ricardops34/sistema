import { MigrationInterface, QueryRunner } from 'typeorm';

export class AccessGovernance1781638919162 implements MigrationInterface {
  name = 'AccessGovernance1781638919162';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tenant_profile" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "code" character varying(100) NOT NULL,
        "name" character varying(150) NOT NULL,
        "description" text,
        "is_system" boolean NOT NULL DEFAULT false,
        "is_assignable_by_tenant" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_profile_code" UNIQUE ("tenant_id", "code"),
        CONSTRAINT "PK_tenant_profile" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_profile_routine_grant" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_profile_id" uuid NOT NULL,
        "app_routine_id" uuid NOT NULL,
        "is_allowed" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_profile_routine_grant" UNIQUE ("tenant_profile_id", "app_routine_id"),
        CONSTRAINT "PK_tenant_profile_routine_grant" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_profile_action_grant" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_profile_id" uuid NOT NULL,
        "app_routine_action_id" uuid NOT NULL,
        "is_allowed" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_profile_action_grant" UNIQUE ("tenant_profile_id", "app_routine_action_id"),
        CONSTRAINT "PK_tenant_profile_action_grant" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_user_profile" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_user_id" uuid NOT NULL,
        "tenant_profile_id" uuid NOT NULL,
        "granted_by_type" character varying(30) NOT NULL DEFAULT 'platform',
        "is_locked_by_platform" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_user_profile" UNIQUE ("tenant_user_id", "tenant_profile_id"),
        CONSTRAINT "PK_tenant_user_profile" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_user_routine_override" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_user_id" uuid NOT NULL,
        "app_routine_id" uuid NOT NULL,
        "is_allowed" boolean NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_user_routine_override" UNIQUE ("tenant_user_id", "app_routine_id"),
        CONSTRAINT "PK_tenant_user_routine_override" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_user_action_override" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_user_id" uuid NOT NULL,
        "app_routine_action_id" uuid NOT NULL,
        "is_allowed" boolean NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_user_action_override" UNIQUE ("tenant_user_id", "app_routine_action_id"),
        CONSTRAINT "PK_tenant_user_action_override" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_profile"
        ADD CONSTRAINT "FK_tenant_profile_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_profile_routine_grant"
        ADD CONSTRAINT "FK_tenant_profile_routine_profile" FOREIGN KEY ("tenant_profile_id") REFERENCES "tenant_profile"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_tenant_profile_routine_catalog" FOREIGN KEY ("app_routine_id") REFERENCES "app_routine"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_profile_action_grant"
        ADD CONSTRAINT "FK_tenant_profile_action_profile" FOREIGN KEY ("tenant_profile_id") REFERENCES "tenant_profile"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_tenant_profile_action_catalog" FOREIGN KEY ("app_routine_action_id") REFERENCES "app_routine_action"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_user_profile"
        ADD CONSTRAINT "FK_tenant_user_profile_user" FOREIGN KEY ("tenant_user_id") REFERENCES "tenant_user"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_tenant_user_profile_profile" FOREIGN KEY ("tenant_profile_id") REFERENCES "tenant_profile"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_user_routine_override"
        ADD CONSTRAINT "FK_tenant_user_routine_override_user" FOREIGN KEY ("tenant_user_id") REFERENCES "tenant_user"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_tenant_user_routine_override_catalog" FOREIGN KEY ("app_routine_id") REFERENCES "app_routine"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_user_action_override"
        ADD CONSTRAINT "FK_tenant_user_action_override_user" FOREIGN KEY ("tenant_user_id") REFERENCES "tenant_user"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_tenant_user_action_override_catalog" FOREIGN KEY ("app_routine_action_id") REFERENCES "app_routine_action"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`CREATE INDEX "IDX_tenant_profile_tenant" ON "tenant_profile" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenant_profile_routine_profile" ON "tenant_profile_routine_grant" ("tenant_profile_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenant_profile_action_profile" ON "tenant_profile_action_grant" ("tenant_profile_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenant_user_profile_user" ON "tenant_user_profile" ("tenant_user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenant_user_routine_override_user" ON "tenant_user_routine_override" ("tenant_user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenant_user_action_override_user" ON "tenant_user_action_override" ("tenant_user_id")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_user_action_override"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_user_routine_override"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_user_profile"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_profile_action_grant"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_profile_routine_grant"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_profile"`);
  }
}
