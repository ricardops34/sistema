import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantBranding } from '../tenant-settings/entities/tenant-branding.entity';
import { TenantPersonPolicy } from '../tenant-settings/entities/tenant-person-policy.entity';
import { TenantUser } from '../authorization/entities/tenant-user.entity';
import { TenantRole } from '../authorization/entities/tenant-role.entity';
import { PlatformIdentity } from '../auth/entities/platform-identity.entity';
import { TenantProfileEntity } from '../access-control/entities/tenant-profile.entity';
import { TenantProfileRoutineGrantEntity } from '../access-control/entities/tenant-profile-routine-grant.entity';
import { TenantProfileActionGrantEntity } from '../access-control/entities/tenant-profile-action-grant.entity';
import { TenantUserProfileEntity } from '../access-control/entities/tenant-user-profile.entity';

interface TenantRow { id: string; slug: string; display_name: string; is_active: boolean; created_at: Date }
interface RoleRow { id: string }
interface ProfileRow { id: string }
interface CatalogRoutineRow { id: string }
interface CatalogActionRow { id: string }

@Injectable()
export class OnboardingService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(TenantBranding)
    private brandingRepo: Repository<TenantBranding>,
    @InjectRepository(TenantPersonPolicy)
    private policyRepo: Repository<TenantPersonPolicy>,
    @InjectRepository(TenantUser)
    private tenantUserRepo: Repository<TenantUser>,
    @InjectRepository(TenantRole)
    private tenantRoleRepo: Repository<TenantRole>,
    @InjectRepository(PlatformIdentity)
    private identityRepo: Repository<PlatformIdentity>,
  ) {}

  async createTenant(dto: CreateTenantDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.query(
        `SELECT id FROM "tenant" WHERE slug = $1`,
        [dto.slug],
      );
      if (existing.length > 0) throw new ConflictException('Slug já está em uso');

      const tenantResult: TenantRow[] = await queryRunner.query(
        `INSERT INTO "tenant" ("slug", "display_name") VALUES ($1, $2) RETURNING *`,
        [dto.slug, dto.displayName],
      );
      const tenant = tenantResult[0];

      await queryRunner.query(
        `INSERT INTO "tenant_onboarding" ("tenant_id") VALUES ($1)`,
        [tenant.id],
      );

      const branding = this.brandingRepo.create({ tenantId: tenant.id, displayName: dto.displayName });
      await queryRunner.manager.save(TenantBranding, branding);

      const policy = this.policyRepo.create({ tenantId: tenant.id });
      await queryRunner.manager.save(TenantPersonPolicy, policy);

      const adminRole = this.tenantRoleRepo.create({
        tenantId: tenant.id,
        name: 'Administrador',
        slug: 'admin',
        scopes: [
          '*',
          'people.read',
          'people.create',
          'people.update',
          'people.metadata.read',
          'people.metadata.manage',
          'people.request.read',
          'people.request.create',
        ],
        isSystem: true,
      });
      const savedRole: RoleRow = await queryRunner.manager.save(TenantRole, adminRole);

      let identity = await this.identityRepo.findOne({ where: { email: dto.adminEmail } });
      if (!identity) {
        const hash = await bcrypt.hash(dto.adminPassword ?? 'Mudar@123', 10);
        identity = this.identityRepo.create({ email: dto.adminEmail, passwordHash: hash, status: 'active' });
        identity = await queryRunner.manager.save(PlatformIdentity, identity);
      }

      const tenantUser = this.tenantUserRepo.create({
        tenantId: tenant.id,
        platformIdentityId: identity.id,
        roleId: savedRole.id,
        channel: 'backoffice',
        isActive: true,
      });
      const savedTenantUser = await queryRunner.manager.save(TenantUser, tenantUser);

      const adminProfile = queryRunner.manager.create(TenantProfileEntity, {
        tenantId: tenant.id,
        code: 'admin',
        name: 'Administrador',
        description: 'Perfil administrativo padrão do tenant',
        isSystem: true,
        isActive: true,
      });
      const savedProfile: ProfileRow = await queryRunner.manager.save(TenantProfileEntity, adminProfile);

      const routines: CatalogRoutineRow[] = await queryRunner.query(
        `SELECT id FROM app_routine WHERE is_active = true`,
      );

      if (routines.length > 0) {
        const routineGrants = routines.map((routine) =>
          queryRunner.manager.create(TenantProfileRoutineGrantEntity, {
            tenantProfileId: savedProfile.id,
            appRoutineId: routine.id,
            isAllowed: true,
          }),
        );
        await queryRunner.manager.save(TenantProfileRoutineGrantEntity, routineGrants);
      }

      const actions: CatalogActionRow[] = await queryRunner.query(
        `SELECT id FROM app_routine_action WHERE is_active = true`,
      );

      if (actions.length > 0) {
        const actionGrants = actions.map((action) =>
          queryRunner.manager.create(TenantProfileActionGrantEntity, {
            tenantProfileId: savedProfile.id,
            appRoutineActionId: action.id,
            isAllowed: true,
          }),
        );
        await queryRunner.manager.save(TenantProfileActionGrantEntity, actionGrants);
      }

      const tenantUserProfile = queryRunner.manager.create(TenantUserProfileEntity, {
        tenantUserId: savedTenantUser.id,
        tenantProfileId: savedProfile.id,
      });
      await queryRunner.manager.save(TenantUserProfileEntity, tenantUserProfile);

      await queryRunner.commitTransaction();

      return {
        tenant: { id: tenant.id, slug: tenant.slug, displayName: tenant.display_name },
        adminEmail: dto.adminEmail,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
