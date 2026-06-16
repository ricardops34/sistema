import { MigrationInterface, QueryRunner } from 'typeorm';

export class People1781638919156 implements MigrationInterface {
  name = 'People1781638919156';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE SEQUENCE IF NOT EXISTS person_internal_code_seq START 1000
    `);

    await queryRunner.query(`
      CREATE TABLE "person" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "internal_code" character varying(50) NOT NULL,
        "name_legal" character varying(255) NOT NULL,
        "name_social" character varying(255),
        "birth_date" date,
        "gender" character varying(20),
        "notes" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_by" uuid,
        "updated_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_person_tenant_code" UNIQUE ("tenant_id", "internal_code"),
        CONSTRAINT "PK_person" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "person_contact" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "person_id" uuid NOT NULL,
        "tenant_id" uuid NOT NULL,
        "type" character varying(30) NOT NULL,
        "value" character varying(255) NOT NULL,
        "label" character varying(100),
        "is_primary" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_person_contact" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "person_document" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "person_id" uuid NOT NULL,
        "tenant_id" uuid NOT NULL,
        "document_type_key" character varying(100) NOT NULL,
        "value" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_person_document" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "person"
        ADD CONSTRAINT "FK_person_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "person_contact"
        ADD CONSTRAINT "FK_person_contact_person" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "person_document"
        ADD CONSTRAINT "FK_person_document_person" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`CREATE INDEX "IDX_person_tenant" ON "person" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_person_contact_person" ON "person_contact" ("person_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_person_document_person" ON "person_document" ("person_id")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "person_document"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "person_contact"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "person"`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS person_internal_code_seq`);
  }
}
