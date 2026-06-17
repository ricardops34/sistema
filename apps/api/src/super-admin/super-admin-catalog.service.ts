import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SuperAdminCatalogService {
  constructor(private readonly dataSource: DataSource) {}

  listModules() {
    return this.dataSource.query(
      `
        SELECT id, code, name, description, icon, sort_order, is_active
        FROM app_module
        ORDER BY sort_order ASC, name ASC
      `,
    );
  }

  async createModule(body: any) {
    const [module] = await this.dataSource.query(
      `
        INSERT INTO app_module (code, name, description, icon, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, COALESCE($6, true))
        RETURNING id, code, name, description, icon, sort_order, is_active
      `,
      [
        body.code,
        body.name,
        body.description ?? null,
        body.icon ?? null,
        body.sortOrder ?? 0,
        body.isActive ?? true,
      ],
    );

    return this.mapModule(module);
  }

  async updateModule(moduleId: string, body: any) {
    await this.ensureExists('app_module', moduleId);

    const moduleResult = await this.dataSource.query(
      `
        UPDATE app_module
        SET
          code = COALESCE($2, code),
          name = COALESCE($3, name),
          description = COALESCE($4, description),
          icon = COALESCE($5, icon),
          sort_order = COALESCE($6, sort_order),
          is_active = COALESCE($7, is_active)
        WHERE id = $1
        RETURNING id, code, name, description, icon, sort_order, is_active
      `,
      [
        moduleId,
        body.code ?? null,
        body.name ?? null,
        body.description ?? null,
        body.icon ?? null,
        body.sortOrder ?? null,
        body.isActive ?? null,
      ],
    );

    return this.mapModule(this.extractFirstRow(moduleResult));
  }

  listGroups() {
    return this.dataSource.query(
      `
        SELECT id, module_id, code, name, description, icon, sort_order, is_active
        FROM app_menu_group
        ORDER BY sort_order ASC, name ASC
      `,
    );
  }

  async createGroup(body: any) {
    await this.ensureExists('app_module', body.moduleId);

    const [group] = await this.dataSource.query(
      `
        INSERT INTO app_menu_group (module_id, code, name, description, icon, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true))
        RETURNING id, module_id, code, name, description, icon, sort_order, is_active
      `,
      [
        body.moduleId,
        body.code,
        body.name,
        body.description ?? null,
        body.icon ?? null,
        body.sortOrder ?? 0,
        body.isActive ?? true,
      ],
    );

    return this.mapGroup(group);
  }

  async updateGroup(groupId: string, body: any) {
    await this.ensureExists('app_menu_group', groupId);

    const groupResult = await this.dataSource.query(
      `
        UPDATE app_menu_group
        SET
          module_id = COALESCE($2, module_id),
          code = COALESCE($3, code),
          name = COALESCE($4, name),
          description = COALESCE($5, description),
          icon = COALESCE($6, icon),
          sort_order = COALESCE($7, sort_order),
          is_active = COALESCE($8, is_active)
        WHERE id = $1
        RETURNING id, module_id, code, name, description, icon, sort_order, is_active
      `,
      [
        groupId,
        body.moduleId ?? null,
        body.code ?? null,
        body.name ?? null,
        body.description ?? null,
        body.icon ?? null,
        body.sortOrder ?? null,
        body.isActive ?? null,
      ],
    );

    return this.mapGroup(this.extractFirstRow(groupResult));
  }

  listRoutines() {
    return this.dataSource.query(
      `
        SELECT
          id,
          module_id,
          menu_group_id,
          code,
          name,
          description,
          route_path,
          icon,
          sort_order,
          is_visible_in_menu,
          is_active
        FROM app_routine
        ORDER BY sort_order ASC, name ASC
      `,
    );
  }

  async createRoutine(body: any) {
    await this.ensureExists('app_module', body.moduleId);
    await this.ensureExists('app_menu_group', body.menuGroupId);

    const [routine] = await this.dataSource.query(
      `
        INSERT INTO app_routine (
          module_id,
          menu_group_id,
          code,
          name,
          description,
          route_path,
          icon,
          sort_order,
          is_visible_in_menu,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, true), COALESCE($10, true))
        RETURNING
          id,
          module_id,
          menu_group_id,
          code,
          name,
          description,
          route_path,
          icon,
          sort_order,
          is_visible_in_menu,
          is_active
      `,
      [
        body.moduleId,
        body.menuGroupId,
        body.code,
        body.name,
        body.description ?? null,
        body.routePath ?? null,
        body.icon ?? null,
        body.sortOrder ?? 0,
        body.isVisibleInMenu ?? true,
        body.isActive ?? true,
      ],
    );

    return this.mapRoutine(routine);
  }

  async updateRoutine(routineId: string, body: any) {
    await this.ensureExists('app_routine', routineId);

    const routineResult = await this.dataSource.query(
      `
        UPDATE app_routine
        SET
          module_id = COALESCE($2, module_id),
          menu_group_id = COALESCE($3, menu_group_id),
          code = COALESCE($4, code),
          name = COALESCE($5, name),
          description = COALESCE($6, description),
          route_path = COALESCE($7, route_path),
          icon = COALESCE($8, icon),
          sort_order = COALESCE($9, sort_order),
          is_visible_in_menu = COALESCE($10, is_visible_in_menu),
          is_active = COALESCE($11, is_active)
        WHERE id = $1
        RETURNING
          id,
          module_id,
          menu_group_id,
          code,
          name,
          description,
          route_path,
          icon,
          sort_order,
          is_visible_in_menu,
          is_active
      `,
      [
        routineId,
        body.moduleId ?? null,
        body.menuGroupId ?? null,
        body.code ?? null,
        body.name ?? null,
        body.description ?? null,
        body.routePath ?? null,
        body.icon ?? null,
        body.sortOrder ?? null,
        body.isVisibleInMenu ?? null,
        body.isActive ?? null,
      ],
    );

    return this.mapRoutine(this.extractFirstRow(routineResult));
  }

  async replaceRoutineActions(routineId: string, actions: any[]) {
    await this.ensureExists('app_routine', routineId);

    await this.dataSource.query(`DELETE FROM app_routine_action WHERE routine_id = $1`, [routineId]);

    for (const action of actions ?? []) {
      await this.dataSource.query(
        `
          INSERT INTO app_routine_action (
            routine_id,
            code,
            name,
            description,
            sort_order,
            is_active
          )
          VALUES ($1, $2, $3, $4, $5, COALESCE($6, true))
        `,
        [
          routineId,
          action.code,
          action.name,
          action.description ?? null,
          action.sortOrder ?? 0,
          action.isActive ?? true,
        ],
      );
    }

    const storedActions = await this.dataSource.query(
      `
        SELECT id, code, name, description, sort_order, is_active
        FROM app_routine_action
        WHERE routine_id = $1
        ORDER BY sort_order ASC, name ASC
      `,
      [routineId],
    );

    return {
      routineId,
      actions: storedActions.map((action: any) => ({
        id: action.id,
        code: action.code,
        name: action.name,
        description: action.description,
        sortOrder: action.sort_order,
        isActive: action.is_active,
      })),
    };
  }

  private async ensureExists(tableName: string, id: string) {
    const [row] = await this.dataSource.query(`SELECT id FROM ${tableName} WHERE id = $1`, [id]);
    if (!row) {
      throw new NotFoundException(`Registro não encontrado em ${tableName}`);
    }
  }

  private mapModule(module: any) {
    return {
      id: module.id,
      code: module.code,
      name: module.name,
      description: module.description,
      icon: module.icon,
      sortOrder: module.sort_order,
      isActive: module.is_active,
    };
  }

  private mapGroup(group: any) {
    return {
      id: group.id,
      moduleId: group.module_id,
      code: group.code,
      name: group.name,
      description: group.description,
      icon: group.icon,
      sortOrder: group.sort_order,
      isActive: group.is_active,
    };
  }

  private mapRoutine(routine: any) {
    return {
      id: routine.id,
      moduleId: routine.module_id,
      menuGroupId: routine.menu_group_id,
      code: routine.code,
      name: routine.name,
      description: routine.description,
      routePath: routine.route_path,
      icon: routine.icon,
      sortOrder: routine.sort_order,
      isVisibleInMenu: routine.is_visible_in_menu,
      isActive: routine.is_active,
    };
  }

  private extractFirstRow(result: any) {
    if (Array.isArray(result) && Array.isArray(result[0])) {
      return result[0][0];
    }

    if (Array.isArray(result)) {
      return result[0];
    }

    return result;
  }
}
