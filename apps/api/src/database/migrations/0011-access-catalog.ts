import { MigrationInterface, QueryRunner } from 'typeorm';

export class AccessCatalog1781638919161 implements MigrationInterface {
  name = 'AccessCatalog1781638919161';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "app_module" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying(100) NOT NULL,
        "name" character varying(150) NOT NULL,
        "description" text,
        "icon" character varying(100),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_app_module_code" UNIQUE ("code"),
        CONSTRAINT "PK_app_module" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "app_menu_group" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "module_id" uuid NOT NULL,
        "code" character varying(100) NOT NULL,
        "name" character varying(150) NOT NULL,
        "description" text,
        "icon" character varying(100),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_app_menu_group_code" UNIQUE ("module_id", "code"),
        CONSTRAINT "PK_app_menu_group" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "app_routine" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "module_id" uuid NOT NULL,
        "menu_group_id" uuid NOT NULL,
        "code" character varying(100) NOT NULL,
        "name" character varying(150) NOT NULL,
        "description" text,
        "route_path" character varying(255),
        "icon" character varying(100),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_visible_in_menu" boolean NOT NULL DEFAULT true,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_app_routine_code" UNIQUE ("code"),
        CONSTRAINT "PK_app_routine" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "app_routine_action" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "routine_id" uuid NOT NULL,
        "code" character varying(100) NOT NULL,
        "name" character varying(150) NOT NULL,
        "description" text,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_app_routine_action_code" UNIQUE ("routine_id", "code"),
        CONSTRAINT "PK_app_routine_action" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "app_menu_group"
        ADD CONSTRAINT "FK_app_menu_group_module" FOREIGN KEY ("module_id") REFERENCES "app_module"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "app_routine"
        ADD CONSTRAINT "FK_app_routine_module" FOREIGN KEY ("module_id") REFERENCES "app_module"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_app_routine_menu_group" FOREIGN KEY ("menu_group_id") REFERENCES "app_menu_group"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "app_routine_action"
        ADD CONSTRAINT "FK_app_routine_action_routine" FOREIGN KEY ("routine_id") REFERENCES "app_routine"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`CREATE INDEX "IDX_app_menu_group_module" ON "app_menu_group" ("module_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_app_routine_module" ON "app_routine" ("module_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_app_routine_group" ON "app_routine" ("menu_group_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_app_routine_action_routine" ON "app_routine_action" ("routine_id")`);

    await queryRunner.query(`
      WITH inserted_module AS (
        INSERT INTO "app_module" ("code", "name", "description", "sort_order")
        VALUES ('cadastro', 'Cadastro', 'Módulo base de cadastros do sistema', 10)
        ON CONFLICT ("code") DO UPDATE
        SET "name" = EXCLUDED."name",
            "description" = EXCLUDED."description",
            "sort_order" = EXCLUDED."sort_order",
            "is_active" = true
        RETURNING "id"
      )
      INSERT INTO "app_menu_group" ("module_id", "code", "name", "description", "sort_order")
      SELECT "id", 'cadastros-basicos', 'Cadastros Básicos', 'Grupo inicial de cadastros do MVP', 10
      FROM inserted_module
      ON CONFLICT ("module_id", "code") DO UPDATE
      SET "name" = EXCLUDED."name",
          "description" = EXCLUDED."description",
          "sort_order" = EXCLUDED."sort_order",
          "is_active" = true
    `);

    await queryRunner.query(`
      WITH current_module AS (
        SELECT "id"
        FROM "app_module"
        WHERE "code" = 'cadastro'
      ),
      current_group AS (
        SELECT "id"
        FROM "app_menu_group"
        WHERE "code" = 'cadastros-basicos'
          AND "module_id" = (SELECT "id" FROM current_module)
      )
      INSERT INTO "app_routine" ("module_id", "menu_group_id", "code", "name", "description", "route_path", "sort_order")
      VALUES
        ((SELECT "id" FROM current_module), (SELECT "id" FROM current_group), 'people', 'Pessoas', 'Cadastro principal de pessoas', '/people', 10),
        ((SELECT "id" FROM current_module), (SELECT "id" FROM current_group), 'people-metadata', 'Parâmetros de Pessoas', 'Metadados e políticas do cadastro de pessoas', '/people/metadata', 20)
      ON CONFLICT ("code") DO UPDATE
      SET "module_id" = EXCLUDED."module_id",
          "menu_group_id" = EXCLUDED."menu_group_id",
          "name" = EXCLUDED."name",
          "description" = EXCLUDED."description",
          "route_path" = EXCLUDED."route_path",
          "sort_order" = EXCLUDED."sort_order",
          "is_active" = true
    `);

    await queryRunner.query(`
      WITH routine_actions AS (
        SELECT r."id" AS "routine_id", x."code", x."name", x."description", x."sort_order"
        FROM "app_routine" r
        INNER JOIN (
          VALUES
            ('people', 'read', 'Consultar', 'Permite listar e consultar pessoas', 10),
            ('people', 'create', 'Incluir', 'Permite criar pessoas', 20),
            ('people', 'update', 'Alterar', 'Permite atualizar pessoas', 30),
            ('people-metadata', 'metadata.read', 'Consultar metadados', 'Permite consultar políticas e tipos de cadastro', 10),
            ('people-metadata', 'metadata.manage', 'Gerenciar metadados', 'Permite alterar políticas e tipos de cadastro', 20)
        ) AS x("routine_code", "code", "name", "description", "sort_order")
          ON x."routine_code" = r."code"
      )
      INSERT INTO "app_routine_action" ("routine_id", "code", "name", "description", "sort_order")
      SELECT "routine_id", "code", "name", "description", "sort_order"
      FROM routine_actions
      ON CONFLICT ("routine_id", "code") DO UPDATE
      SET "name" = EXCLUDED."name",
          "description" = EXCLUDED."description",
          "sort_order" = EXCLUDED."sort_order",
          "is_active" = true
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "app_routine_action"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "app_routine"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "app_menu_group"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "app_module"`);
  }
}
