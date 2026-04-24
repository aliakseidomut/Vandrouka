import { Platform } from "react-native";
import Constants from "expo-constants";

function getDefaultApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

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

const API_BASE_URL = `${getDefaultApiBaseUrl()}/api`;

export type TripPayload = {
  userId: string;
  city: string;
  attractions: string[];
};

export class TripsAPI {
  static async createTrip(payload: TripPayload) {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Failed to create trip");
    }

    return response.json();
  }

  static async getUserTrips(userId: string) {
    const response = await fetch(`${API_BASE_URL}/trips/user/${userId}`);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Failed to fetch trips");
    }

    return response.json();
  }
}

