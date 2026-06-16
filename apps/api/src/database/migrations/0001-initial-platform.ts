import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialPlatform1718500000001 implements MigrationInterface {
  name = 'InitialPlatform1718500000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "plan" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(50) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_plan_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_plan" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "feature" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "key" character varying(100) NOT NULL,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_feature_key" UNIQUE ("key"),
        CONSTRAINT "PK_feature" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "plan_feature" (
        "plan_id" uuid NOT NULL,
        "feature_id" uuid NOT NULL,
        CONSTRAINT "PK_plan_feature" PRIMARY KEY ("plan_id", "feature_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "slug" character varying(100) NOT NULL,
        "display_name" character varying(200) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_tenant" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_plan" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "plan_id" uuid NOT NULL,
        "started_at" TIMESTAMP NOT NULL DEFAULT now(),
        "ended_at" TIMESTAMP,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_tenant_plan" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_feature_override" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "feature_id" uuid NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_feature_override" UNIQUE ("tenant_id", "feature_id"),
        CONSTRAINT "PK_tenant_feature_override" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_onboarding" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "completed_steps" jsonb NOT NULL DEFAULT '[]',
        "completed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_onboarding_tenant" UNIQUE ("tenant_id"),
        CONSTRAINT "PK_tenant_onboarding" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "platform_identity" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "login" character varying(200) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_platform_identity_login" UNIQUE ("login"),
        CONSTRAINT "PK_platform_identity" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "plan_feature"
        ADD CONSTRAINT "FK_plan_feature_plan" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_plan_feature_feature" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_plan"
        ADD CONSTRAINT "FK_tenant_plan_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_tenant_plan_plan" FOREIGN KEY ("plan_id") REFERENCES "plan"("id")
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_feature_override"
        ADD CONSTRAINT "FK_tfo_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_tfo_feature" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_onboarding"
        ADD CONSTRAINT "FK_tenant_onboarding_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_onboarding"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_feature_override"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_plan"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_identity"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "plan_feature"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "feature"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "plan"`);
  }
}
