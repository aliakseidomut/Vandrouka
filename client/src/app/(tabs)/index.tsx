import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WikiImage } from "@/components/wiki-image";
import { TripsAPI } from "@/api/trips";
import { TripDetailScreen } from "@/components/trip-detail-screen";
import CreateTripScreen from "./trips";

import { CITIES, getCityById } from "@/constants/cities";

type Trip = {
  id: string;
  cityId: string;
  attractionIds: string[];
  restaurantIds: string[];
  hotelId: string | null;
  aiRoute: string | null;
};

function pluralPlaces(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "место";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "места";
  return "мест";
}

export default function TripsHomeScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await TripsAPI.getMyTrips();
      const normalized: Trip[] = response.map((t) => ({
        id: t.id,
        cityId: t.city,
        attractionIds: t.attractions ?? [],
        restaurantIds: t.restaurants ?? [],
        hotelId: t.hotel ?? null,
        aiRoute: t.aiRoute ?? null,
      }));
      setTrips(normalized);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const totalAttractions = useMemo(
    () => CITIES.reduce((sum, city) => sum + city.attractions.length, 0),
    [],
  );

  if (creating) {
    return (
      <CreateTripScreen
        onDone={() => {
          setCreating(false);
          loadTrips();
        }}
      />
    );
  }

  if (selectedTrip) {
    return (
      <TripDetailScreen
        trip={selectedTrip}
        onBack={() => {
          setSelectedTrip(null);
          loadTrips();
        }}
        onDeleted={() => {
          setSelectedTrip(null);
          loadTrips();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View>
            <ThemedText type="subtitle" style={styles.title}>
              Маршруты
            </ThemedText>
            <ThemedText type="small" style={styles.headerSubtitle}>
              Беларусь: {CITIES.length} городов и {totalAttractions} мест в базе
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => setCreating(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#111827" />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {trips.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="map-outline" size={26} color="#0F766E" />
                </View>
                <ThemedText type="smallBold">Пока нет поездок</ThemedText>
                <ThemedText type="small" style={styles.emptyStateText}>
                  Создайте первый маршрут и выберите достопримечательности из расширенной базы городов.
                </ThemedText>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => setCreating(true)}
                  activeOpacity={0.8}
                >
                  <ThemedText type="smallBold" style={styles.emptyButtonText}>
                    Создать маршрут
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tripList}>
                {trips.map((trip) => {
                  const city = getCityById(trip.cityId);
                  return (
                    <TouchableOpacity
                      key={trip.id}
                      style={styles.tripCard}
                      onPress={() => setSelectedTrip(trip)}
                      activeOpacity={0.75}
                    >
                      {city && (
                        <WikiImage
                          kind="city"
                          uri={city.imageUrl}
                          query={`${city.name} город`}
                          style={styles.tripImage}
                        />
                      )}
                      <View style={styles.tripInfo}>
                        <ThemedText type="smallBold">
                          {city?.name ?? trip.cityId}
                        </ThemedText>
                        <ThemedText type="small" style={styles.tripMeta}>
                          {city?.region ?? "Беларусь"}
                        </ThemedText>
                        <View style={styles.tripFooter}>
                          <ThemedText type="small" style={styles.tripAttractions}>
                            {trip.attractionIds.length} {pluralPlaces(trip.attractionIds.length)}
                          </ThemedText>
                          {trip.aiRoute && (
                            <View style={styles.aiBadge}>
                              <Ionicons name="sparkles" size={11} color="#7C3AED" />
                              <ThemedText type="small" style={styles.aiBadgeText}>
                                AI маршрут
                              </ThemedText>
                            </View>
                          )}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
  },
  headerSubtitle: {
    marginTop: 3,
    color: "#64748B",
  },
  headerAction: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    backgroundColor: "#CCFBF1",
  },
  emptyStateText: {
    marginTop: 6,
    color: "#64748B",
    textAlign: "center",
  },
  emptyButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  emptyButtonText: {
    color: "#FFFFFF",
  },
  tripList: {
    gap: 10,
  },
  tripCard: {
    minHeight: 94,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tripImage: {
    width: 74,
    height: 74,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  tripInfo: {
    flex: 1,
    minWidth: 0,
  },
  tripMeta: {
    marginTop: 2,
    color: "#64748B",
  },
  tripAttractions: {
    color: "#0F766E",
  },
  tripFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#F3E8FF",
  },
  aiBadgeText: {
    color: "#7C3AED",
    fontSize: 11,
  },
});
