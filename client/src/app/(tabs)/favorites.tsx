import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WikiImage } from "@/components/wiki-image";
import { FavoritesAPI } from "@/api/favorites";
import { TripsAPI } from "@/api/trips";
import { findAttractionById, getCityById, type City } from "@/constants/cities";

type FavoriteEntry = {
  id: string;
  cityId: string;
  attractionId: string;
};

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const list = await FavoritesAPI.list();
      setFavorites(
        list.map((f) => ({
          id: f.id,
          cityId: f.cityId,
          attractionId: f.attractionId,
        })),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const grouped = useMemo(() => {
    const map = new Map<string, FavoriteEntry[]>();
    for (const fav of favorites) {
      const arr = map.get(fav.cityId) ?? [];
      arr.push(fav);
      map.set(fav.cityId, arr);
    }
    return Array.from(map.entries())
      .map(([cityId, items]) => ({ city: getCityById(cityId), items }))
      .filter((g): g is { city: City; items: FavoriteEntry[] } => Boolean(g.city));
  }, [favorites]);

  const handleRemove = async (attractionId: string) => {
    try {
      await FavoritesAPI.remove(attractionId);
      setFavorites((prev) => prev.filter((f) => f.attractionId !== attractionId));
    } catch (error) {
      Alert.alert("Ошибка", error instanceof Error ? error.message : "Не удалось удалить");
    }
  };

  const handleCreateTrip = async (cityId: string, items: FavoriteEntry[]) => {
    try {
      setCreating(cityId);
      await TripsAPI.createTrip({
        city: cityId,
        attractions: items.map((i) => i.attractionId),
      });
      Alert.alert("Готово", "Поездка создана из избранного", [
        { text: "OK", onPress: () => router.push("/(tabs)") },
      ]);
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось создать поездку",
      );
    } finally {
      setCreating(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Избранное
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Сохраненные места для будущих маршрутов
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#111827" />
          </View>
        ) : grouped.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={26} color="#EF4444" />
            </View>
            <ThemedText type="smallBold">Пока пусто</ThemedText>
            <ThemedText type="small" style={styles.emptyStateText}>
              Отмечайте сердечком интересные места при создании поездки.
            </ThemedText>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {grouped.map(({ city, items }) => (
              <View key={city.id} style={styles.group}>
                <View style={styles.groupHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="smallBold" style={styles.cityName}>
                      {city.name}
                    </ThemedText>
                    <ThemedText type="small" style={styles.cityMeta}>
                      {city.region} · {items.length} мест
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.createButton,
                      creating === city.id && styles.createButtonDisabled,
                    ]}
                    onPress={() => handleCreateTrip(city.id, items)}
                    disabled={creating === city.id}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add" size={14} color="#FFFFFF" />
                    <ThemedText type="small" style={styles.createButtonText}>
                      Поездка
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {items.map((item) => {
                  const found = findAttractionById(item.cityId, item.attractionId);
                  if (!found) return null;
                  return (
                    <View key={item.id} style={styles.attractionRow}>
                      <WikiImage
                        kind="attraction"
                        uri={found.attraction.imageUrl}
                        query={`${found.attraction.name} ${found.city.name}`}
                        style={styles.attractionImage}
                      />
                      <ThemedText type="smallBold" style={styles.attractionName}>
                        {found.attraction.name}
                      </ThemedText>
                      <TouchableOpacity
                        onPress={() => handleRemove(item.attractionId)}
                        hitSlop={8}
                      >
                        <Ionicons name="heart" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 },
  title: { fontSize: 30, lineHeight: 36 },
  subtitle: { marginTop: 3, color: "#64748B" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: {
    margin: 16,
    minHeight: 280,
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
    backgroundColor: "#FEE2E2",
  },
  emptyStateText: { marginTop: 6, color: "#64748B", textAlign: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  group: {
    marginBottom: 18,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cityName: { fontSize: 16 },
  cityMeta: { marginTop: 2, color: "#64748B" },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#111827",
  },
  createButtonDisabled: { opacity: 0.5 },
  createButtonText: { color: "#FFFFFF" },
  attractionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  attractionImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  attractionName: { flex: 1 },
});
