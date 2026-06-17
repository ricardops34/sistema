import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { TenantContext } from '../tenancy/tenant-context.decorator';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantUserDto } from './dto/update-tenant-user.dto';
import { ResetTenantUserPasswordDto } from './dto/reset-tenant-user-password.dto';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';

type TenantUserRow = {
  id: string;
  tenant_id: string;
  platform_identity_id: string;
  channel: string;
  is_active: boolean;
  email: string;
  identity_status: string;
  tenant_slug: string;
};

@Injectable()
export class TenantUsersService {
  constructor(private readonly dataSource: DataSource) {}

  async list(tenantContext: TenantContext) {
    return this.dataSource.query(
      `
        SELECT
          tu.id,
          pi.email,
          pi.status AS identity_status,
          tu.channel,
          tu.is_active
        FROM tenant_user tu
        INNER JOIN platform_identity pi
          ON pi.id = tu.platform_identity_id
        WHERE tu.tenant_id = $1
        ORDER BY pi.email ASC
      `,
      [tenantContext.tenantId],
    );
  }

  async create(tenantContext: TenantContext, dto: CreateTenantUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingMembership = await queryRunner.query(
        `
          SELECT tu.id
          FROM tenant_user tu
          INNER JOIN platform_identity pi
            ON pi.id = tu.platform_identity_id
          WHERE tu.tenant_id = $1
            AND pi.email = $2
            AND tu.channel = 'backoffice'
        `,
        [tenantContext.tenantId, dto.email],
      );

      if (existingMembership.length > 0) {
        throw new ConflictException('Usuário já cadastrado neste tenant');
      }

      const existingIdentity = await queryRunner.query(
        `SELECT id FROM platform_identity WHERE email = $1`,
        [dto.email],
      );

      if (existingIdentity.length > 0) {
        throw new ConflictException('E-mail já utilizado por outra identidade');
      }

      const [tenant] = await queryRunner.query(
        `SELECT slug FROM tenant WHERE id = $1 AND status = 'active'`,
        [tenantContext.tenantId],
      );

      if (!tenant) {
        throw new NotFoundException('Tenant não encontrado');
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);
      const [identity] = await queryRunner.query(
        `
          INSERT INTO platform_identity (email, password_hash, status)
          VALUES ($1, $2, 'active')
          RETURNING id
        `,
        [dto.email, passwordHash],
      );

      const [tenantUser] = await queryRunner.query(
        `
          INSERT INTO tenant_user (tenant_id, platform_identity_id, channel, is_active)
          VALUES ($1, $2, 'backoffice', true)
          RETURNING id, channel, is_active
        `,
        [tenantContext.tenantId, identity.id],
      );

      if (dto.profileIds?.length) {
        await this.replaceProfilesInternal(queryRunner, tenantContext, tenantUser.id, dto.profileIds);
      }

      await queryRunner.commitTransaction();

      return {
        id: tenantUser.id,
        email: dto.email,
        channel: tenantUser.channel,
        isActive: tenantUser.is_active,
        tenantSlug: tenant.slug,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(tenantContext: TenantContext, userId: string, dto: UpdateTenantUserDto) {
    const user = await this.getTenantUserOrFail(tenantContext.tenantId, userId);

    if (dto.email && dto.email !== user.email) {
      const duplicate = await this.dataSource.query(
        `
          SELECT pi.id
          FROM platform_identity pi
          WHERE pi.email = $1
            AND pi.id <> $2
        `,
        [dto.email, user.platform_identity_id],
      );

      if (duplicate.length > 0) {
        throw new ConflictException('E-mail já utilizado por outra identidade');
      }

      await this.dataSource.query(
        `UPDATE platform_identity SET email = $1, updated_at = now() WHERE id = $2`,
        [dto.email, user.platform_identity_id],
      );
    }

    return this.getTenantUserOrFail(tenantContext.tenantId, userId);
  }

  async block(tenantContext: TenantContext, userId: string) {
    const user = await this.getTenantUserOrFail(tenantContext.tenantId, userId);
    this.ensureNotSelfManaged(tenantContext, user.id, 'auto-bloqueio não é permitido');

    await this.dataSource.query(
      `UPDATE platform_identity SET status = 'blocked', updated_at = now() WHERE id = $1`,
      [user.platform_identity_id],
    );

    return { id: user.id, status: 'blocked' };
  }

  async unblock(tenantContext: TenantContext, userId: string) {
    const user = await this.getTenantUserOrFail(tenantContext.tenantId, userId);

    await this.dataSource.query(
      `UPDATE platform_identity SET status = 'active', updated_at = now() WHERE id = $1`,
      [user.platform_identity_id],
    );

    return { id: user.id, status: 'active' };
  }

  async inactivate(tenantContext: TenantContext, userId: string) {
    const user = await this.getTenantUserOrFail(tenantContext.tenantId, userId);
    this.ensureNotSelfManaged(tenantContext, user.id, 'auto-inativação não é permitida');

    await this.dataSource.query(
      `UPDATE tenant_user SET is_active = false, updated_at = now() WHERE id = $1`,
      [user.id],
    );

    return { id: user.id, isActive: false };
  }

  async activate(tenantContext: TenantContext, userId: string) {
    const user = await this.getTenantUserOrFail(tenantContext.tenantId, userId);

    await this.dataSource.query(
      `UPDATE tenant_user SET is_active = true, updated_at = now() WHERE id = $1`,
      [user.id],
    );

    return { id: user.id, isActive: true };
  }

  async resetPassword(
    tenantContext: TenantContext,
    userId: string,
    dto: ResetTenantUserPasswordDto,
  ) {
    const user = await this.getTenantUserOrFail(tenantContext.tenantId, userId);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.dataSource.query(
      `UPDATE platform_identity SET password_hash = $1, updated_at = now() WHERE id = $2`,
      [passwordHash, user.platform_identity_id],
    );

    return { id: user.id, passwordReset: true };
  }

  async replaceProfiles(
    tenantContext: TenantContext,
    userId: string,
    profileIds: string[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.replaceProfilesInternal(queryRunner, tenantContext, userId, profileIds);
      await queryRunner.commitTransaction();
      return this.getVisibleProfiles(tenantContext, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getVisibleProfiles(tenantContext: TenantContext, userId: string) {
    await this.getTenantUserOrFail(tenantContext.tenantId, userId);

    const assignedProfiles = await this.dataSource.query(
      `
        SELECT
          tp.id,
          tp.code,
          tp.name,
          tp.is_assignable_by_tenant,
          tup.granted_by_type
        FROM tenant_user_profile tup
        INNER JOIN tenant_profile tp
          ON tp.id = tup.tenant_profile_id
         AND tp.tenant_id = $1
        WHERE tup.tenant_user_id = $2
          AND tup.is_locked_by_platform = false
        ORDER BY tp.name ASC
      `,
      [tenantContext.tenantId, userId],
    );

    const availableProfiles = await this.dataSource.query(
      `
        SELECT id, code, name
        FROM tenant_profile
        WHERE tenant_id = $1
          AND is_active = true
          AND is_assignable_by_tenant = true
          AND code <> 'super-admin'
        ORDER BY name ASC
      `,
      [tenantContext.tenantId],
    );

    return {
      assignedProfiles,
      availableProfiles,
    };
  }

  async getTenantSettings(tenantContext: TenantContext) {
    return this.loadTenantSettings(tenantContext.tenantId);
  }

  async updateTenantSettings(tenantContext: TenantContext, dto: UpdateTenantSettingsDto) {
    if (dto.slug) {
      throw new BadRequestException('Slug não pode ser alterado pelo próprio tenant');
    }

    if (dto.status && dto.status !== 'active') {
      throw new ForbiddenException('O tenant não pode se auto-inativar');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.displayName) {
        await queryRunner.query(
          `UPDATE tenant SET display_name = $1, updated_at = now() WHERE id = $2`,
          [dto.displayName, tenantContext.tenantId],
        );

        await queryRunner.query(
          `
            INSERT INTO tenant_branding (tenant_id, display_name)
            VALUES ($1, $2)
            ON CONFLICT (tenant_id) DO UPDATE
            SET display_name = EXCLUDED.display_name,
                updated_at = now()
          `,
          [tenantContext.tenantId, dto.displayName],
        );
      }

      if (dto.limits) {
        await queryRunner.query(
          `UPDATE tenant SET limits = $1::jsonb, updated_at = now() WHERE id = $2`,
          [JSON.stringify(dto.limits), tenantContext.tenantId],
        );
      }

      if (dto.planCode) {
        const [plan] = await queryRunner.query(
          `SELECT id, code, name FROM plan WHERE code = $1`,
          [dto.planCode],
        );

        if (!plan) {
          throw new BadRequestException('Plano informado não existe');
        }

        await queryRunner.query(
          `
            UPDATE tenant_plan
            SET status = 'inactive',
                ends_at = now()
            WHERE tenant_id = $1
              AND status = 'active'
          `,
          [tenantContext.tenantId],
        );

        await queryRunner.query(
          `
            INSERT INTO tenant_plan (tenant_id, plan_id, status, starts_at)
            VALUES ($1, $2, 'active', now())
          `,
          [tenantContext.tenantId, plan.id],
        );
      }

      if (dto.enabledFeatures) {
        const features = await queryRunner.query(
          `SELECT id, code FROM feature WHERE code = ANY($1)`,
          [dto.enabledFeatures],
        );

        if (features.length !== new Set(dto.enabledFeatures).size) {
          throw new BadRequestException('Feature informada não existe no catálogo global');
        }

        await queryRunner.query(
          `
            UPDATE tenant_feature_override
            SET is_enabled = false
            WHERE tenant_id = $1
          `,
          [tenantContext.tenantId],
        );

        for (const feature of features) {
          await queryRunner.query(
            `
              INSERT INTO tenant_feature_override (tenant_id, feature_id, mode, is_enabled)
              VALUES ($1, $2, 'tenant', true)
              ON CONFLICT (tenant_id, feature_id) DO UPDATE
              SET mode = EXCLUDED.mode,
                  is_enabled = EXCLUDED.is_enabled
            `,
            [tenantContext.tenantId, feature.id],
          );
        }
      }

      await queryRunner.commitTransaction();
      return this.loadTenantSettings(tenantContext.tenantId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async replaceProfilesInternal(
    queryRunner: any,
    tenantContext: TenantContext,
    userId: string,
    profileIds: string[],
  ) {
    const user = await this.getTenantUserOrFail(tenantContext.tenantId, userId, queryRunner);

    const requestedProfileIds = Array.from(new Set(profileIds));

    if (requestedProfileIds.length === 0) {
      throw new ConflictException('Usuário não pode ficar sem perfil ativo');
    }

    const availableProfiles = await queryRunner.query(
      `
        SELECT id, code
        FROM tenant_profile
        WHERE tenant_id = $1
          AND is_active = true
          AND is_assignable_by_tenant = true
      `,
      [tenantContext.tenantId],
    );

    const allowedProfileMap = new Map<string, { id: string; code: string }>(
      availableProfiles
        .filter((profile: { code: string }) => profile.code !== 'super-admin')
        .map((profile: { id: string; code: string }) => [profile.id, profile]),
    );

    const invalidProfileId = requestedProfileIds.find((profileId) => !allowedProfileMap.has(profileId));
    if (invalidProfileId) {
      throw new BadRequestException('Perfil não atribuível pelo tenant');
    }

    await queryRunner.query(
      `
        DELETE FROM tenant_user_profile
        WHERE tenant_user_id = $1
          AND is_locked_by_platform = false
      `,
      [user.id],
    );

    for (const profileId of requestedProfileIds) {
      await queryRunner.query(
        `
          INSERT INTO tenant_user_profile (
            tenant_user_id,
            tenant_profile_id,
            granted_by_type,
            is_locked_by_platform
          )
          VALUES ($1, $2, 'tenant', false)
          ON CONFLICT (tenant_user_id, tenant_profile_id) DO UPDATE
          SET granted_by_type = EXCLUDED.granted_by_type,
              is_locked_by_platform = EXCLUDED.is_locked_by_platform
        `,
        [user.id, profileId],
      );
    }

    const activeProfiles = await this.countActiveProfiles(queryRunner, tenantContext.tenantId, user.id);
    if (activeProfiles === 0) {
      throw new ConflictException('Usuário não pode ficar sem perfil ativo');
    }
  }

  private async countActiveProfiles(queryRunner: any, tenantId: string, userId: string) {
    const [result] = await queryRunner.query(
      `
        SELECT COUNT(*)::int AS total
        FROM tenant_user_profile tup
        INNER JOIN tenant_profile tp
          ON tp.id = tup.tenant_profile_id
         AND tp.tenant_id = $1
         AND tp.is_active = true
        WHERE tup.tenant_user_id = $2
      `,
      [tenantId, userId],
    );

    return Number(result?.total ?? 0);
  }

  private async getTenantUserOrFail(tenantId: string, userId: string, queryRunner = this.dataSource) {
    const rows: TenantUserRow[] = await queryRunner.query(
      `
        SELECT
          tu.id,
          tu.tenant_id,
          tu.platform_identity_id,
          tu.channel,
          tu.is_active,
          pi.email,
          pi.status AS identity_status,
          t.slug AS tenant_slug
        FROM tenant_user tu
        INNER JOIN platform_identity pi
          ON pi.id = tu.platform_identity_id
        INNER JOIN tenant t
          ON t.id = tu.tenant_id
        WHERE tu.tenant_id = $1
          AND tu.id = $2
      `,
      [tenantId, userId],
    );

    const user = rows[0];
    if (!user) {
      throw new NotFoundException('Usuário do tenant não encontrado');
    }

    return user;
  }

  private ensureNotSelfManaged(tenantContext: TenantContext, userId: string, message: string) {
    if (tenantContext.tenantUserId === userId) {
      throw new ForbiddenException(message);
    }
  }

  private async loadTenantSettings(tenantId: string) {
    const [tenant] = await this.dataSource.query(
      `
        SELECT id, slug, display_name, status, limits
        FROM tenant
        WHERE id = $1
      `,
      [tenantId],
    );

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    const [plan] = await this.dataSource.query(
      `
        SELECT p.id, p.code, p.name
        FROM tenant_plan tp
        INNER JOIN plan p
          ON p.id = tp.plan_id
        WHERE tp.tenant_id = $1
          AND tp.status = 'active'
        ORDER BY tp.created_at DESC
        LIMIT 1
      `,
      [tenantId],
    );

    const enabledFeatures = await this.dataSource.query(
      `
        SELECT f.code
        FROM tenant_feature_override tfo
        INNER JOIN feature f
          ON f.id = tfo.feature_id
        WHERE tfo.tenant_id = $1
          AND tfo.is_enabled = true
        ORDER BY f.code ASC
      `,
      [tenantId],
    );

    return {
      tenantId: tenant.id,
      slug: tenant.slug,
      displayName: tenant.display_name,
      status: tenant.status,
      limits: tenant.limits ?? {},
      plan: plan ?? null,
      enabledFeatures: enabledFeatures.map((feature: { code: string }) => feature.code),
    };
  }
}
