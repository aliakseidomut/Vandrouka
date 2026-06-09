import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    return this.favoritesService.list(user.userId);
  }

  @Post()
  async add(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { cityId: string; attractionId: string },
  ) {
    return this.favoritesService.add(
      user.userId,
      body.cityId,
      body.attractionId,
    );
  }

  @Delete(':attractionId')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('attractionId') attractionId: string,
  ) {
    return this.favoritesService.remove(user.userId, attractionId);
  }
}
