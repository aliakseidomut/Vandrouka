import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TripsService } from './trips.service';

// В реальном приложении здесь должен быть guard, который достаёт userId из JWT.
// Пока что принимаем userId в теле/параметрах запроса для упрощения.

@Controller('trips')
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @Post()
  async createTrip(
    @Body()
    body: {
      userId: string;
      city: string;
      attractions: string[];
    },
  ) {
    return this.tripsService.createTrip(body.userId, body.city, body.attractions);
  }

  @Get('user/:userId')
  async getUserTrips(@Param('userId') userId: string) {
    return this.tripsService.getUserTrips(userId);
  }

  @Delete(':tripId')
  async deleteTrip(
    @Param('tripId') tripId: string,
    @Body() body: { userId: string },
  ) {
    return this.tripsService.deleteTrip(body.userId, tripId);
  }
}

