import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async createTrip(userId: string, city: string, attractions: string[]) {
    const trip = await this.prisma.trip.create({
      data: {
        userId,
        city,
        attractions: JSON.stringify(attractions),
      },
    });

    return {
      id: trip.id,
      city: trip.city,
      attractions: JSON.parse(trip.attractions),
      createdAt: trip.createdAt,
    };
  }

  async getUserTrips(userId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return trips.map((trip) => ({
      id: trip.id,
      city: trip.city,
      attractions: JSON.parse(trip.attractions),
      createdAt: trip.createdAt,
    }));
  }

  async deleteTrip(userId: string, tripId: string) {
    const existing = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Trip not found');
    }

    await this.prisma.trip.delete({
      where: { id: existing.id },
    });

    return { success: true };
  }
}

