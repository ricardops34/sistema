import { Module } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { CollaboratorsController } from './collaborators.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CollaboratorsController],
  providers: [CollaboratorsService, PrismaService],
})
export class CollaboratorsModule {}
