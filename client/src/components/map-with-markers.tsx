import React, { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import type { Attraction, City, Place } from "@/constants/cities";
import { buildLeafletHtml, type MapPoint } from "@/utils/leaflet-html";

type Props = {
  city: City;
  attractions: Attraction[];
  restaurants?: Place[];
  hotel?: Place | null;
  onOrderChange?: (orderedIndices: number[]) => void;
};

const toPoint = (p: { name: string; coords: { latitude: number; longitude: number } }): MapPoint => ({
  lat: p.coords.latitude,
  lng: p.coords.longitude,
  name: p.name,
});

export function MapWithMarkers({
  city,
  attractions,
  restaurants = [],
  hotel = null,
  onOrderChange,
}: Props) {
  const html = useMemo(() => {
    return buildLeafletHtml({
      attractions: attractions.map(toPoint),
      restaurants: restaurants.map(toPoint),
      hotel: hotel ? toPoint(hotel) : null,
      center: { lat: city.coords.latitude, lng: city.coords.longitude },
      zoom: 12,
    });
  }, [city, attractions, restaurants, hotel]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      if (!onOrderChange) return;
      try {
        const parsed = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          order?: number[];
        };
        if (parsed?.type === "order" && Array.isArray(parsed.order)) {
          onOrderChange(parsed.order);
        }
      } catch {
        // ignore
      }
    },
    [onOrderChange],
  );

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit
        startInLoadingState
        androidLayerType="hardware"
        setSupportMultipleWindows={false}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E2E8F0" },
  map: { flex: 1, backgroundColor: "#E2E8F0" },
});
