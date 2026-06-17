import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { PlatformIdentity } from './entities/platform-identity.entity';
import { AuthSession } from './entities/auth-session.entity';
import { AuthRefreshToken } from './entities/auth-refresh-token.entity';
import { TenantUser } from '../authorization/entities/tenant-user.entity';

type LoginChannel = 'platform' | 'backoffice' | 'portal';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PlatformIdentity)
    private identityRepo: Repository<PlatformIdentity>,
    @InjectRepository(AuthSession)
    private sessionRepo: Repository<AuthSession>,
    @InjectRepository(AuthRefreshToken)
    private refreshTokenRepo: Repository<AuthRefreshToken>,
    @InjectRepository(TenantUser)
    private tenantUserRepo: Repository<TenantUser>,
    private jwtService: JwtService,
    private config: ConfigService,
    private dataSource: DataSource,
  ) {}

  async login(
    login: string,
    password: string,
    channel: LoginChannel = 'platform',
    tenantSlug?: string,
  ) {
    const identity = await this.identityRepo.findOne({ where: { email: login, status: 'active' } });
    if (!identity) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(password, identity.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    let tenantId: string | null = null;

    if (channel !== 'platform') {
      if (!tenantSlug) {
        throw new UnauthorizedException('Tenant é obrigatório para este canal');
      }

      const [tenant] = await this.dataSource.query(
        `SELECT id
         FROM tenant
         WHERE slug = $1
           AND status = 'active'`,
        [tenantSlug],
      );

      if (!tenant) {
        throw new UnauthorizedException('Tenant inválido');
      }

      const tenantUser = await this.tenantUserRepo.findOne({
        where: {
          tenantId: tenant.id,
          platformIdentityId: identity.id,
          channel,
          isActive: true,
        },
      });

      if (!tenantUser) {
        throw new UnauthorizedException('Usuário sem acesso ao tenant neste canal');
      }

      tenantId = tenant.id;
    }

    const session = this.sessionRepo.create({
      platformIdentityId: identity.id,
      tenantId: tenantId ?? undefined,
      channel,
      isActive: true,
    });
    await this.sessionRepo.save(session);

    return this.issueTokens(session.id, identity.id, channel, tenantId);
  }

  async refresh(rawRefreshToken: string) {
    const hash = this.hashToken(rawRefreshToken);
    const token = await this.refreshTokenRepo.findOne({ where: { tokenHash: hash, isRevoked: false } });

    if (!token || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    token.isRevoked = true;
    await this.refreshTokenRepo.save(token);

    const session = await this.sessionRepo.findOne({ where: { id: token.sessionId, isActive: true } });
    if (!session) throw new UnauthorizedException('Sessão inválida');

    return this.issueTokens(
      session.id,
      session.platformIdentityId,
      (session.channel as LoginChannel) ?? 'platform',
      session.tenantId ?? null,
    );
  }

  async logout(rawRefreshToken: string) {
    const hash = this.hashToken(rawRefreshToken);
    await this.refreshTokenRepo.update({ tokenHash: hash }, { isRevoked: true });
  }

  private async issueTokens(
    sessionId: string,
    identityId: string,
    channel: LoginChannel,
    tenantId: string | null,
  ) {
    const payload = { sub: identityId, sid: sessionId, channel, tenantId };
    const expiresIn = this.config.get('JWT_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN', '7d');

    const accessToken = this.jwtService.sign(payload, { expiresIn });

    const rawRefresh = randomBytes(40).toString('hex');
    const refreshExpiresMs = this.parseDuration(refreshExpiresIn);
    const expiresAt = new Date(Date.now() + refreshExpiresMs);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        sessionId,
        tokenHash: this.hashToken(rawRefresh),
        expiresAt,
        isRevoked: false,
      }),
    );

    return {
      accessToken,
      refreshToken: rawRefresh,
      expiresIn: this.parseDurationSeconds(expiresIn),
      sessionId,
      channel,
      tenantId,
    };
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private parseDuration(duration: string): number {
    const map: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 86_400_000;
    return parseInt(match[1], 10) * (map[match[2]] ?? 86_400_000);
  }

  private parseDurationSeconds(duration: string): number {
    return this.parseDuration(duration) / 1000;
  }
}
