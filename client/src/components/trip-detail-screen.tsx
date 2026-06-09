import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
import { MarkdownText } from "@/components/markdown-text";
import { TripsAPI } from "@/api/trips";
import { AiAPI } from "@/api/ai";
import {
  getAttractionsByIds,
  getCityById,
  getHotelById,
  getRestaurantsByIds,
  type Attraction,
} from "@/constants/cities";

type Props = {
  trip: {
    id: string;
    cityId: string;
    attractionIds: string[];
    restaurantIds?: string[];
    hotelId?: string | null;
    aiRoute?: string | null;
  };
  onBack: () => void;
  onDeleted: () => void;
};

export function TripDetailScreen({ trip, onBack, onDeleted }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [aiRoute, setAiRoute] = useState<string | null>(trip.aiRoute ?? null);
  const [generating, setGenerating] = useState(false);
  const [descModal, setDescModal] = useState<{
    attraction: Attraction;
    loading: boolean;
    text: string | null;
  } | null>(null);
  const [chat, setChat] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const chatScrollRef = useRef<ScrollView | null>(null);

  const city = getCityById(trip.cityId);
  const attractions = city ? getAttractionsByIds(city, trip.attractionIds) : [];
  const restaurants = city ? getRestaurantsByIds(city, trip.restaurantIds ?? []) : [];
  const hotel = city ? getHotelById(city, trip.hotelId ?? null) : null;

  const refresh = useCallback(async () => {
    try {
      const fresh = await TripsAPI.getTrip(trip.id);
      setAiRoute(fresh.aiRoute ?? null);
    } catch {
      // silent — keep current state
    }
  }, [trip.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleDelete = () => {
    Alert.alert("Удалить поездку", "Вы уверены? Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await TripsAPI.deleteTrip(trip.id);
            onDeleted();
          } catch (error) {
            Alert.alert(
              "Ошибка",
              error instanceof Error ? error.message : "Не удалось удалить поездку",
            );
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleGenerateRoute = async () => {
    if (!city || attractions.length === 0) return;
    try {
      setGenerating(true);
      const response = await AiAPI.generateRoute({
        tripId: trip.id,
        cityName: city.name,
        attractions: attractions.map((a) => ({
          name: a.name,
          lat: a.coords.latitude,
          lng: a.coords.longitude,
        })),
      });
      setAiRoute(response.aiRoute);
    } catch (error) {
      Alert.alert(
        "AI недоступен",
        error instanceof Error ? error.message : "Не удалось сгенерировать маршрут",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDescribe = async (attraction: Attraction) => {
    if (!city) return;
    setDescModal({ attraction, loading: true, text: null });
    setChat([]);
    setChatInput("");
    try {
      const response = await AiAPI.describeAttraction({
        attractionName: attraction.name,
        cityName: city.name,
      });
      setDescModal({ attraction, loading: false, text: response.description });
    } catch (error) {
      setDescModal({
        attraction,
        loading: false,
        text:
          error instanceof Error
            ? `Ошибка: ${error.message}`
            : "Не удалось получить описание",
      });
    }
  };

  const closeDescModal = () => {
    setDescModal(null);
    setChat([]);
    setChatInput("");
    setChatBusy(false);
  };

  const handleAskGuide = async () => {
    if (!city || !descModal || chatBusy) return;
    const question = chatInput.trim();
    if (!question) return;

    const baseHistory: { role: "user" | "assistant"; content: string }[] = [];
    if (descModal.text) {
      baseHistory.push({ role: "assistant", content: descModal.text });
    }
    const historyForApi = [...baseHistory, ...chat];

    setChat((prev) => [...prev, { role: "user", content: question }]);
    setChatInput("");
    setChatBusy(true);

    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      const response = await AiAPI.chat({
        cityName: city.name,
        attractionName: descModal.attraction.name,
        history: historyForApi,
        question,
      });
      setChat((prev) => [...prev, { role: "assistant", content: response.answer }]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? `Ошибка: ${error.message}`
              : "Не удалось получить ответ",
        },
      ]);
    } finally {
      setChatBusy(false);
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  };

  const handleOpenMap = () => {
    const params = new URLSearchParams({
      cityId: trip.cityId,
      attractionIds: trip.attractionIds.join(","),
    });
    if (trip.restaurantIds && trip.restaurantIds.length > 0) {
      params.set("restaurantIds", trip.restaurantIds.join(","));
    }
    if (trip.hotelId) {
      params.set("hotelId", trip.hotelId);
    }
    router.push((`/(tabs)/map?${params.toString()}`) as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.iconButton} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            {city?.name ?? trip.cityId}
          </ThemedText>
          <TouchableOpacity
            onPress={handleOpenMap}
            style={styles.iconButton}
            activeOpacity={0.75}
          >
            <Ionicons name="map-outline" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {city && (
            <WikiImage
              kind="city"
              uri={city.imageUrl}
              query={`${city.name} город`}
              style={styles.cityImage}
            />
          )}

          <View style={styles.meta}>
            <ThemedText type="subtitle" style={styles.cityTitle}>
              {city?.name ?? trip.cityId}
            </ThemedText>
            {city && (
              <ThemedText type="small" style={styles.country}>
                {city.region} · {city.country}
              </ThemedText>
            )}
            {city && (
              <ThemedText type="small" style={styles.description}>
                {city.description}
              </ThemedText>
            )}
          </View>

          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <View style={styles.aiTitleRow}>
                <Ionicons name="sparkles" size={18} color="#7C3AED" />
                <ThemedText type="smallBold" style={styles.aiTitle}>
                  AI-маршрут
                </ThemedText>
              </View>
              {aiRoute && (
                <TouchableOpacity
                  onPress={handleGenerateRoute}
                  disabled={generating}
                  style={styles.regenButton}
                >
                  <ThemedText type="small" style={styles.regenText}>
                    {generating ? "..." : "Перегенерировать"}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            {aiRoute ? (
              <MarkdownText text={aiRoute} baseColor="#1F2937" baseFontSize={14} />
            ) : (
              <View style={styles.aiEmpty}>
                <ThemedText type="small" style={styles.aiEmptyText}>
                  Сгенерируйте персональный маршрут с порядком посещения, советами и местами для еды.
                </ThemedText>
                <TouchableOpacity
                  style={[styles.aiButton, generating && styles.aiButtonDisabled]}
                  onPress={handleGenerateRoute}
                  disabled={generating}
                  activeOpacity={0.85}
                >
                  {generating ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                      <ThemedText type="smallBold" style={styles.aiButtonText}>
                        Сгенерировать маршрут
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Достопримечательности
          </ThemedText>

          {attractions.length === 0 ? (
            <ThemedText type="small" style={styles.empty}>
              Нет данных
            </ThemedText>
          ) : (
            attractions.map((attraction) => (
              <View key={attraction.id} style={styles.attractionCard}>
                <WikiImage
                  kind="attraction"
                  uri={attraction.imageUrl}
                  query={`${attraction.name} ${city?.name ?? ""}`.trim()}
                  style={styles.attractionImage}
                />
                <View style={styles.attractionInfo}>
                  <ThemedText type="smallBold">{attraction.name}</ThemedText>
                  <TouchableOpacity
                    onPress={() => handleDescribe(attraction)}
                    style={styles.describeLink}
                  >
                    <Ionicons name="information-circle-outline" size={14} color="#0F766E" />
                    <ThemedText type="small" style={styles.describeText}>
                      Рассказать подробнее
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {restaurants.length > 0 && (
            <>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="restaurant" size={16} color="#C2410C" />
                <ThemedText type="smallBold">Кафе и рестораны</ThemedText>
              </View>
              {restaurants.map((restaurant) => (
                <View key={restaurant.id} style={styles.attractionCard}>
                  <WikiImage
                    kind="restaurant"
                    uri={restaurant.imageUrl}
                    query={`${restaurant.name} ${city?.name ?? ""} ресторан`.trim()}
                    style={styles.attractionImage}
                  />
                  <View style={styles.attractionInfo}>
                    <ThemedText type="smallBold">{restaurant.name}</ThemedText>
                    <ThemedText type="small" style={styles.placeMeta}>
                      Кафе/ресторан · отмечено на карте
                    </ThemedText>
                  </View>
                </View>
              ))}
            </>
          )}

          {hotel && (
            <>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="bed" size={16} color="#4338CA" />
                <ThemedText type="smallBold">Отель</ThemedText>
              </View>
              <View style={styles.attractionCard}>
                <WikiImage
                  kind="hotel"
                  uri={hotel.imageUrl}
                  query={`${hotel.name} ${city?.name ?? ""} отель`.trim()}
                  style={styles.attractionImage}
                />
                <View style={styles.attractionInfo}>
                  <ThemedText type="smallBold">{hotel.name}</ThemedText>
                  <ThemedText type="small" style={styles.placeMeta}>
                    Место проживания · отмечено на карте
                  </ThemedText>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={deleting}
        >
          <ThemedText type="smallBold" style={styles.deleteButtonText}>
            {deleting ? "Удаление..." : "Удалить поездку"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <Modal
        visible={descModal !== null}
        animationType="slide"
        transparent
        onRequestClose={closeDescModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeDescModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboardWrap}
            pointerEvents="box-none"
          >
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <ThemedText type="smallBold" style={styles.modalTitle}>
                  {descModal?.attraction.name}
                </ThemedText>
                <TouchableOpacity onPress={closeDescModal}>
                  <Ionicons name="close" size={22} color="#111827" />
                </TouchableOpacity>
              </View>
              {descModal?.loading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator color="#7C3AED" />
                  <ThemedText type="small" style={styles.modalLoadingText}>
                    AI готовит описание...
                  </ThemedText>
                </View>
              ) : (
                <>
                  <ScrollView
                    style={styles.modalScroll}
                    ref={chatScrollRef}
                    onContentSizeChange={() =>
                      chatScrollRef.current?.scrollToEnd({ animated: false })
                    }
                  >
                    <MarkdownText
                      text={descModal?.text ?? ""}
                      baseColor="#1F2937"
                      baseFontSize={14}
                    />

                    {chat.map((msg, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.chatBubble,
                          msg.role === "user"
                            ? styles.chatBubbleUser
                            : styles.chatBubbleAi,
                        ]}
                      >
                        {msg.role === "user" ? (
                          <ThemedText type="small" style={styles.chatTextUser}>
                            {msg.content}
                          </ThemedText>
                        ) : (
                          <MarkdownText
                            text={msg.content}
                            baseColor="#1F2937"
                            baseFontSize={14}
                          />
                        )}
                      </View>
                    ))}

                    {chatBusy && (
                      <View style={[styles.chatBubble, styles.chatBubbleAi]}>
                        <ActivityIndicator color="#7C3AED" size="small" />
                      </View>
                    )}
                  </ScrollView>

                  <View style={styles.chatInputRow}>
                    <TextInput
                      style={styles.chatInput}
                      placeholder="Уточнить у AI-гида..."
                      placeholderTextColor="#9CA3AF"
                      value={chatInput}
                      onChangeText={setChatInput}
                      multiline
                      editable={!chatBusy}
                      onSubmitEditing={handleAskGuide}
                      returnKeyType="send"
                      blurOnSubmit
                    />
                    <TouchableOpacity
                      style={[
                        styles.chatSend,
                        (chatBusy || !chatInput.trim()) && styles.chatSendDisabled,
                      ]}
                      onPress={handleAskGuide}
                      disabled={chatBusy || !chatInput.trim()}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerTitle: { flex: 1, textAlign: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  cityImage: {
    width: "auto",
    height: 190,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  meta: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  cityTitle: { fontSize: 28, lineHeight: 34 },
  country: { marginTop: 4, color: "#64748B" },
  description: { marginTop: 8, color: "#475569" },
  aiSection: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FAF5FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  aiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  aiTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  aiTitle: { color: "#7C3AED" },
  regenButton: { paddingHorizontal: 8, paddingVertical: 4 },
  regenText: { color: "#7C3AED" },
  aiText: { color: "#1F2937", lineHeight: 22 },
  aiEmpty: { alignItems: "stretch" },
  aiEmptyText: { color: "#64748B", marginBottom: 12 },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#7C3AED",
  },
  aiButtonDisabled: { opacity: 0.6 },
  aiButtonText: { color: "#FFFFFF" },
  sectionTitle: { paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  placeMeta: { marginTop: 2, color: "#64748B" },
  empty: { paddingHorizontal: 16, color: "#64748B" },
  attractionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 70,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  attractionImage: {
    width: 58,
    height: 58,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  attractionInfo: { flex: 1, minWidth: 0 },
  describeLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  describeText: { color: "#0F766E" },
  deleteButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#B91C1C",
    alignItems: "center",
  },
  deleteButtonDisabled: { opacity: 0.6 },
  deleteButtonText: { color: "#FFFFFF" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalKeyboardWrap: {
    width: "100%",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    maxHeight: "85%",
  },
  chatBubble: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: "92%",
  },
  chatBubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "#111827",
  },
  chatBubbleAi: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
  },
  chatTextUser: {
    color: "#FFFFFF",
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#111827",
    fontSize: 14,
  },
  chatSend: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  chatSendDisabled: {
    opacity: 0.4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: { flex: 1, fontSize: 16 },
  modalLoading: { alignItems: "center", paddingVertical: 32, gap: 12 },
  modalLoadingText: { color: "#64748B" },
  modalScroll: { maxHeight: 500 },
  modalText: { color: "#1F2937", lineHeight: 22 },
});
