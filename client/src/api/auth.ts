import { Platform } from "react-native";
import Constants from "expo-constants";

function getDefaultApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Android эмулятор
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  // Web и iOS-симулятор
  if (Platform.OS === "ios" || Platform.OS === "web") {
    return "http://localhost:3000";
  }

  // Попытка взять IP из dev-конфига Expo (для реального устройства)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) {
      return `http://${host}:3000`;
    }
  }

  return "http://localhost:3000";
}

const API_BASE_URL = `${getDefaultApiBaseUrl()}/api`;

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

  static async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Login failed");
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
