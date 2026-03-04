const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000") + "/api";

export class AuthAPI {
  static async register(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  }

  static async registerWithGoogle(googleData: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register-google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(googleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Google registration failed");
    }

    return response.json();
  }
}
