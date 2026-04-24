import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TripsAPI } from "@/api/trips";

type Attraction = {
  id: string;
  name: string;
  imageUrl: string;
};

type City = {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  attractions: Attraction[];
};

const MOCK_CITIES: City[] = [
  {
    id: "minsk",
    name: "Минск",
    country: "Беларусь",
    imageUrl:
      "https://images.unsplash.com/photo-1544989164-31dc3c645987?auto=format&fit=crop&w=800&q=80",
    attractions: [
      {
        id: "nemiga",
        name: "Немига",
        imageUrl:
          "https://images.unsplash.com/photo-1521335751419-603f61523713?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "trinity-suburb",
        name: "Троицкое предместье",
        imageUrl:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "victory-square",
        name: "Площадь Победы",
        imageUrl:
          "https://images.unsplash.com/photo-1534448311378-1e193fb2570e?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "brest",
    name: "Брест",
    country: "Беларусь",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    attractions: [
      {
        id: "brest-fortress",
        name: "Брестская крепость",
        imageUrl:
          "https://images.unsplash.com/photo-1508269185279-45a82252f82d?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "sovetskaya-street",
        name: "Советская улица",
        imageUrl:
          "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "grodno",
    name: "Гродно",
    country: "Беларусь",
    imageUrl:
      "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&w=800&q=80",
    attractions: [
      {
        id: "old-castle",
        name: "Старый замок",
        imageUrl:
          "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "kalozha",
        name: "Церковь Коложа",
        imageUrl:
          "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

const MOCK_USER_ID = "mock-user-id";

type CreateTripScreenProps = {
  onDone?: () => void;
};

export default function CreateTripScreen({ onDone }: CreateTripScreenProps) {
  const router = useRouter();

  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [attractionSearch, setAttractionSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"city" | "attractions">("city");

  const selectedCity = MOCK_CITIES.find((c) => c.id === selectedCityId) ?? null;

  const filteredCities = MOCK_CITIES.filter((city) => {
    const term = citySearch.toLowerCase().trim();
    if (!term) return true;
    return (
      city.name.toLowerCase().includes(term) ||
      city.country.toLowerCase().includes(term)
    );
  });

  const filteredAttractions =
    selectedCity?.attractions.filter((attraction) => {
      const term = attractionSearch.toLowerCase().trim();
      if (!term) return true;
      return attraction.name.toLowerCase().includes(term);
    }) ?? [];

  const toggleAttraction = (id: string) => {
    setSelectedAttractions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const handleNextFromCity = () => {
    if (!selectedCityId) {
      Alert.alert("Ошибка", "Выберите город");
      return;
    }

    setStep("attractions");
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
        userId: MOCK_USER_ID,
        city: selectedCityId,
        attractions: selectedAttractions,
      });

      Alert.alert("Успех", "Поездка сохранена", [
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === "city" && (
            <>
              <ThemedText type="subtitle" style={styles.title}>
                Новая поездка
              </ThemedText>
              <ThemedText type="small" style={styles.subtitle}>
                Сначала выберите город, затем продолжите к выбору
                достопримечательностей.
              </ThemedText>

              <View style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Город
                </ThemedText>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Поиск города"
                  placeholderTextColor="#9CA3AF"
                  value={citySearch}
                  onChangeText={setCitySearch}
                />
                <View style={styles.cardsGrid}>
                  {filteredCities.map((city) => {
                    const isSelected = selectedCityId === city.id;
                    return (
                      <TouchableOpacity
                        key={city.id}
                        style={[
                          styles.card,
                          isSelected && styles.cardSelected,
                        ]}
                        onPress={() => {
                          setSelectedCityId(city.id);
                          setSelectedAttractions([]);
                          setAttractionSearch("");
                        }}
                      >
                        <Image
                          source={{ uri: city.imageUrl }}
                          style={styles.cardImage}
                        />
                        <View style={styles.cardContent}>
                          <ThemedText type="smallBold">
                            {city.name}
                          </ThemedText>
                          <ThemedText type="small" style={styles.cardMeta}>
                            {city.country}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {step === "attractions" && selectedCity && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.title}>
                Достопримечательности
              </ThemedText>
              <ThemedText type="small" style={styles.subtitle}>
                Выберите места, которые хотите посетить в {selectedCity.name}.
              </ThemedText>

              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Достопримечательности в {selectedCity.name}
              </ThemedText>
              <TextInput
                style={styles.searchInput}
                placeholder="Поиск достопримечательностей"
                placeholderTextColor="#9CA3AF"
                value={attractionSearch}
                onChangeText={setAttractionSearch}
              />
              <View style={styles.cardsGrid}>
                {filteredAttractions.map((attraction) => {
                  const isSelected = selectedAttractions.includes(
                    attraction.id,
                  );
                  return (
                    <TouchableOpacity
                      key={attraction.id}
                      style={[
                        styles.card,
                        isSelected && styles.cardSelected,
                      ]}
                      onPress={() => toggleAttraction(attraction.id)}
                    >
                      <Image
                        source={{ uri: attraction.imageUrl }}
                        style={styles.cardImage}
                      />
                      <View style={styles.cardContent}>
                        <ThemedText type="smallBold">
                          {attraction.name}
                        </ThemedText>
                        {isSelected && (
                          <ThemedText
                            type="small"
                            style={styles.selectedLabel}
                          >
                            Выбрано
                          </ThemedText>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
          onPress={step === "city" ? handleNextFromCity : handleCreateTrip}
          disabled={saving}
        >
          <ThemedText type="smallBold" style={styles.primaryButtonText}>
            {step === "city" ? "Далее" : "Сохранить поездку"}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardSelected: {
    borderColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  cardImage: {
    width: "100%",
    height: 100,
  },
  cardContent: {
    padding: 10,
  },
  cardMeta: {
    marginTop: 2,
    opacity: 0.7,
  },
  selectedLabel: {
    marginTop: 4,
    color: "#10B981",
  },
  primaryButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#000",
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#fff",
  },
});
