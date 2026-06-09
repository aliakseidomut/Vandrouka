import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export type AttractionInput = {
  name: string;
  lat: number;
  lng: number;
};

export type GenerateRouteResult = {
  text: string;
  optimizedOrder: string[];
};

type OsrmTripResponse = {
  code?: string;
  waypoints?: { waypoint_index: number }[];
};

const OSRM_TIMEOUT_MS = 7000;

function haversineMeters(a: AttractionInput, b: AttractionInput): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestNeighbourOrder(input: AttractionInput[]): AttractionInput[] {
  if (input.length < 3) return input;
  const remaining = input.slice(1);
  const ordered: AttractionInput[] = [input[0]];
  let current = input[0];
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = haversineMeters(current, remaining[0]);
    for (let i = 1; i < remaining.length; i++) {
      const d = haversineMeters(current, remaining[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    current = remaining.splice(bestIdx, 1)[0];
    ordered.push(current);
  }
  return ordered;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  private get chatUrl(): string {
    return (
      process.env.AI_UPSTREAM_CHAT_URL ||
      'https://magictext.online/wp-content/plugins/wp-gemini-chat-proxy/unified_gemini_openai_proxy.php/v1/chat/completions'
    );
  }

  private get apiKey(): string {
    return process.env.AI_UPSTREAM_KEY || 'reloadKey';
  }

  private get model(): string {
    return process.env.AI_MODEL || 'gemini-3-flash-preview';
  }

  private get osrmUrl(): string {
    return process.env.OSRM_BASE_URL || 'https://router.project-osrm.org';
  }

  async optimizeOrder(
    attractions: AttractionInput[],
  ): Promise<{ ordered: AttractionInput[]; usedOsrm: boolean }> {
    if (attractions.length < 3) return { ordered: attractions, usedOsrm: false };

    const coords = attractions
      .map((a) => `${a.lng.toFixed(6)},${a.lat.toFixed(6)}`)
      .join(';');
    // foot profile: city tours are pedestrian — driving routes detour over car bridges.
    const url =
      `${this.osrmUrl}/trip/v1/foot/${coords}` +
      `?source=first&roundtrip=false&overview=false`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!res.ok) {
        this.logger.warn(`OSRM trip non-ok: ${res.status}, falling back to nearest-neighbour`);
        return { ordered: nearestNeighbourOrder(attractions), usedOsrm: false };
      }
      const data = (await res.json()) as OsrmTripResponse;
      if (
        data.code !== 'Ok' ||
        !Array.isArray(data.waypoints) ||
        data.waypoints.length !== attractions.length
      ) {
        return { ordered: nearestNeighbourOrder(attractions), usedOsrm: false };
      }

      const indexed = attractions.map((a, i) => ({
        attraction: a,
        pos: data.waypoints![i].waypoint_index,
      }));
      indexed.sort((a, b) => a.pos - b.pos);
      return { ordered: indexed.map((x) => x.attraction), usedOsrm: true };
    } catch (error) {
      const msg = (error as Error).message;
      const reason = controller.signal.aborted ? 'timeout' : msg;
      this.logger.warn(`OSRM trip failed (${reason}), falling back to nearest-neighbour`);
      return { ordered: nearestNeighbourOrder(attractions), usedOsrm: false };
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateRoute(params: {
    cityName: string;
    attractions: AttractionInput[];
  }): Promise<GenerateRouteResult> {
    const { cityName, attractions } = params;

    const { ordered, usedOsrm } = await this.optimizeOrder(attractions);
    const attractionList = ordered
      .map((a, i) => `${i + 1}. ${a.name}`)
      .join('\n');

    const orderHint = usedOsrm
      ? 'Места перечислены в порядке, оптимизированном по реальной пешеходной сети. Сохрани этот порядок — он минимизирует путь.'
      : 'Места перечислены в приблизительном порядке (по близости друг к другу). Можешь незначительно поменять порядок, если это явно сократит маршрут или сгруппирует места по районам.';

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'Ты опытный гид по Беларуси. Составляй подробные, дружелюбные туристические маршруты на русском языке. ' +
          'Форматирование: используй короткие абзацы, заголовки в виде "## Раздел", списки через "- " и нумерацию "1. ". ' +
          'Никаких таблиц, никаких блоков кода, никаких ссылок Markdown.',
      },
      {
        role: 'user',
        content:
          `Составь подробный пешеходный туристический маршрут по городу ${cityName}.\n\n` +
          `Места для посещения:\n${attractionList}\n\n` +
          `${orderHint}\n\n` +
          `Структура ответа (используй заголовки "## Название раздела"):\n` +
          `1. Краткое вступление (2-3 предложения о городе и маршруте).\n` +
          `2. Описание прохождения маршрута с разбивкой по времени дня (утро / день / вечер).\n` +
          `3. Примерное время на каждое место и пешие переходы между ними.\n` +
          `4. Где поесть рядом (1-2 рекомендации).\n` +
          `5. 2-3 практических совета туристу.\n\n` +
          `Пиши простым, живым языком. Можно использовать эмодзи рядом с заголовками.`,
      },
    ];

    const text = await this.chat(messages);
    return { text, optimizedOrder: ordered.map((a) => a.name) };
  }

  async describeAttraction(params: {
    attractionName: string;
    cityName: string;
    userId: string;
    userEmail: string;
  }): Promise<string> {
    const { attractionName, cityName } = params;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'Ты экскурсовод по Беларуси. Рассказываешь интересно, кратко и по делу на русском языке. ' +
          'Форматирование: короткие абзацы, заголовки "## Раздел", списки через "- ". Никаких таблиц и блоков кода.',
      },
      {
        role: 'user',
        content:
          `Расскажи о достопримечательности "${attractionName}" в городе ${cityName}.\n\n` +
          `Включи:\n` +
          `1. Краткую историческую справку (3-4 предложения).\n` +
          `2. 2-3 интересных факта.\n` +
          `3. Совет туристу (что посмотреть рядом, лучшее время).\n\n` +
          `Ответ должен быть до 250 слов.`,
      },
    ];

    return this.chat(messages);
  }

  async followUp(params: {
    cityName: string;
    attractionName?: string | null;
    history: ChatTurn[];
    question: string;
  }): Promise<string> {
    const { cityName, attractionName, history, question } = params;

    const subject = attractionName
      ? `достопримечательность "${attractionName}" в городе ${cityName}`
      : `город ${cityName}`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'Ты опытный AI-гид по Беларуси. Отвечай на уточняющие вопросы туриста кратко, ' +
          'дружелюбно и по делу на русском языке. ' +
          `Тема разговора: ${subject}. ` +
          'Если вопрос вне темы — мягко верни разговор к путешествию по Беларуси. ' +
          'Если не знаешь ответа — честно скажи об этом. ' +
          'Форматирование: короткие абзацы, при необходимости списки через "- ". ' +
          'Не используй таблицы и блоки кода. Ответ обычно укладывай в 120 слов.',
      },
      ...history.slice(-12).map<ChatMessage>((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: question },
    ];

    return this.chat(messages);
  }

  private async chat(messages: ChatMessage[]): Promise<string> {
    let response: Response;

    try {
      response = await fetch(this.chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
        }),
      });
    } catch (error) {
      this.logger.error('AI upstream network error', error as Error);
      throw new BadGatewayException('AI service unavailable');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.error(`AI upstream ${response.status}: ${errorText}`);
      throw new BadGatewayException('AI service returned an error');
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      this.logger.error('AI upstream returned empty content');
      throw new InternalServerErrorException(
        'AI service returned empty content',
      );
    }

    return content;
  }
}
