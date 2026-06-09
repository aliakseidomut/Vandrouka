import { Platform } from "react-native";
import Constants from "expo-constants";
import { session } from "@/utils/session";

function getDefaultApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Android emulator routes host machine's localhost via 10.0.2.2.
  // Physical Android device via USB → run `adb reverse tcp:3000 tcp:3000` then set
  // EXPO_PUBLIC_API_URL=http://localhost:3000 (or use LAN IP).
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  if (Platform.OS === "ios" || Platform.OS === "web") {
    return "http://localhost:3000";
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) {
      return `http://${host}:3000`;
    }
  }

  return "http://localhost:3000";
}

export const API_BASE_URL = `${getDefaultApiBaseUrl()}/api`;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = session.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    throw new Error(
      error instanceof Error ? `Network error: ${error.message}` : "Network error",
    );
  }

  if (response.status === 401 && auth) {
    void session.clear();
    throw new Error("Unauthorized");
  }

  let data: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      (data as { message?: string | string[] })?.message ?? response.statusText;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return data as T;
}
