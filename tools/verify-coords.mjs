// One-shot script: queries Nominatim for every attraction in cities.ts
// and reports candidates whose stored coords differ from the OSM lookup by >300m.
// Run: node tools/verify-coords.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CITIES_PATH = resolve(__dirname, "..", "client", "src", "constants", "cities.ts");
const REPORT_PATH = resolve(__dirname, "coord-report.json");

const src = readFileSync(CITIES_PATH, "utf8");

// Parse: extract every city block and its attractions naively but reliably.
// We look for `id: "<cityId>"`, `name: "<city name>"`, then within that city's
// `attractions: [ ... ]` for each `{ id: "...", name: "...", coords: { latitude: X, longitude: Y } }`.

function parseCities(source) {
  const cities = [];
  const cityRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",[\s\S]*?attractions:\s*\[([\s\S]*?)\],\s*\},?\s*(?=\{|\];)/g;
  let m;
  while ((m = cityRegex.exec(source)) !== null) {
    const [, cityId, cityName, attractionsBlock] = m;
    const attractions = [];
    const aRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",[^}]*?coords:\s*\{\s*latitude:\s*([-\d.]+),\s*longitude:\s*([-\d.]+)\s*\}\s*\}/g;
    let am;
    while ((am = aRegex.exec(attractionsBlock)) !== null) {
      attractions.push({
        id: am[1],
        name: am[2],
        lat: parseFloat(am[3]),
        lng: parseFloat(am[4]),
      });
    }
    cities.push({ cityId, cityName, attractions });
  }
  return cities;
}

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function nominatimSearch(query, city, country = "Belarus") {
  const params = new URLSearchParams({
    q: `${query}, ${city}, ${country}`,
    format: "json",
    limit: "5",
    "accept-language": "ru,en;q=0.7,be;q=0.5",
  });
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "vandrouka-coord-audit/1.0 (one-shot verification script)",
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((d) => ({
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
    display: d.display_name,
    type: d.type,
    class: d.class,
    importance: d.importance,
  }));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const cities = parseCities(src);
  console.log(`Parsed ${cities.length} cities, ${cities.reduce((s, c) => s + c.attractions.length, 0)} attractions`);

  const report = [];
  for (const city of cities) {
    console.log(`\n== ${city.cityName} (${city.cityId}) ==`);
    for (const a of city.attractions) {
      let candidates;
      try {
        candidates = await nominatimSearch(a.name, city.cityName);
      } catch (e) {
        console.log(`  ! ${a.name}: lookup error ${e.message}`);
        continue;
      }
      // Nominatim usage policy: max 1 request/sec.
      await sleep(1100);

      if (candidates.length === 0) {
        console.log(`  ? ${a.name}: NO RESULTS`);
        report.push({
          cityId: city.cityId,
          attractionId: a.id,
          attractionName: a.name,
          stored: { lat: a.lat, lng: a.lng },
          status: "no_results",
        });
        continue;
      }

      // Pick the candidate closest to the stored coord (so we don't grab a
      // far-away namesake), but require it to be within 25km of city center
      // bounds is implicit because we include city in query.
      candidates.sort(
        (x, y) =>
          haversineMeters({ lat: x.lat, lng: x.lng }, a) -
          haversineMeters({ lat: y.lat, lng: y.lng }, a),
      );
      const best = candidates[0];
      const dist = haversineMeters({ lat: best.lat, lng: best.lng }, a);

      const status = dist > 300 ? "DIFF" : "ok";
      console.log(
        `  ${status === "DIFF" ? "!" : "."} ${a.name}: ${dist.toFixed(0)}m → ${best.lat.toFixed(5)}, ${best.lng.toFixed(5)}`,
      );
      report.push({
        cityId: city.cityId,
        attractionId: a.id,
        attractionName: a.name,
        stored: { lat: a.lat, lng: a.lng },
        best: { lat: best.lat, lng: best.lng, display: best.display },
        distance_m: Math.round(dist),
        status,
      });
    }
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nWrote report → ${REPORT_PATH}`);
  const diffs = report.filter((r) => r.status === "DIFF").length;
  const missing = report.filter((r) => r.status === "no_results").length;
  console.log(`Issues: ${diffs} mismatched, ${missing} not found`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
