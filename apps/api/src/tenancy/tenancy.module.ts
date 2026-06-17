import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantContextGuard } from './tenant-context.guard';
import { ChannelGuard } from './channel.guard';
import { ScopesGuard } from '../authorization/scopes.guard';
import { AuthSession } from '../auth/entities/auth-session.entity';
import { TenantUser } from '../authorization/entities/tenant-user.entity';
import { TenantRole } from '../authorization/entities/tenant-role.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthSession, TenantUser, TenantRole]),
    AuthModule,
  ],
  providers: [TenantContextGuard, ChannelGuard, ScopesGuard, Reflector],
  exports: [TenantContextGuard, ChannelGuard, ScopesGuard, TypeOrmModule, AuthModule],
})
export class TenancyModule {}
