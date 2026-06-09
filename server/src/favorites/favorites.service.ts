import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, cityId: string, attractionId: string) {
    const existing = await this.prisma.favorite.findFirst({
      where: { userId, attractionId },
    });

    if (existing) {
      throw new ConflictException('Already in favorites');
    }

    return this.prisma.favorite.create({
      data: { userId, cityId, attractionId },
    });
  }

  async remove(userId: string, attractionId: string) {
    const existing = await this.prisma.favorite.findFirst({
      where: { userId, attractionId },
    });

    if (!existing) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({ where: { id: existing.id } });
    return { success: true };
  }
}
