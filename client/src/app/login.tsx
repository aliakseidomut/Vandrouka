import { LoginScreen } from "@/components/login-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, ScrollView } from "react-native";

export default function LoginPage() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LoginScreen />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
  },
});
