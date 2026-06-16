import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './audit.interceptor';
import { AuditEvent } from './entities/audit-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditEvent])],
  providers: [AuditService, AuditInterceptor],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
