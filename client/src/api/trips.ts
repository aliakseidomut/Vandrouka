import { apiRequest } from "./http";

export type Trip = {
  id: string;
  city: string;
  attractions: string[];
  restaurants: string[];
  hotel: string | null;
  aiRoute: string | null;
  createdAt: string;
};

export type CreateTripPayload = {
  city: string;
  attractions: string[];
  restaurants?: string[];
  hotel?: string | null;
};

export class TripsAPI {
  static createTrip(payload: CreateTripPayload) {
    return apiRequest<Trip>("/trips", {
      method: "POST",
      body: payload,
    });
  }

  static getMyTrips() {
    return apiRequest<Trip[]>("/trips");
  }

  static getTrip(tripId: string) {
    return apiRequest<Trip>(`/trips/${tripId}`);
  }

  static deleteTrip(tripId: string) {
    return apiRequest<{ success: boolean }>(`/trips/${tripId}`, {
      method: "DELETE",
    });
  }
}
