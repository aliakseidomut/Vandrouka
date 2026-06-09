import { apiRequest } from "./http";

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  createdAt: string;
  tripsCount: number;
  favoritesCount: number;
};

export class UsersAPI {
  static getMe() {
    return apiRequest<UserProfile>("/users/me");
  }
}
