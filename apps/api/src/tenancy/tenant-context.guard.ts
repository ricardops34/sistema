import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthSession } from '../auth/entities/auth-session.entity';
import { TenantUser } from '../authorization/entities/tenant-user.entity';
import { TenantRole } from '../authorization/entities/tenant-role.entity';

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    @InjectRepository(AuthSession)
    private sessionRepo: Repository<AuthSession>,
    @InjectRepository(TenantUser)
    private tenantUserRepo: Repository<TenantUser>,
    @InjectRepository(TenantRole)
    private tenantRoleRepo: Repository<TenantRole>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.slice(7);
    let payload: { sub: string; sid: string };

    try {
      payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET', 'change-me-in-production'),
      });
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const session = await this.sessionRepo.findOne({
      where: { id: payload.sid, isActive: true },
    });

    if (!session) throw new UnauthorizedException('Sessão inválida');

    const tenantId = session.tenantId ?? request.headers['x-tenant-id'];
    if (!tenantId) {
      throw new UnauthorizedException('Tenant não identificado');
    }

    const tenantUser = await this.tenantUserRepo.findOne({
      where: {
        tenantId,
        platformIdentityId: payload.sub,
        isActive: true,
      },
    });

    if (!tenantUser) throw new UnauthorizedException('Usuário sem acesso ao tenant');

    let scopes: string[] = [];
    if (tenantUser.roleId) {
      const role = await this.tenantRoleRepo.findOne({ where: { id: tenantUser.roleId } });
      scopes = role?.scopes ?? [];
    }

    request.tenantContext = {
      tenantId,
      tenantUserId: tenantUser.id,
      identityId: payload.sub,
      sessionId: payload.sid,
      channel: session.channel,
      scopes,
    };

    return true;
  }
}
