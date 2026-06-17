import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

type ManagedProfileInput = {
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  isAssignableByTenant?: boolean;
  isActive?: boolean;
};

@Injectable()
export class SuperAdminProfilesService {
  constructor(private readonly dataSource: DataSource) {}

  async listProfiles(tenantId?: string) {
    const params: unknown[] = [];
    let whereClause = '';

    if (tenantId) {
      params.push(tenantId);
      whereClause = 'WHERE tenant_id = $1';
    }

    return this.dataSource.query(
      `
        SELECT
          id,
          tenant_id,
          code,
          name,
          description,
          is_system,
          is_assignable_by_tenant,
          is_active
        FROM tenant_profile
        ${whereClause}
        ORDER BY tenant_id ASC, name ASC
      `,
      params,
    );
  }

  async createProfile(input: ManagedProfileInput) {
    await this.ensureTenantExists(input.tenantId);

    const [profile] = await this.dataSource.query(
      `
        INSERT INTO tenant_profile (
          tenant_id,
          code,
          name,
          description,
          is_system,
          is_assignable_by_tenant,
          is_active
        )
        VALUES ($1, $2, $3, $4, false, $5, COALESCE($6, true))
        RETURNING
          id,
          tenant_id,
          code,
          name,
          description,
          is_assignable_by_tenant,
          is_active
      `,
      [
        input.tenantId,
        input.code,
        input.name,
        input.description ?? null,
        input.isAssignableByTenant ?? false,
        input.isActive ?? true,
      ],
    );

    return this.mapProfile(profile);
  }

  async updateProfile(profileId: string, input: Partial<ManagedProfileInput>) {
    const profile = await this.getProfileOrFail(profileId);

    const [updated] = await this.dataSource.query(
      `
        UPDATE tenant_profile
        SET
          code = COALESCE($2, code),
          name = COALESCE($3, name),
          description = COALESCE($4, description),
          is_assignable_by_tenant = COALESCE($5, is_assignable_by_tenant),
          is_active = COALESCE($6, is_active),
          updated_at = now()
        WHERE id = $1
        RETURNING
          id,
          tenant_id,
          code,
          name,
          description,
          is_assignable_by_tenant,
          is_active
      `,
      [
        profileId,
        input.code ?? null,
        input.name ?? null,
        input.description ?? null,
        input.isAssignableByTenant ?? null,
        input.isActive ?? null,
      ],
    );

    return this.mapProfile(updated ?? profile);
  }

  async replaceRoutineGrants(profileId: string, routineIds: string[]) {
    await this.getProfileOrFail(profileId);

    await this.dataSource.query(
      `DELETE FROM tenant_profile_routine_grant WHERE tenant_profile_id = $1`,
      [profileId],
    );

    for (const routineId of Array.from(new Set(routineIds))) {
      await this.dataSource.query(
        `
          INSERT INTO tenant_profile_routine_grant (tenant_profile_id, app_routine_id, is_allowed)
          VALUES ($1, $2, true)
        `,
        [profileId, routineId],
      );
    }

    return { profileId, routineIds: Array.from(new Set(routineIds)) };
  }

  async replaceActionGrants(profileId: string, actionIds: string[]) {
    await this.getProfileOrFail(profileId);

    await this.dataSource.query(
      `DELETE FROM tenant_profile_action_grant WHERE tenant_profile_id = $1`,
      [profileId],
    );

    for (const actionId of Array.from(new Set(actionIds))) {
      await this.dataSource.query(
        `
          INSERT INTO tenant_profile_action_grant (tenant_profile_id, app_routine_action_id, is_allowed)
          VALUES ($1, $2, true)
        `,
        [profileId, actionId],
      );
    }

    return { profileId, actionIds: Array.from(new Set(actionIds)) };
  }

