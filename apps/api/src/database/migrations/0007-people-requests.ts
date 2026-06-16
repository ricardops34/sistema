import { MigrationInterface, QueryRunner } from 'typeorm';

export class PeopleRequests1781638919157 implements MigrationInterface {
  name = 'PeopleRequests1781638919157';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "person_context_code" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "person_id" uuid NOT NULL,
        "tenant_id" uuid NOT NULL,
        "context_key" character varying(100) NOT NULL,
        "code" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_person_context_code" UNIQUE ("person_id", "context_key"),
        CONSTRAINT "PK_person_context_code" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "person_update_request" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "person_id" uuid NOT NULL,
        "requester_identity_id" uuid NOT NULL,
        "status" character varying(30) NOT NULL DEFAULT 'pending',
        "payload" jsonb NOT NULL DEFAULT '{}',
        "reviewer_notes" text,
        "reviewed_by" uuid,
        "reviewed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_person_update_request" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "person_context_code"
        ADD CONSTRAINT "FK_pcc_person" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "person_update_request"
        ADD CONSTRAINT "FK_pur_person" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_person_update_request_tenant" ON "person_update_request" ("tenant_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "person_update_request"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "person_context_code"`);
  }
}
