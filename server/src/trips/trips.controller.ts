import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @Post()
  async createTrip(
    @CurrentUser() user: AuthenticatedUser,
    @Body()
    body: {
      city: string;
      attractions: string[];
      restaurants?: string[];
      hotel?: string | null;
    },
  ) {
    return this.tripsService.createTrip(
      user.userId,
      body.city,
      body.attractions,
      body.restaurants ?? [],
      body.hotel ?? null,
    );
  }

  @Get()
  async getMyTrips(@CurrentUser() user: AuthenticatedUser) {
    return this.tripsService.getUserTrips(user.userId);
  }

  @Get(':tripId')
  async getTrip(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tripId') tripId: string,
  ) {
    return this.tripsService.getTripById(user.userId, tripId);
  }

  @Delete(':tripId')
  async deleteTrip(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tripId') tripId: string,
  ) {
    return this.tripsService.deleteTrip(user.userId, tripId);
  }
}
