import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getStats(userId: string) {
    const [tripsCount, favoritesCount] = await this.prisma.$transaction([
      this.prisma.trip.count({ where: { userId } }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    return { tripsCount, favoritesCount };
  }
}
