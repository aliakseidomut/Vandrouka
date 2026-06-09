import { apiRequest } from "./http";
import type { Trip } from "./trips";

export type AiAttractionInput = {
  name: string;
  lat: number;
  lng: number;
};

export type GenerateRouteResponse = {
  aiRoute: string;
  trip: Trip;
  optimizedOrder?: string[];
};

export class AiAPI {
  static generateRoute(payload: {
    tripId: string;
    cityName: string;
    attractions: AiAttractionInput[];
  }) {
    return apiRequest<GenerateRouteResponse>("/ai/generate-route", {
      method: "POST",
      body: payload,
    });
  }

  static describeAttraction(payload: {
    attractionName: string;
    cityName: string;
  }) {
    return apiRequest<{ description: string }>("/ai/describe-attraction", {
      method: "POST",
      body: payload,
    });
  }

  static chat(payload: {
    cityName: string;
    attractionName?: string | null;
    history: { role: "user" | "assistant"; content: string }[];
    question: string;
  }) {
    return apiRequest<{ answer: string }>("/ai/chat", {
      method: "POST",
      body: payload,
    });
  }
}
