import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

const AUDITABLE_ACTIONS: Record<string, string> = {
  'POST /people': 'person.create',
  'PATCH /people': 'person.update',
  'POST /people-requests': 'person_update_request.create',
  'POST /onboarding/tenants': 'tenant.create',
  'POST /auth/login': 'auth.login',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const urlBase = request.url.split('?')[0].replace(/\/[0-9a-f-]{36}/gi, '');
    const key = `${method} ${urlBase}`;
    const action = AUDITABLE_ACTIONS[key];

    return next.handle().pipe(
      tap((data) => {
        if (!action) return;
        const ctx = request.tenantContext;
        this.auditService.log({
          tenantId: ctx?.tenantId,
          actorIdentityId: ctx?.identityId,
          tenantUserId: ctx?.tenantUserId,
          action,
          resourceType: urlBase.replace('/', '').split('/')[0],
          resourceId: typeof data === 'object' && data !== null && 'id' in data ? String((data as { id: unknown }).id) : undefined,
          payload: undefined,
          ipAddress: request.ip,
        });
      }),
    );
  }
}
