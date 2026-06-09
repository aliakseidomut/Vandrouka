import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AiService, type AttractionInput, type ChatTurn } from './ai.service';
import { TripsService } from '../trips/trips.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

type GenerateRouteDto = {
  tripId: string;
  cityName: string;
  attractions: AttractionInput[];
};

type DescribeAttractionDto = {
  attractionName: string;
  cityName: string;
};

type ChatDto = {
  cityName: string;
  attractionName?: string | null;
  history?: ChatTurn[];
  question: string;
};

function isChatTurn(value: unknown): value is ChatTurn {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === 'user' || v.role === 'assistant') &&
    typeof v.content === 'string' &&
    v.content.trim().length > 0
  );
}

function isValidAttraction(value: unknown): value is AttractionInput {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    v.name.trim().length > 0 &&
    typeof v.lat === 'number' &&
    Number.isFinite(v.lat) &&
    typeof v.lng === 'number' &&
    Number.isFinite(v.lng)
  );
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private aiService: AiService,
    private tripsService: TripsService,
  ) {}

  @Post('generate-route')
  async generateRoute(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: GenerateRouteDto,
  ) {
    if (!body?.tripId || !body?.cityName || !Array.isArray(body.attractions)) {
      throw new BadRequestException(
        'tripId, cityName, attractions are required',
      );
    }
    if (body.attractions.length === 0) {
      throw new BadRequestException('attractions list is empty');
    }
    if (!body.attractions.every(isValidAttraction)) {
      throw new BadRequestException(
        'each attraction must have name, lat, lng',
      );
    }

    const { text, optimizedOrder } = await this.aiService.generateRoute({
      cityName: body.cityName,
      attractions: body.attractions,
    });

    const trip = await this.tripsService.saveAiRoute(
      user.userId,
      body.tripId,
      text,
    );
    return { aiRoute: text, trip, optimizedOrder };
  }

  @Post('describe-attraction')
  async describeAttraction(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: DescribeAttractionDto,
  ) {
    if (!body?.attractionName || !body?.cityName) {
      throw new BadRequestException('attractionName and cityName are required');
    }

    const description = await this.aiService.describeAttraction({
      attractionName: body.attractionName,
      cityName: body.cityName,
      userId: user.userId,
      userEmail: user.email,
    });

    return { description };
  }

  @Post('chat')
  async chat(@Body() body: ChatDto) {
    if (!body?.cityName || typeof body.cityName !== 'string') {
      throw new BadRequestException('cityName is required');
    }
    if (!body?.question || typeof body.question !== 'string') {
      throw new BadRequestException('question is required');
    }
    const question = body.question.trim();
    if (!question) {
      throw new BadRequestException('question is empty');
    }
    if (question.length > 1000) {
      throw new BadRequestException('question is too long');
    }

    const history = Array.isArray(body.history)
      ? body.history.filter(isChatTurn)
      : [];

    const answer = await this.aiService.followUp({
      cityName: body.cityName,
      attractionName: body.attractionName ?? null,
      history,
      question,
    });

    return { answer };
  }
}
