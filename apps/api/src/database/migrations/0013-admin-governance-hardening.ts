import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminGovernanceHardening1781646000000 implements MigrationInterface {
  name = 'AdminGovernanceHardening1781646000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenant_profile"
      ADD COLUMN IF NOT EXISTS "is_assignable_by_tenant" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_user_profile"
      ADD COLUMN IF NOT EXISTS "granted_by_type" character varying(30) NOT NULL DEFAULT 'platform'
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_user_profile"
      ADD COLUMN IF NOT EXISTS "is_locked_by_platform" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "app_module"
      ADD COLUMN IF NOT EXISTS "icon" character varying(100)
    `);

    await queryRunner.query(`
      ALTER TABLE "app_routine"
      ADD COLUMN IF NOT EXISTS "icon" character varying(100)
    `);

    await queryRunner.query(`
      ALTER TABLE "app_routine"
      ADD COLUMN IF NOT EXISTS "is_visible_in_menu" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      UPDATE "app_module"
      SET "icon" = COALESCE("icon", CASE "code"
        WHEN 'cadastro' THEN 'ph ph-address-book'
        ELSE 'ph ph-squares-four'
      END)
    `);

    await queryRunner.query(`
      UPDATE "app_menu_group"
      SET "icon" = COALESCE("icon", CASE "code"
        WHEN 'cadastros-basicos' THEN 'ph ph-folders'
        ELSE 'ph ph-folder'
      END)
    `);

    await queryRunner.query(`
      UPDATE "app_routine"
      SET "icon" = COALESCE("icon", CASE "code"
        WHEN 'people' THEN 'ph ph-users'
        WHEN 'people-metadata' THEN 'ph ph-sliders-horizontal'
        ELSE 'ph ph-dots-nine'
      END)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "app_routine" DROP COLUMN IF EXISTS "is_visible_in_menu"`);
    await queryRunner.query(`ALTER TABLE "app_routine" DROP COLUMN IF EXISTS "icon"`);
    await queryRunner.query(`ALTER TABLE "app_module" DROP COLUMN IF EXISTS "icon"`);
    await queryRunner.query(`ALTER TABLE "tenant_user_profile" DROP COLUMN IF EXISTS "is_locked_by_platform"`);
    await queryRunner.query(`ALTER TABLE "tenant_user_profile" DROP COLUMN IF EXISTS "granted_by_type"`);
    await queryRunner.query(`ALTER TABLE "tenant_profile" DROP COLUMN IF EXISTS "is_assignable_by_tenant"`);
  }
}
