import React from "react";
import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

// Пока что email захардкожен, так как в приложении нет глобального стейта авторизации.
// В будущем здесь нужно будет подставлять реальный email из хранилища / контекста.
const MOCK_EMAIL = "user@example.com";

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // Здесь в будущем нужно будет очищать токен/сессию пользователя
    Alert.alert("Logged out", "You have been logged out.");
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.title}>
            Profile
          </ThemedText>

          <View style={styles.section}>
            <ThemedText type="smallBold">Email</ThemedText>
            <ThemedText type="small" style={styles.email}>
              {MOCK_EMAIL}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">Settings</ThemedText>
            <ThemedText type="small" style={styles.muted}>
              Settings will be available soon.
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText type="smallBold" style={styles.logoutText}>
              Log out
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
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  email: {
    marginTop: 4,
  },
  muted: {
    marginTop: 4,
    opacity: 0.6,
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#000",
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
  },
});

