import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResolvedAccess } from './types/resolved-access.type';

type ResolveForUserInput = {
  tenantId: string;
  tenantUserId: string;
};

@Injectable()
export class AccessResolutionService {
  constructor(private readonly dataSource: DataSource) {}

  async resolveForUser(input: ResolveForUserInput): Promise<ResolvedAccess> {
    const routineRows: Array<{ code: string }> = await this.dataSource.query(
      `
        SELECT DISTINCT ar.code
        FROM tenant_user_profile tup
        INNER JOIN tenant_profile tp
          ON tp.id = tup.tenant_profile_id
         AND tp.tenant_id = $1
         AND tp.is_active = true
        INNER JOIN tenant_profile_routine_grant tprg
          ON tprg.tenant_profile_id = tp.id
         AND tprg.is_allowed = true
        INNER JOIN app_routine ar
          ON ar.id = tprg.app_routine_id
         AND ar.is_active = true
        WHERE tup.tenant_user_id = $2
      `,
      [input.tenantId, input.tenantUserId],
    );

    const actionRows: Array<{ routine_code: string; action_code: string }> =
      await this.dataSource.query(
        `
          SELECT DISTINCT ar.code AS routine_code, ara.code AS action_code
          FROM tenant_user_profile tup
          INNER JOIN tenant_profile tp
            ON tp.id = tup.tenant_profile_id
           AND tp.tenant_id = $1
           AND tp.is_active = true
          INNER JOIN tenant_profile_action_grant tpag
            ON tpag.tenant_profile_id = tp.id
           AND tpag.is_allowed = true
          INNER JOIN app_routine_action ara
            ON ara.id = tpag.app_routine_action_id
           AND ara.is_active = true
          INNER JOIN app_routine ar
            ON ar.id = ara.routine_id
           AND ar.is_active = true
          WHERE tup.tenant_user_id = $2
        `,
        [input.tenantId, input.tenantUserId],
      );

    const routineOverrideRows: Array<{ code: string; is_allowed: boolean }> =
      await this.dataSource.query(
        `
          SELECT ar.code, tur.is_allowed
          FROM tenant_user_routine_override tur
          INNER JOIN app_routine ar
            ON ar.id = tur.app_routine_id
          WHERE tur.tenant_user_id = $1
        `,
        [input.tenantUserId],
      );

    const actionOverrideRows: Array<{
      routine_code: string;
      action_code: string;
      is_allowed: boolean;
    }> = await this.dataSource.query(
      `
        SELECT ar.code AS routine_code, ara.code AS action_code, tua.is_allowed
        FROM tenant_user_action_override tua
        INNER JOIN app_routine_action ara
          ON ara.id = tua.app_routine_action_id
        INNER JOIN app_routine ar
          ON ar.id = ara.routine_id
        WHERE tua.tenant_user_id = $1
      `,
      [input.tenantUserId],
    );

    const routines = new Set<string>(routineRows.map((row) => row.code));
    const actions = new Set<string>(
      actionRows.map((row) => `${row.routine_code}.${row.action_code}`),
    );

    routineOverrideRows.forEach((row) => {
      if (row.is_allowed) {
        routines.add(row.code);
        return;
      }

      routines.delete(row.code);
    });

    actionOverrideRows.forEach((row) => {
      const actionCode = `${row.routine_code}.${row.action_code}`;
      if (row.is_allowed) {
        actions.add(actionCode);
        return;
      }

      actions.delete(actionCode);
    });

    return {
      routines: Array.from(routines).sort(),
      actions: Array.from(actions).sort(),
    };
  }
}
