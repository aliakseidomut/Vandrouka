import { apiRequest } from "./http";

export type Favorite = {
  id: string;
  userId: string;
  cityId: string;
  attractionId: string;
  createdAt: string;
};

export class FavoritesAPI {
  static list() {
    return apiRequest<Favorite[]>("/favorites");
  }

  static add(cityId: string, attractionId: string) {
    return apiRequest<Favorite>("/favorites", {
      method: "POST",
      body: { cityId, attractionId },
    });
  }

  static remove(attractionId: string) {
    return apiRequest<{ success: boolean }>(`/favorites/${attractionId}`, {
      method: "DELETE",
    });
  }
}
