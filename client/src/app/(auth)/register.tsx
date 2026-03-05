import { RegisterScreenWithGoogle } from "@/components/register-screen-with-google";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, ScrollView } from "react-native";

export default function RegisterPage() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RegisterScreenWithGoogle />
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