  async replaceUserProfiles(
    tenantUserId: string,
    tenantId: string,
    profileIds: Array<{ id: string; isLockedByPlatform?: boolean }>,
  ) {
    await this.ensureTenantUser(tenantId, tenantUserId);

    const requestedProfiles = profileIds ?? [];
    if (requestedProfiles.length === 0) {
      throw new BadRequestException('Ao menos um perfil deve ser informado');
    }

    const uniqueProfiles = Array.from(
      new Map(requestedProfiles.map((profile) => [profile.id, profile])).values(),
    );

    const storedProfiles = await this.dataSource.query(
      `
        SELECT id
        FROM tenant_profile
        WHERE tenant_id = $1
          AND id = ANY($2)
      `,
      [tenantId, uniqueProfiles.map((profile) => profile.id)],
    );

    if (storedProfiles.length !== uniqueProfiles.length) {
      throw new BadRequestException('Perfil informado não pertence ao tenant');
    }

    await this.dataSource.query(
      `
        DELETE FROM tenant_user_profile
        WHERE tenant_user_id = $1
          AND granted_by_type = 'platform'
      `,
      [tenantUserId],
    );

    for (const profile of uniqueProfiles) {
      await this.dataSource.query(
        `
          INSERT INTO tenant_user_profile (
            tenant_user_id,
            tenant_profile_id,
            granted_by_type,
            is_locked_by_platform
          )
          VALUES ($1, $2, 'platform', $3)
          ON CONFLICT (tenant_user_id, tenant_profile_id) DO UPDATE
          SET granted_by_type = EXCLUDED.granted_by_type,
              is_locked_by_platform = EXCLUDED.is_locked_by_platform
        `,
        [tenantUserId, profile.id, profile.isLockedByPlatform ?? false],
      );
    }

    const assignedProfiles = await this.dataSource.query(
      `
        SELECT
          tp.id,
          tp.code,
          tp.name,
          tup.granted_by_type,
          tup.is_locked_by_platform
        FROM tenant_user_profile tup
        INNER JOIN tenant_profile tp
          ON tp.id = tup.tenant_profile_id
        WHERE tup.tenant_user_id = $1
        ORDER BY tp.name ASC
      `,
      [tenantUserId],
    );

    return {
      tenantUserId,
      assignedProfiles: assignedProfiles.map((profile: any) => ({
        id: profile.id,
        code: profile.code,
        name: profile.name,
        grantedByType: profile.granted_by_type,
        isLockedByPlatform: profile.is_locked_by_platform,
      })),
    };
  }

  async replaceUserOverrides(
    tenantUserId: string,
    tenantId: string,
    overrides: { routines?: Array<{ id: string; isAllowed: boolean }>; actions?: Array<{ id: string; isAllowed: boolean }> },
  ) {
    await this.ensureTenantUser(tenantId, tenantUserId);

    await this.dataSource.query(`DELETE FROM tenant_user_routine_override WHERE tenant_user_id = $1`, [
      tenantUserId,
    ]);
    await this.dataSource.query(`DELETE FROM tenant_user_action_override WHERE tenant_user_id = $1`, [
      tenantUserId,
    ]);

    for (const routine of overrides.routines ?? []) {
      await this.dataSource.query(
        `
          INSERT INTO tenant_user_routine_override (tenant_user_id, app_routine_id, is_allowed)
          VALUES ($1, $2, $3)
        `,
        [tenantUserId, routine.id, routine.isAllowed],
      );
    }

    for (const action of overrides.actions ?? []) {
      await this.dataSource.query(
        `
          INSERT INTO tenant_user_action_override (tenant_user_id, app_routine_action_id, is_allowed)
          VALUES ($1, $2, $3)
        `,
        [tenantUserId, action.id, action.isAllowed],
      );
    }

    return { tenantUserId, overridesApplied: true };
  }

  private async ensureTenantExists(tenantId: string) {
    const [tenant] = await this.dataSource.query(`SELECT id FROM tenant WHERE id = $1`, [tenantId]);
    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }
  }

  private async ensureTenantUser(tenantId: string, tenantUserId: string) {
    const [tenantUser] = await this.dataSource.query(
      `SELECT id FROM tenant_user WHERE id = $1 AND tenant_id = $2`,
      [tenantUserId, tenantId],
    );

    if (!tenantUser) {
      throw new NotFoundException('Usuário do tenant não encontrado');
    }
  }

  private async getProfileOrFail(profileId: string) {
    const [profile] = await this.dataSource.query(
      `
        SELECT
          id,
          tenant_id,
          code,
          name,
          description,
          is_assignable_by_tenant,
          is_active
        FROM tenant_profile
        WHERE id = $1
      `,
      [profileId],
    );

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    return profile;
  }

  private mapProfile(profile: any) {
    return {
      id: profile.id,
      tenantId: profile.tenant_id,
      code: profile.code,
      name: profile.name,
      description: profile.description,
      isAssignableByTenant: profile.is_assignable_by_tenant,
      isActive: profile.is_active,
    };
  }
}
