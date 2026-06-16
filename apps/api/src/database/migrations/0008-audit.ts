import { MigrationInterface, QueryRunner } from 'typeorm';

export class Audit1781638919158 implements MigrationInterface {
  name = 'Audit1781638919158';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_event" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid,
        "actor_identity_id" uuid,
        "tenant_user_id" uuid,
        "action" character varying(100) NOT NULL,
        "resource_type" character varying(100),
        "resource_id" character varying(255),
        "payload" jsonb,
        "ip_address" character varying(64),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_event" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_event_tenant" ON "audit_event" ("tenant_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_event_action" ON "audit_event" ("action")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_event"`);
  }
}
