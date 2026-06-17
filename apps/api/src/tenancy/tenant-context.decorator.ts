import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface TenantContext {
  tenantId: string;
  tenantUserId: string;
  personId?: string | null;
  identityId: string;
  sessionId: string;
  channel: string;
  scopes: string[];
  resolvedAccess: {
    routines: string[];
    actions: string[];
  };
}

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantContext;
  },
);
