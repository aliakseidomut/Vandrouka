import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TripsController],
  providers: [TripsService, PrismaService],
  exports: [TripsService],
})
export class TripsModule {}
