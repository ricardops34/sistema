import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantContext } from '../tenancy/tenant-context.decorator';

type MenuRoutineRow = {
  module_id: string;
  module_code: string;
  module_name: string;
  module_icon: string | null;
  module_sort_order: number;
  group_id: string;
  group_code: string;
  group_name: string;
  group_icon: string | null;
  group_sort_order: number;
  routine_id: string;
  routine_code: string;
  routine_name: string;
  routine_route_path: string | null;
  routine_icon: string | null;
  routine_sort_order: number;
};

@Injectable()
export class MeService {
  constructor(private readonly dataSource: DataSource) {}

  async getMenu(tenantContext: TenantContext) {
    if (tenantContext.resolvedAccess.routines.length === 0) {
      return { modules: [] };
    }

    const menuRows: MenuRoutineRow[] = await this.dataSource.query(
      `
        SELECT
          am.id AS module_id,
          am.code AS module_code,
          am.name AS module_name,
          am.icon AS module_icon,
          am.sort_order AS module_sort_order,
          ag.id AS group_id,
          ag.code AS group_code,
          ag.name AS group_name,
          ag.icon AS group_icon,
          ag.sort_order AS group_sort_order,
          ar.id AS routine_id,
          ar.code AS routine_code,
          ar.name AS routine_name,
          ar.route_path AS routine_route_path,
          ar.icon AS routine_icon,
          ar.sort_order AS routine_sort_order
        FROM app_routine ar
        INNER JOIN app_menu_group ag
          ON ag.id = ar.menu_group_id
         AND ag.is_active = true
        INNER JOIN app_module am
          ON am.id = ar.module_id
         AND am.is_active = true
        WHERE ar.is_active = true
          AND ar.is_visible_in_menu = true
          AND ar.code = ANY($1)
        ORDER BY
          am.sort_order ASC,
          am.name ASC,
          ag.sort_order ASC,
          ag.name ASC,
          ar.sort_order ASC,
          ar.name ASC
      `,
      [tenantContext.resolvedAccess.routines],
    );

    const modules = new Map<
      string,
      {
        id: string;
        code: string;
        name: string;
        icon: string | null;
        sortOrder: number;
        groups: Array<{
          id: string;
          code: string;
          name: string;
          icon: string | null;
          sortOrder: number;
          routines: Array<{
            id: string;
            code: string;
            name: string;
            routePath: string | null;
            icon: string | null;
            sortOrder: number;
          }>;
        }>;
      }
    >();

    menuRows.forEach((row) => {
      let module = modules.get(row.module_id);
      if (!module) {
        module = {
          id: row.module_id,
          code: row.module_code,
          name: row.module_name,
          icon: row.module_icon,
          sortOrder: Number(row.module_sort_order),
          groups: [],
        };
        modules.set(row.module_id, module);
      }

      let group = module.groups.find((item) => item.id === row.group_id);
      if (!group) {
        group = {
          id: row.group_id,
          code: row.group_code,
          name: row.group_name,
          icon: row.group_icon,
          sortOrder: Number(row.group_sort_order),
          routines: [],
        };
        module.groups.push(group);
      }

      group.routines.push({
        id: row.routine_id,
        code: row.routine_code,
        name: row.routine_name,
        routePath: row.routine_route_path,
        icon: row.routine_icon,
        sortOrder: Number(row.routine_sort_order),
      });
    });

    return { modules: Array.from(modules.values()) };
  }

  getPermissions(tenantContext: TenantContext) {
    return {
      tenantId: tenantContext.tenantId,
      tenantUserId: tenantContext.tenantUserId,
      routines: tenantContext.resolvedAccess.routines,
      actions: tenantContext.resolvedAccess.actions,
    };
  }
}
