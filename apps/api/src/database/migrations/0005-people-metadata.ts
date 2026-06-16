import { MigrationInterface, QueryRunner } from 'typeorm';

export class PeopleMetadata1781638919155 implements MigrationInterface {
  name = 'PeopleMetadata1781638919155';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tenant_person_document_type" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "key" character varying(100) NOT NULL,
        "mask" character varying(50),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_document_type" UNIQUE ("tenant_id", "key"),
        CONSTRAINT "PK_tenant_person_document_type" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_person_context_code_type" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "key" character varying(100) NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_context_code_type" UNIQUE ("tenant_id", "key"),
        CONSTRAINT "PK_tenant_person_context_code_type" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_field_rule" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "field_name" character varying(100) NOT NULL,
        "is_required" boolean NOT NULL DEFAULT false,
        "is_visible" boolean NOT NULL DEFAULT true,
        "label" character varying(100),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_field_rule" UNIQUE ("tenant_id", "field_name"),
        CONSTRAINT "PK_tenant_field_rule" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_person_document_type"
        ADD CONSTRAINT "FK_tpdt_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_person_context_code_type"
        ADD CONSTRAINT "FK_tpcct_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_field_rule"
        ADD CONSTRAINT "FK_tfr_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_field_rule"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_person_context_code_type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_person_document_type"`);
  }
}
