import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { session } from "@/utils/session";
import { UsersAPI, type UserProfile } from "@/api/users";

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await UsersAPI.getMe();
      setProfile(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = async () => {
    await session.clear();
    router.replace("/(auth)/login");
  };

  const email = profile?.email ?? session.getEmail() ?? "Не указан";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Профиль
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Аккаунт и статистика
          </ThemedText>
        </View>

        <View style={styles.section}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={28} color="#0F766E" />
          </View>
          <View style={styles.accountInfo}>
            <ThemedText type="smallBold">{profile?.name ?? email}</ThemedText>
            <ThemedText type="small" style={styles.muted}>
              {email}
            </ThemedText>
            <ThemedText type="small" style={styles.muted}>
              С нами с {memberSince}
            </ThemedText>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="map-outline" size={20} color="#0F766E" />
            <ThemedText type="subtitle" style={styles.statValue}>
              {loading ? "..." : profile?.tripsCount ?? 0}
            </ThemedText>
            <ThemedText type="small" style={styles.statLabel}>
              Поездок
            </ThemedText>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={20} color="#EF4444" />
            <ThemedText type="subtitle" style={styles.statValue}>
              {loading ? "..." : profile?.favoritesCount ?? 0}
            </ThemedText>
            <ThemedText type="small" style={styles.statLabel}>
              В избранном
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="sparkles-outline" size={20} color="#7C3AED" />
          <View style={styles.infoText}>
            <ThemedText type="smallBold">AI-маршруты</ThemedText>
            <ThemedText type="small" style={styles.muted}>
              Откройте любую поездку и нажмите «Сгенерировать маршрут».
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="map" size={20} color="#0F766E" />
          <View style={styles.infoText}>
            <ThemedText type="smallBold">Карта</ThemedText>
            <ThemedText type="small" style={styles.muted}>
              На экране поездки в шапке есть кнопка карты — точки маршрута на карте Беларуси.
            </ThemedText>
          </View>
        </View>

        {loading && !profile && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#64748B" />
          </View>
        )}

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <ThemedText type="smallBold" style={styles.logoutText}>
            Выйти
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  header: { marginBottom: 18 },
  title: { fontSize: 30, lineHeight: 36 },
  subtitle: { marginTop: 3, color: "#64748B" },
  section: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CCFBF1",
  },
  accountInfo: { flex: 1, minWidth: 0 },
  muted: { marginTop: 2, color: "#64748B" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "flex-start",
    gap: 4,
  },
  statValue: { fontSize: 22, lineHeight: 26 },
  statLabel: { color: "#64748B" },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoText: { flex: 1, minWidth: 0 },
  loadingRow: { paddingVertical: 16, alignItems: "center" },
  logoutButton: {
    minHeight: 48,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  logoutText: { color: "#FFFFFF" },
});
