import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { PlatformIdentity } from './entities/platform-identity.entity';
import { AuthSession } from './entities/auth-session.entity';
import { AuthRefreshToken } from './entities/auth-refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PlatformIdentity)
    private identityRepo: Repository<PlatformIdentity>,
    @InjectRepository(AuthSession)
    private sessionRepo: Repository<AuthSession>,
    @InjectRepository(AuthRefreshToken)
    private refreshTokenRepo: Repository<AuthRefreshToken>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(login: string, password: string) {
    const identity = await this.identityRepo.findOne({ where: { email: login, status: 'active' } });
    if (!identity) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(password, identity.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const session = this.sessionRepo.create({
      platformIdentityId: identity.id,
      channel: 'backoffice',
      isActive: true,
    });
    await this.sessionRepo.save(session);

    return this.issueTokens(session.id, identity.id);
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

    return this.issueTokens(session.id, session.platformIdentityId);
  }

  async logout(rawRefreshToken: string) {
    const hash = this.hashToken(rawRefreshToken);
    await this.refreshTokenRepo.update({ tokenHash: hash }, { isRevoked: true });
  }

  private async issueTokens(sessionId: string, identityId: string) {
    const payload = { sub: identityId, sid: sessionId };
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

    return { accessToken, refreshToken: rawRefresh, expiresIn: this.parseDurationSeconds(expiresIn) };
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
