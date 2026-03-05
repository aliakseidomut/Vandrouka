import * as Device from "expo-device";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { AnimatedIcon } from "@/components/animated-icon";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { Spacing } from "@/constants/theme";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Welcome to&nbsp;Vandrouka
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Join our community
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.authSection}>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("/(auth)/register")}
          >
            <ThemedText type="button" style={styles.registerButtonText}>
              Create Account
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <ThemedText type="button" style={styles.loginButtonText}>
              Sign In
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {Platform.OS === "web" && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    maxWidth: 500,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
  },
  authSection: {
    width: "100%",
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  registerButton: {
    backgroundColor: "#000",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  loginButton: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  loginButtonText: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
});
