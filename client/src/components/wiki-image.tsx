import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Kind = "city" | "attraction" | "restaurant" | "hotel";

type Props = {
  kind: Kind;
  uri?: string | null;
  query?: string | null;
  style?: StyleProp<ImageStyle>;
};

const PALETTE: Record<Kind, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  city: { bg: "#DBEAFE", fg: "#1D4ED8", icon: "business" },
  attraction: { bg: "#FEF3C7", fg: "#B45309", icon: "image" },
  restaurant: { bg: "#FFEDD5", fg: "#C2410C", icon: "restaurant" },
  hotel: { bg: "#E0E7FF", fg: "#4338CA", icon: "bed" },
};

function getIconSize(style: StyleProp<ImageStyle>): number {
  const flat = StyleSheet.flatten(style) || {};
  const w = typeof flat.width === "number" ? flat.width : null;
  const h = typeof flat.height === "number" ? flat.height : null;
  if (w !== null && h !== null) return Math.max(16, Math.floor(Math.min(w, h) * 0.45));
  if (h !== null) return Math.max(16, Math.floor(h * 0.45));
  if (w !== null) return Math.max(16, Math.floor(w * 0.45));
  return 32;
}

function picsumFallback(kind: Kind, query?: string | null): string {
  const seed = encodeURIComponent(`vandrouka-${kind}-${(query || "default").toLowerCase()}`);
  return `https://picsum.photos/seed/${seed}/800/600`;
}

export function WikiImage({ kind, uri, query, style }: Props) {
  const palette = PALETTE[kind];
  const size = getIconSize(style);
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  useEffect(() => {
    setPrimaryFailed(false);
    setFallbackFailed(false);
  }, [uri, query]);

  if (uri && !primaryFailed) {
    return (
      <Image
        source={{ uri }}
        style={[styles.box, { backgroundColor: palette.bg }, style]}
        resizeMode="cover"
        onError={() => setPrimaryFailed(true)}
      />
    );
  }

  if (!fallbackFailed) {
    return (
      <Image
        source={{ uri: picsumFallback(kind, query) }}
        style={[styles.box, { backgroundColor: palette.bg }, style]}
        resizeMode="cover"
        onError={() => setFallbackFailed(true)}
      />
    );
  }

  return (
    <View style={[styles.box, { backgroundColor: palette.bg }, style]}>
      <Ionicons name={palette.icon} size={size} color={palette.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
});
