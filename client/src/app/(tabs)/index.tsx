import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TripsAPI } from "@/api/trips";
import CreateTripScreen from "./trips";

type Trip = {
  id: string;
  cityId: string;
  attractionIds: string[];
};

type CityMeta = {
  id: string;
  name: string;
};

const CITIES_META: CityMeta[] = [
  { id: "minsk", name: "Минск" },
  { id: "brest", name: "Брест" },
  { id: "grodno", name: "Гродно" },
];

const MOCK_USER_ID = "mock-user-id";

export default function TripsHomeScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await TripsAPI.getUserTrips(MOCK_USER_ID);
      const normalized: Trip[] = response.map((t: any) => ({
        id: t.id,
        cityId: t.city,
        attractionIds: t.attractions ?? [],
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

  const getCityName = (id: string) =>
    CITIES_META.find((c) => c.id === id)?.name ?? id;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Мои поездки</ThemedText>
          <ThemedText type="small" style={styles.headerSubtitle}>
            Здесь отображаются все сохранённые поездки.
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {trips.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText type="smallBold">
                  Пока нет ни одной поездки
                </ThemedText>
                <ThemedText type="small" style={styles.emptyStateText}>
                  Нажмите на кнопку «+», чтобы спланировать своё первое
                  путешествие.
                </ThemedText>
              </View>
            ) : (
              trips.map((trip) => (
                <View key={trip.id} style={styles.tripCard}>
                  <ThemedText type="smallBold">
                    {getCityName(trip.cityId)}
                  </ThemedText>
                  <ThemedText type="small" style={styles.tripAttractions}>
                    {trip.attractionIds.join(", ")}
                  </ThemedText>
                </View>
              ))
            )}
          </ScrollView>
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            console.log("Trips FAB pressed");
            setCreating(true);
          }}
        >
          <ThemedText type="subtitle" style={styles.fabText}>
            +
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerSubtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 96,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    marginTop: 24,
  },
  emptyStateText: {
    marginTop: 4,
    opacity: 0.7,
  },
  tripCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  tripAttractions: {
    marginTop: 4,
    opacity: 0.9,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabText: {
    color: "#fff",
    lineHeight: 44,
  },
});

