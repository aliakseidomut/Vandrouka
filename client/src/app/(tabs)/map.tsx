import React, { useCallback, useMemo, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  getAttractionsByIds,
  getCityById,
  getHotelById,
  getRestaurantsByIds,
} from "@/constants/cities";
import { MapWithMarkers } from "@/components/map-with-markers";

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cityId?: string;
    attractionIds?: string;
    restaurantIds?: string;
    hotelId?: string;
  }>();

  const city = useMemo(
    () => (params.cityId ? getCityById(params.cityId) : undefined),
    [params.cityId],
  );

  const attractions = useMemo(() => {
    if (!city) return [];
    const ids = params.attractionIds ? params.attractionIds.split(",").filter(Boolean) : [];
    return getAttractionsByIds(city, ids);
  }, [city, params.attractionIds]);

  const restaurants = useMemo(() => {
    if (!city) return [];
    const ids = params.restaurantIds ? params.restaurantIds.split(",").filter(Boolean) : [];
    return getRestaurantsByIds(city, ids);
  }, [city, params.restaurantIds]);

  const hotel = useMemo(
    () => (city ? getHotelById(city, params.hotelId ?? null) : null),
    [city, params.hotelId],
  );

  const [optimizedOrder, setOptimizedOrder] = useState<number[] | null>(null);

  const orderedAttractions = useMemo(() => {
    if (!optimizedOrder || optimizedOrder.length !== attractions.length) {
      return attractions;
    }
    return optimizedOrder
      .map((i) => attractions[i])
      .filter((a): a is NonNullable<typeof a> => Boolean(a));
  }, [attractions, optimizedOrder]);

  const handleOrderChange = useCallback((next: number[]) => {
    setOptimizedOrder(next);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <ThemedText type="smallBold">Маршрут на карте</ThemedText>
            <ThemedText type="small" style={styles.headerMeta}>
              {city
                ? `${city.name} · ${attractions.length} точек` +
                  (restaurants.length > 0 ? ` · ${restaurants.length} кафе` : "") +
                  (hotel ? " · отель" : "")
                : "Город не выбран"}
            </ThemedText>
          </View>
          <View style={styles.backButton} />
        </View>

        {city ? (
          <>
            <MapWithMarkers
              city={city}
              attractions={attractions}
              restaurants={restaurants}
              hotel={hotel}
              onOrderChange={handleOrderChange}
            />

            <View style={styles.typeLegend}>
              <View style={styles.typeLegendRow}>
                <View style={[styles.typeDot, styles.typeDotAttraction]} />
                <ThemedText type="small" style={styles.typeLegendText}>
                  Достопримечательности
                </ThemedText>
              </View>
              {restaurants.length > 0 && (
                <View style={styles.typeLegendRow}>
                  <View style={[styles.typeSquare, styles.typeSquareFood]} />
                  <ThemedText type="small" style={styles.typeLegendText}>
                    Кафе и рестораны
                  </ThemedText>
                </View>
              )}
              {hotel && (
                <View style={styles.typeLegendRow}>
                  <View style={[styles.typeSquare, styles.typeSquareHotel]} />
                  <ThemedText type="small" style={styles.typeLegendText}>
                    Отель
                  </ThemedText>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <ThemedText type="small">Не удалось загрузить карту</ThemedText>
          </View>
        )}

        {orderedAttractions.length > 0 && Platform.OS !== "web" && (
          <View style={styles.legend}>
            {orderedAttractions.map((a, i) => (
              <View key={a.id} style={styles.legendRow}>
                <View style={styles.legendBadge}>
                  <ThemedText type="small" style={styles.legendBadgeText}>
                    {i + 1}
                  </ThemedText>
                </View>
                <ThemedText type="small" style={styles.legendName} numberOfLines={1}>
                  {a.name}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerText: { flex: 1, alignItems: "center" },
  headerMeta: { color: "#64748B", marginTop: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  legend: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: 220,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  legendBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#0F766E",
    alignItems: "center",
    justifyContent: "center",
  },
  legendBadgeText: { color: "#FFFFFF", fontSize: 12 },
  legendName: { flex: 1, color: "#1F2937" },
  typeLegend: {
    position: "absolute",
    top: 12,
    left: 12,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 4,
  },
  typeLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  typeDotAttraction: { backgroundColor: "#0F766E" },
  typeSquare: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  typeSquareFood: { backgroundColor: "#C2410C" },
  typeSquareHotel: { backgroundColor: "#4338CA" },
  typeLegendText: { color: "#1F2937", fontSize: 12 },
});
