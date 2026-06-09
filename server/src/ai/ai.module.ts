import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AuthModule } from '../auth/auth.module';
import { TripsModule } from '../trips/trips.module';

@Module({
  imports: [AuthModule, TripsModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
