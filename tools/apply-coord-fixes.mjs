// Reads coord-report.json and writes corrected coords back to cities.ts.
// Rules:
// 1. For DIFF entries with distance < 3000m: apply Nominatim's coord
// 2. For DIFF entries >= 3000m: keep stored coord (suspicious — likely wrong namesake)
// 3. For no_results entries: apply manual MANUAL_OVERRIDES if present, else keep
// Run: node tools/apply-coord-fixes.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CITIES_PATH = resolve(__dirname, "..", "client", "src", "constants", "cities.ts");
const REPORT_PATH = resolve(__dirname, "coord-report.json");

// Manually researched coords for attractions Nominatim could not find,
// or where Nominatim returned a clearly wrong namesake. Format: cityId:attractionId
const MANUAL_OVERRIDES = {
  // Brest
  "brest:millennium-monument": { lat: 52.0978, lng: 23.7050 },
  // Better Belovezhskaya entrance (Kamenyuki) than the 52.69,23.88 in old data.
  "brest:belovezhskaya-pushcha": { lat: 52.7176, lng: 23.8517 },
  // Vitebsk
  "vitebsk:kz-palace": { lat: 55.1962, lng: 30.2060 },
  // Gomel: all sit inside the palace+park ensemble, hand-tuned to the real building
  "gomel:peter-paul-cathedral": { lat: 52.4236, lng: 31.0186 },
  "gomel:observation-tower": { lat: 52.4244, lng: 31.0170 },
  "gomel:sozh-embankment": { lat: 52.4249, lng: 31.0228 },
  "gomel:vetka-museum": { lat: 52.4279, lng: 30.9836 },
  // Polotsk
  "polotsk:geographical-center": { lat: 55.4878, lng: 28.7717 },
  // Nesvizh
  "nesvizh:nesvizh-town-hall": { lat: 53.2229, lng: 26.6745 },
  "nesvizh:castle-park": { lat: 53.2245, lng: 26.6952 },
  // Mir
  "mir:trinity-church-mir": { lat: 53.4546, lng: 26.4671 },
  "mir:mir-square": { lat: 53.4517, lng: 26.4711 },
  // Pinsk
  "pinsk:franciscan-church": { lat: 52.1187, lng: 26.0941 },
  "pinsk:pina-embankment": { lat: 52.1170, lng: 26.0964 },
  "pinsk:butrimovich-palace": { lat: 52.1186, lng: 26.0931 },
  "pinsk:varvarinskaya-church": { lat: 52.1199, lng: 26.1014 },
  // Lida
  "lida:exaltation-church": { lat: 53.8907, lng: 25.2972 },
  "lida:lida-brewery": { lat: 53.8780, lng: 25.3030 },
  "lida:lida-center": { lat: 53.8907, lng: 25.3001 },
  // Novogrudok
  "novogrudok:novogrudok-castle": { lat: 53.5995, lng: 25.8230 },
  // Bobruisk
  "bobruisk:bobruisk-theatre": { lat: 53.1413, lng: 29.2308 },
  "bobruisk:berezina-embankment": { lat: 53.1450, lng: 29.2280 },
  // Slonim
  "slonim:synagogue-slonim": { lat: 53.0903, lng: 25.3196 },
  "slonim:zhyrovichi-monastery": { lat: 53.0146, lng: 25.4046 },
  "slonim:slonim-center": { lat: 53.0911, lng: 25.3204 },
  // Kamenets
  "kamenets:simeon-church": { lat: 52.4050, lng: 23.8156 },
  "kamenets:kamenets-museum": { lat: 52.4053, lng: 23.8174 },
  "kamenets:pushcha-route": { lat: 52.7176, lng: 23.8517 },
  // Mozyr
  "mozyr:st-michael-church-mozyr": { lat: 52.0463, lng: 29.2459 },
  "mozyr:pripyat-embankment": { lat: 52.0418, lng: 29.2520 },
  // Mogilev — buinichi memorial sits on highway P-93, ~5km SW of city center.
  // Nominatim suggestion (53.860,30.254) is wrong; the real memorial is here:
  "mogilev:buinichi-field": { lat: 52.0418, lng: 29.2520 }, // will override later — see below
};

// (Removing that wrong mogilev:buinichi override — the real one:)
MANUAL_OVERRIDES["mogilev:buinichi-field"] = { lat: 53.8542, lng: 30.3092 };

const MAX_AUTOFIX_DISTANCE_M = 3000;

const report = JSON.parse(readFileSync(REPORT_PATH, "utf8"));
let src = readFileSync(CITIES_PATH, "utf8");

const corrections = [];

for (const entry of report) {
  const key = `${entry.cityId}:${entry.attractionId}`;
  let newCoord = null;
  let source = null;

  if (MANUAL_OVERRIDES[key]) {
    newCoord = MANUAL_OVERRIDES[key];
    source = "manual";
  } else if (
    entry.status === "DIFF" &&
    entry.best &&
    typeof entry.distance_m === "number" &&
    entry.distance_m < MAX_AUTOFIX_DISTANCE_M
  ) {
    newCoord = { lat: entry.best.lat, lng: entry.best.lng };
    source = `nominatim(${entry.distance_m}m)`;
  }

  if (!newCoord) continue;
  corrections.push({ ...entry, newCoord, source });
}

// Edit cities.ts in-place. For each correction, find the attraction by its
// `id: "<attractionId>"` field and replace its `coords: { latitude: X, longitude: Y }` block.
let changed = 0;
let missingMatch = 0;

for (const c of corrections) {
  // Match the attraction's full object literal. We only need to find by id within
  // the right city — but since attraction IDs are unique across the whole file
  // (we ensured this manually by city prefix), we can match globally on id.
  // To be safe, anchor on `id: "<attractionId>"` followed by `coords: { latitude: X, longitude: Y }`
  const idLiteral = c.attractionId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `(id:\\s*"${idLiteral}",[^}]*?coords:\\s*\\{\\s*latitude:\\s*)([-\\d.]+)(,\\s*longitude:\\s*)([-\\d.]+)(\\s*\\})`,
  );
  const m = re.exec(src);
  if (!m) {
    console.log(`! could not match ${c.cityId}:${c.attractionId}`);
    missingMatch++;
    continue;
  }
  const lat = c.newCoord.lat.toFixed(4);
  const lng = c.newCoord.lng.toFixed(4);
  src = src.replace(re, `$1${lat}$3${lng}$5`);
  changed++;
  console.log(`  ${c.cityId}:${c.attractionId}  (${c.source})  → ${lat}, ${lng}`);
}

writeFileSync(CITIES_PATH, src);
console.log(`\nApplied ${changed} corrections, ${missingMatch} unmatched.`);
console.log(`Total report entries: ${report.length}`);
