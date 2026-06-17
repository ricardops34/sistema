import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.slice(7);
    let payload: { sub: string; sid: string; channel?: string };

    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET', 'change-me-in-production'),
      });
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const [session] = await this.dataSource.query(
      `
        SELECT id, channel, platform_identity_id
        FROM auth_session
        WHERE id = $1
          AND is_active = true
      `,
      [payload.sid],
    );

    if (!session || session.channel !== 'platform') {
      throw new UnauthorizedException('Sessão global inválida');
    }

    const [identity] = await this.dataSource.query(
      `
        SELECT id, email, status
        FROM platform_identity
        WHERE id = $1
      `,
      [payload.sub],
    );

    if (!identity || identity.status !== 'active') {
      throw new UnauthorizedException('Identidade global inválida');
    }

    request.superAdminContext = {
      identityId: identity.id,
      email: identity.email,
      sessionId: session.id,
    };

    return true;
  }
}
