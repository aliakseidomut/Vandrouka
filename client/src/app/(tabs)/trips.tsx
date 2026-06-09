import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WikiImage } from "@/components/wiki-image";
import { TripsAPI } from "@/api/trips";
import { FavoritesAPI } from "@/api/favorites";
import { CITIES } from "@/constants/cities";

type CreateTripScreenProps = {
  onDone?: () => void;
  initialCityId?: string | null;
  initialAttractionIds?: string[];
};

export default function CreateTripScreen({
  onDone,
  initialCityId = null,
  initialAttractionIds,
}: CreateTripScreenProps) {
  const router = useRouter();

  const [selectedCityId, setSelectedCityId] = useState<string | null>(initialCityId);
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>(
    initialAttractionIds ?? [],
  );
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [attractionSearch, setAttractionSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"city" | "attractions" | "extras">(
    initialCityId ? "attractions" : "city",
  );
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const loadFavorites = useCallback(async () => {
    try {
      const favs = await FavoritesAPI.list();
      setFavoriteIds(new Set(favs.map((f) => f.attractionId)));
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = async (attractionId: string, cityId: string) => {
    const isFav = favoriteIds.has(attractionId);
    const next = new Set(favoriteIds);
    if (isFav) {
      next.delete(attractionId);
    } else {
      next.add(attractionId);
    }
    setFavoriteIds(next);
    try {
      if (isFav) {
        await FavoritesAPI.remove(attractionId);
      } else {
        await FavoritesAPI.add(cityId, attractionId);
      }
    } catch {
      setFavoriteIds(favoriteIds);
    }
  };

  const selectedCity = CITIES.find((c) => c.id === selectedCityId) ?? null;

  const filteredCities = useMemo(() => {
    const term = citySearch.toLowerCase().trim();
    if (!term) return CITIES;

    return CITIES.filter((city) =>
      [city.name, city.country, city.region, city.description]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [citySearch]);

  const filteredAttractions = useMemo(() => {
    const term = attractionSearch.toLowerCase().trim();
    const attractions = selectedCity?.attractions ?? [];
    if (!term) return attractions;

    return attractions.filter((attraction) =>
      attraction.name.toLowerCase().includes(term),
    );
  }, [attractionSearch, selectedCity]);

  const toggleAttraction = (id: string) => {
    setSelectedAttractions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const toggleRestaurant = (id: string) => {
    setSelectedRestaurants((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const toggleHotel = (id: string) => {
    setSelectedHotel((prev) => (prev === id ? null : id));
  };

  const handleNextFromCity = () => {
    if (!selectedCityId) {
      Alert.alert("Ошибка", "Выберите город");
      return;
    }

    setStep("attractions");
  };

  const handleNextFromAttractions = () => {
    if (selectedAttractions.length === 0) {
      Alert.alert("Ошибка", "Выберите хотя бы одну достопримечательность");
      return;
    }

    setStep("extras");
  };

  const handleCreateTrip = async () => {
    if (!selectedCityId) {
      Alert.alert("Ошибка", "Выберите город");
      return;
    }
    if (selectedAttractions.length === 0) {
      Alert.alert("Ошибка", "Выберите хотя бы одну достопримечательность");
      return;
    }

    try {
      setSaving(true);

      await TripsAPI.createTrip({
        city: selectedCityId,
        attractions: selectedAttractions,
        restaurants: selectedRestaurants,
        hotel: selectedHotel,
      });

      Alert.alert("Готово", "Поездка сохранена", [
        {
          text: "OK",
          onPress: () => {
            if (onDone) {
              onDone();
            } else {
              router.back();
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось сохранить поездку",
      );
    } finally {
      setSaving(false);
    }
  };

  const canContinue =
    step === "city"
      ? Boolean(selectedCityId)
      : step === "attractions"
        ? selectedAttractions.length > 0
        : true;

  const handlePrimaryPress =
    step === "city"
      ? handleNextFromCity
      : step === "attractions"
        ? handleNextFromAttractions
        : handleCreateTrip;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          {step !== "city" ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setStep(step === "extras" ? "attractions" : "city")}
              activeOpacity={0.75}
            >
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButtonPlaceholder} />
          )}

          <View style={styles.headerText}>
            <ThemedText type="smallBold">
              {step === "city" ? "Новая поездка" : selectedCity?.name}
            </ThemedText>
            <ThemedText type="small" style={styles.headerMeta}>
              {step === "city"
                ? `${CITIES.length} городов Беларуси`
                : step === "attractions"
                  ? `${selectedAttractions.length} выбрано из ${selectedCity?.attractions.length ?? 0}`
                  : `${selectedRestaurants.length} кафе · ${selectedHotel ? "отель выбран" : "без отеля"}`}
            </ThemedText>
          </View>

          <View style={styles.iconButtonPlaceholder} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === "city" && (
            <>
              <ThemedText type="subtitle" style={styles.title}>
                Куда едем?
              </ThemedText>
              <ThemedText type="small" style={styles.subtitle}>
                Выберите город, а затем отметьте места для маршрута.
              </ThemedText>

              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#6B7280" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Город, область или тема"
                  placeholderTextColor="#9CA3AF"
                  value={citySearch}
                  onChangeText={setCitySearch}
                />
              </View>

              <View style={styles.list}>
                {filteredCities.map((city) => {
                  const isSelected = selectedCityId === city.id;
                  return (
                    <TouchableOpacity
                      key={city.id}
                      style={[styles.cityRow, isSelected && styles.rowSelected]}
                      onPress={() => {
                        setSelectedCityId(city.id);
                        setSelectedAttractions([]);
                        setSelectedRestaurants([]);
                        setSelectedHotel(null);
                        setAttractionSearch("");
                      }}
                      activeOpacity={0.75}
                    >
                      <WikiImage
                        kind="city"
                        uri={city.imageUrl}
                        query={`${city.name} город`}
                        style={styles.rowImage}
                      />
                      <View style={styles.rowContent}>
                        <View style={styles.rowTitleLine}>
                          <ThemedText type="smallBold" style={styles.rowTitle}>
                            {city.name}
                          </ThemedText>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={20} color="#0F766E" />
                          )}
                        </View>
                        <ThemedText type="small" style={styles.rowMeta}>
                          {city.region} · {city.attractions.length} мест
                        </ThemedText>
                        <ThemedText type="small" style={styles.rowDescription} numberOfLines={2}>
                          {city.description}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {step === "attractions" && selectedCity && (
            <>
              <WikiImage
                kind="city"
                uri={selectedCity.imageUrl}
                query={`${selectedCity.name} город`}
                style={styles.heroImage}
              />
              <ThemedText type="subtitle" style={styles.title}>
                Места в маршруте
              </ThemedText>
              <ThemedText type="small" style={styles.subtitle}>
                Отметьте основные достопримечательности, которые хотите посетить в городе {selectedCity.name}.
              </ThemedText>

              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#6B7280" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Найти достопримечательность"
                  placeholderTextColor="#9CA3AF"
                  value={attractionSearch}
                  onChangeText={setAttractionSearch}
                />
              </View>

              <View style={styles.list}>
                {filteredAttractions.map((attraction) => {
                  const isSelected = selectedAttractions.includes(attraction.id);
                  const isFav = favoriteIds.has(attraction.id);
                  return (
                    <TouchableOpacity
                      key={attraction.id}
                      style={[styles.attractionRow, isSelected && styles.rowSelected]}
                      onPress={() => toggleAttraction(attraction.id)}
                      activeOpacity={0.75}
                    >
                      <WikiImage
                        kind="attraction"
                        uri={attraction.imageUrl}
                        query={`${attraction.name} ${selectedCity.name}`}
                        style={styles.attractionImage}
                      />
                      <ThemedText type="smallBold" style={styles.attractionTitle}>
                        {attraction.name}
                      </ThemedText>
                      <TouchableOpacity
                        onPress={() => toggleFavorite(attraction.id, selectedCity!.id)}
                        hitSlop={8}
                        style={styles.favButton}
                      >
                        <Ionicons
                          name={isFav ? "heart" : "heart-outline"}
                          size={22}
                          color={isFav ? "#EF4444" : "#CBD5E1"}
                        />
                      </TouchableOpacity>
                      <Ionicons
                        name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={isSelected ? "#0F766E" : "#CBD5E1"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {step === "extras" && selectedCity && (
            <>
              <ThemedText type="subtitle" style={styles.title}>
                Кафе и отель
              </ThemedText>
              <ThemedText type="small" style={styles.subtitle}>
                Необязательно: отметьте кафе и рестораны, а также выберите отель — они появятся на карте маршрута.
              </ThemedText>

              <View style={styles.extrasSectionHeader}>
                <Ionicons name="restaurant" size={16} color="#C2410C" />
                <ThemedText type="smallBold" style={styles.extrasSectionTitle}>
                  Кафе и рестораны
                </ThemedText>
              </View>

              {selectedCity.restaurants.length === 0 ? (
                <ThemedText type="small" style={styles.extrasEmpty}>
                  Для этого города пока нет подборки заведений.
                </ThemedText>
              ) : (
                <View style={styles.list}>
                  {selectedCity.restaurants.map((restaurant) => {
                    const isSelected = selectedRestaurants.includes(restaurant.id);
                    return (
                      <TouchableOpacity
                        key={restaurant.id}
                        style={[styles.attractionRow, isSelected && styles.rowSelectedFood]}
                        onPress={() => toggleRestaurant(restaurant.id)}
                        activeOpacity={0.75}
                      >
                        <WikiImage
                          kind="restaurant"
                          uri={restaurant.imageUrl}
                          query={`${restaurant.name} ${selectedCity.name} ресторан`}
                          style={styles.attractionImage}
                        />
                        <ThemedText type="smallBold" style={styles.attractionTitle}>
                          {restaurant.name}
                        </ThemedText>
                        <Ionicons
                          name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                          size={22}
                          color={isSelected ? "#C2410C" : "#CBD5E1"}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <View style={[styles.extrasSectionHeader, styles.extrasSectionHeaderSpaced]}>
                <Ionicons name="bed" size={16} color="#4338CA" />
                <ThemedText type="smallBold" style={styles.extrasSectionTitle}>
                  Где остановитесь
                </ThemedText>
              </View>

              {selectedCity.hotels.length === 0 ? (
                <ThemedText type="small" style={styles.extrasEmpty}>
                  Для этого города пока нет подборки отелей.
                </ThemedText>
              ) : (
                <View style={styles.list}>
                  {selectedCity.hotels.map((hotel) => {
                    const isSelected = selectedHotel === hotel.id;
                    return (
                      <TouchableOpacity
                        key={hotel.id}
                        style={[styles.attractionRow, isSelected && styles.rowSelectedHotel]}
                        onPress={() => toggleHotel(hotel.id)}
                        activeOpacity={0.75}
                      >
                        <WikiImage
                          kind="hotel"
                          uri={hotel.imageUrl}
                          query={`${hotel.name} ${selectedCity.name} отель`}
                          style={styles.attractionImage}
                        />
                        <ThemedText type="smallBold" style={styles.attractionTitle}>
                          {hotel.name}
                        </ThemedText>
                        <Ionicons
                          name={isSelected ? "radio-button-on" : "radio-button-off"}
                          size={22}
                          color={isSelected ? "#4338CA" : "#CBD5E1"}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!canContinue || saving) && styles.primaryButtonDisabled,
            ]}
            onPress={handlePrimaryPress}
            disabled={!canContinue || saving}
            activeOpacity={0.8}
          >
            <ThemedText type="smallBold" style={styles.primaryButtonText}>
              {step === "extras"
                ? saving
                  ? "Сохраняем..."
                  : "Сохранить поездку"
                : "Продолжить"}
            </ThemedText>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  headerText: {
    flex: 1,
    alignItems: "center",
  },
  headerMeta: {
    color: "#64748B",
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 112,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 6,
  },
  subtitle: {
    color: "#64748B",
    marginBottom: 16,
  },
  searchBox: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 15,
    color: "#111827",
  },
  list: {
    gap: 10,
  },
  cityRow: {
    flexDirection: "row",
    gap: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rowSelected: {
    borderColor: "#0F766E",
    backgroundColor: "#F0FDFA",
  },
  rowSelectedFood: {
    borderColor: "#C2410C",
    backgroundColor: "#FFF7ED",
  },
  rowSelectedHotel: {
    borderColor: "#4338CA",
    backgroundColor: "#EEF2FF",
  },
  extrasSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  extrasSectionHeaderSpaced: {
    marginTop: 22,
  },
  extrasSectionTitle: {
    color: "#1F2937",
  },
  extrasEmpty: {
    color: "#94A3B8",
  },
  rowImage: {
    width: 88,
    height: 88,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  rowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowTitle: {
    flex: 1,
  },
  rowMeta: {
    marginTop: 2,
    color: "#64748B",
  },
  rowDescription: {
    marginTop: 6,
    color: "#475569",
  },
  heroImage: {
    width: "100%",
    height: 148,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#E5E7EB",
  },
  attractionRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  attractionImage: {
    width: 58,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  attractionTitle: {
    flex: 1,
  },
  favButton: {
    padding: 4,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "rgba(248, 250, 252, 0.96)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
});
