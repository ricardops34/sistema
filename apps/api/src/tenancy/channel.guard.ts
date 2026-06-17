import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOWED_CHANNELS_KEY } from './channel.decorator';

@Injectable()
export class ChannelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedChannels = this.reflector.getAllAndOverride<string[]>(ALLOWED_CHANNELS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowedChannels || allowedChannels.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantContext = request.tenantContext;

    if (!tenantContext) {
      throw new ForbiddenException('Contexto de tenant não encontrado');
    }

    if (!allowedChannels.includes(tenantContext.channel)) {
      throw new ForbiddenException('Canal não autorizado para esta operação');
    }

    return true;
  }
}
