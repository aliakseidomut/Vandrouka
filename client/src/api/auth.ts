import { apiRequest } from "./http";

export type AuthResponse = {
  id: string;
  email: string;
  token: string;
  name?: string | null;
  picture?: string | null;
};

export class AuthAPI {
  static register(email: string, password: string) {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
  }

  static login(email: string, password: string) {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
  }

  static registerWithGoogle(googleData: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  }) {
    return apiRequest<AuthResponse>("/auth/register-google", {
      method: "POST",
      body: googleData,
      auth: false,
    });
  }
}
