import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

import { session } from "@/utils/session";

const LightTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: "#ffffff" },
};

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = session.subscribe(() => setTick((n) => n + 1));
    return unsub;
  }, []);

  const hydrated = session.isHydrated();
  const authenticated = session.isAuthenticated();
  const inAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    if (!hydrated) return;

    if (!authenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (authenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [hydrated, authenticated, inAuthGroup, router]);

  // Until a redirect lands, the auth state and the current route group can be
  // mismatched. Rendering children in that window mounts protected screens that
  // immediately fire authenticated API calls (GET /trips, /favorites, /users/me)
  // before the redirect runs — producing a 401 "Unauthorized". Hold a spinner
  // until the route group matches the auth state.
  const redirecting =
    !hydrated ||
    (!authenticated && !inAuthGroup) ||
    (authenticated && inAuthGroup);

  if (redirecting) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    session.hydrate().finally(() => setHydrated(true));
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : LightTheme}>
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AuthGate>
    </ThemeProvider>
  );
}
