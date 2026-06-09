import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async createTrip(
    userId: string,
    city: string,
    attractions: string[],
    restaurants: string[] = [],
    hotel: string | null = null,
  ) {
    const trip = await this.prisma.trip.create({
      data: {
        userId,
        city,
        attractions: JSON.stringify(attractions),
        restaurants: JSON.stringify(restaurants),
        hotel: hotel ?? null,
      },
    });

    return this.normalize(trip);
  }

  async getUserTrips(userId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return trips.map((trip) => this.normalize(trip));
  }

  async getTripById(userId: string, tripId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return this.normalize(trip);
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

  async saveAiRoute(userId: string, tripId: string, aiRoute: string) {
    const existing = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Trip not found');
    }

    const updated = await this.prisma.trip.update({
      where: { id: existing.id },
      data: { aiRoute },
    });

    return this.normalize(updated);
  }

  private parseStringArray(value: string | null | undefined): string[] {
    if (!value) return [];
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === 'string');
      }
    } catch {
      // fallthrough to empty
    }
    return [];
  }

  private normalize(trip: {
    id: string;
    city: string;
    attractions: string;
    restaurants?: string | null;
    hotel?: string | null;
    aiRoute: string | null;
    createdAt: Date;
  }) {
    return {
      id: trip.id,
      city: trip.city,
      attractions: this.parseStringArray(trip.attractions),
      restaurants: this.parseStringArray(trip.restaurants),
      hotel: trip.hotel ?? null,
      aiRoute: trip.aiRoute,
      createdAt: trip.createdAt,
    };
  }
}
