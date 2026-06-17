import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantContext } from '../tenancy/tenant-context.decorator';
import { SCOPES_KEY } from './scopes.decorator';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredScopes || requiredScopes.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const tenantContext = request.tenantContext as TenantContext | undefined;

    if (!tenantContext) throw new ForbiddenException('Contexto de tenant nÃ£o encontrado');

    const hasScope =
      this.hasLegacyScope(requiredScopes, tenantContext) ||
      this.hasResolvedAccess(requiredScopes, tenantContext);

    if (!hasScope) throw new ForbiddenException('PermissÃ£o insuficiente');

    return true;
  }

  private hasLegacyScope(requiredScopes: string[], tenantContext: TenantContext): boolean {
    return (
      tenantContext.scopes.includes('*') ||
      requiredScopes.some((scope) => tenantContext.scopes.includes(scope))
    );
  }

  private hasResolvedAccess(requiredScopes: string[], tenantContext: TenantContext): boolean {
    return requiredScopes.some((scope) => {
      const resolvedRequirement = this.mapScopeToRequirement(scope);
      if (!resolvedRequirement) {
        return false;
      }

      return (
        tenantContext.resolvedAccess.routines.includes(resolvedRequirement.routine) &&
        tenantContext.resolvedAccess.actions.includes(resolvedRequirement.action)
      );
    });
  }

  private mapScopeToRequirement(scope: string): { routine: string; action: string } | null {
    if (!scope || scope === '*') {
      return null;
    }

    if (scope === 'people.metadata.read') {
      return {
        routine: 'people-metadata',
        action: 'people-metadata.metadata.read',
      };
    }

    if (scope === 'people.metadata.manage') {
      return {
        routine: 'people-metadata',
        action: 'people-metadata.metadata.manage',
      };
    }

    const [routine] = scope.split('.');
    if (!routine) {
      return null;
    }

    return {
      routine,
      action: scope,
    };
  }
}
