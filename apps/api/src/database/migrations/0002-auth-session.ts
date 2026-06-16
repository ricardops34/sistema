import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthSession1781638919152 implements MigrationInterface {
  name = 'AuthSession1781638919152';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "auth_session" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "platform_identity_id" uuid NOT NULL,
        "tenant_id" uuid,
        "channel" character varying(50) NOT NULL DEFAULT 'backoffice',
        "ip_address" character varying(64),
        "user_agent" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auth_session" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "auth_refresh_token" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "session_id" uuid NOT NULL,
        "token_hash" character varying(255) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_refresh_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "PK_auth_refresh_token" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "auth_session"
        ADD CONSTRAINT "FK_auth_session_platform_identity"
        FOREIGN KEY ("platform_identity_id") REFERENCES "platform_identity"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "auth_refresh_token"
        ADD CONSTRAINT "FK_auth_refresh_token_session"
        FOREIGN KEY ("session_id") REFERENCES "auth_session"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_auth_session_identity" ON "auth_session" ("platform_identity_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_auth_refresh_token_session" ON "auth_refresh_token" ("session_id")
    `);

    await queryRunner.query(`
      INSERT INTO "platform_identity" ("email", "password_hash", "status")
      VALUES ('admin@demo.local', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active')
      ON CONFLICT ("email") DO NOTHING
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_refresh_token"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_session"`);
  }
}
