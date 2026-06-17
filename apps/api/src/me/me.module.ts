import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { TenancyModule } from '../tenancy/tenancy.module';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [TenancyModule, AccessControlModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
