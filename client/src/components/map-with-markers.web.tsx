import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

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
  const callbackRef = useRef(onOrderChange);
  callbackRef.current = onOrderChange;

  const html = useMemo(() => {
    return buildLeafletHtml({
      attractions: attractions.map(toPoint),
      restaurants: restaurants.map(toPoint),
      hotel: hotel ? toPoint(hotel) : null,
      center: { lat: city.coords.latitude, lng: city.coords.longitude },
      zoom: 12,
    });
  }, [city, attractions, restaurants, hotel]);

  useEffect(() => {
    function handler(event: MessageEvent) {
      const data = event.data as {
        source?: string;
        payload?: string;
      } | null;
      if (!data || data.source !== "vandrouka-map" || !data.payload) return;
      try {
        const parsed = JSON.parse(data.payload) as {
          type?: string;
          order?: number[];
        };
        if (parsed?.type === "order" && Array.isArray(parsed.order)) {
          callbackRef.current?.(parsed.order);
        }
      } catch {
        // ignore
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <View style={styles.container}>
      <iframe
        title={`Карта · ${city.name}`}
        srcDoc={html}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E2E8F0" },
});
