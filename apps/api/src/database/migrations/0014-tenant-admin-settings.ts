import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantAdminSettings1781649600000 implements MigrationInterface {
  name = 'TenantAdminSettings1781649600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenant"
      ADD COLUMN IF NOT EXISTS "limits" jsonb NOT NULL DEFAULT '{}'::jsonb
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenant"
      DROP COLUMN IF EXISTS "limits"
    `);
  }
}
