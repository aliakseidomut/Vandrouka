export type MapPoint = {
  lat: number;
  lng: number;
  name: string;
};

export type MapPayload = {
  // Достопримечательности — по ним строится маршрут (нумерованные точки).
  attractions: MapPoint[];
  // Кафе/рестораны и отель — отдельные маркеры, в маршрут не входят.
  restaurants: MapPoint[];
  hotel: MapPoint | null;
  center: { lat: number; lng: number };
  zoom: number;
};

export function buildLeafletHtml(payload: MapPayload): string {
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<style>
  html, body { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
  #map { width: 100%; height: 100vh; background: #E2E8F0; }
  .pin {
    width: 30px; height: 30px; border-radius: 15px;
    background: #0F766E; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font: 700 13px/1 -apple-system, system-ui, sans-serif;
    border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  }
  .pin.pending { background: #94A3B8; }
  .pin.start { background: #16A34A; }
  .pin.end { background: #DC2626; }
  /* Кафе/рестораны — янтарный, отель — индиго; форма отличается от маршрутных */
  .pin.food { background: #C2410C; border-radius: 8px; }
  .pin.hotel { background: #4338CA; border-radius: 8px; }
  .pin svg { width: 16px; height: 16px; fill: #fff; display: block; }
  .leaflet-tile-container img { image-rendering: -webkit-optimize-contrast; }
  .info-pill {
    position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
    z-index: 1000;
    background: rgba(255,255,255,0.96);
    color: #0F172A;
    padding: 6px 12px;
    border-radius: 999px;
    font: 600 12px/1.2 -apple-system, system-ui, sans-serif;
    border: 1px solid #E2E8F0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    white-space: nowrap;
    max-width: 90%; overflow: hidden; text-overflow: ellipsis;
  }
</style>
</head>
<body>
<div id="map"></div>
<div id="info" class="info-pill" style="display:none;"></div>
<script>
(function () {
  var data = ${json};
  var attractions = Array.isArray(data.attractions) ? data.attractions : [];
  var restaurants = Array.isArray(data.restaurants) ? data.restaurants : [];
  var hotel = data.hotel || null;

  var FOOD_SVG = '<svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>';
  var HOTEL_SVG = '<svg viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>';

  var map = L.map('map', { zoomControl: true, attributionControl: true });
  var infoEl = document.getElementById('info');

  function setInfo(text) {
    if (!infoEl) return;
    if (!text) { infoEl.style.display = 'none'; return; }
    infoEl.textContent = text;
    infoEl.style.display = 'block';
  }

  // CartoDB Voyager tiles — friendly licensing for app embeds, color basemap,
  // multiple subdomains (a/b/c/d) for parallel tile loading. Falls back to
  // OpenStreetMap tile server on any tile error.
  var primary = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '© OpenStreetMap, © CARTO',
      crossOrigin: true
    }
  );
  var fallback = L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 19, attribution: '© OpenStreetMap', crossOrigin: true }
  );
  var swapped = false;
  primary.on('tileerror', function () {
    if (swapped) return;
    swapped = true;
    map.removeLayer(primary);
    fallback.addTo(map);
  });
  primary.addTo(map);

  function makeIcon(label, kind) {
    var cls = 'pin' + (kind ? ' ' + kind : '');
    return L.divIcon({
      className: '',
      html: '<div class="' + cls + '">' + label + '</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  function makeGlyphIcon(svg, kind) {
    return L.divIcon({
      className: '',
      html: '<div class="pin ' + kind + '">' + svg + '</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  function postOrder(order) {
    var msg = JSON.stringify({ type: 'order', order: order });
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      }
    } catch (e) {}
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ source: 'vandrouka-map', payload: msg }, '*');
      }
    } catch (e) {}
  }

  function haversineMeters(a, b) {
    var R = 6371000;
    var toRad = function (x) { return x * Math.PI / 180; };
    var dLat = toRad(b.lat - a.lat);
    var dLng = toRad(b.lng - a.lng);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // Choose pedestrian vs driving by checking the longest leg in the input
  // order — when one point is far away (Belovezhskaya, Zhirovichi etc.),
  // foot routing isn't useful and OSRM often refuses.
  function pickProfile(points) {
    if (points.length < 2) return 'foot';
    var maxLeg = 0;
    for (var i = 0; i + 1 < points.length; i++) {
      var d = haversineMeters(points[i], points[i + 1]);
      if (d > maxLeg) maxLeg = d;
    }
    return maxLeg > 15000 ? 'driving' : 'foot';
  }

  function formatDistance(meters) {
    if (meters < 1000) return Math.round(meters) + ' м';
    return (meters / 1000).toFixed(meters < 10000 ? 1 : 0) + ' км';
  }

  function formatDuration(seconds) {
    if (seconds < 60) return Math.round(seconds) + ' сек';
    var m = Math.round(seconds / 60);
    if (m < 60) return m + ' мин';
    var h = Math.floor(m / 60);
    var rem = m % 60;
    return rem === 0 ? h + ' ч' : h + ' ч ' + rem + ' мин';
  }

  var bounds = [];

  // --- Достопримечательности (нумерованные точки маршрута) ---
  var attractionMarkers = [];
  attractions.forEach(function (p, i) {
    var m = L.marker([p.lat, p.lng], { icon: makeIcon(i + 1, 'pending') })
      .addTo(map)
      .bindPopup('<b>' + (i + 1) + '. ' + p.name + '</b>');
    attractionMarkers.push(m);
    bounds.push([p.lat, p.lng]);
  });

  // --- Кафе/рестораны ---
  restaurants.forEach(function (p) {
    L.marker([p.lat, p.lng], { icon: makeGlyphIcon(FOOD_SVG, 'food') })
      .addTo(map)
      .bindPopup('<b>🍴 ' + p.name + '</b>');
    bounds.push([p.lat, p.lng]);
  });

  // --- Отель ---
  if (hotel) {
    L.marker([hotel.lat, hotel.lng], { icon: makeGlyphIcon(HOTEL_SVG, 'hotel') })
      .addTo(map)
      .bindPopup('<b>🏨 ' + hotel.name + '</b>');
    bounds.push([hotel.lat, hotel.lng]);
  }

  if (bounds.length === 0) {
    map.setView([data.center.lat, data.center.lng], data.zoom);
  } else if (bounds.length === 1) {
    map.setView(bounds[0], 14);
  } else {
    map.fitBounds(bounds, { padding: [50, 50] });
  }

  var routeLayer = null;

  function clearRoute() {
    if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
  }

  function drawDashedThrough(orderedIdxs) {
    clearRoute();
    if (orderedIdxs.length < 2) return;
    var coords = orderedIdxs.map(function (i) {
      var p = attractions[i];
      return [p.lat, p.lng];
    });
    routeLayer = L.polyline(coords, {
      color: '#0F766E', weight: 3, opacity: 0.7, dashArray: '6 8'
    }).addTo(map);
  }

  function relabelMarkers(orderedIdxs) {
    attractionMarkers.forEach(function (m) { map.removeLayer(m); });
    attractionMarkers = [];
    var last = orderedIdxs.length - 1;
    orderedIdxs.forEach(function (origIdx, displayIdx) {
      var p = attractions[origIdx];
      var kind;
      if (orderedIdxs.length > 1 && displayIdx === 0) kind = 'start';
      else if (orderedIdxs.length > 1 && displayIdx === last) kind = 'end';
      else kind = null;
      var m = L.marker([p.lat, p.lng], { icon: makeIcon(displayIdx + 1, kind) })
        .addTo(map)
        .bindPopup('<b>' + (displayIdx + 1) + '. ' + p.name + '</b>');
      attractionMarkers.push(m);
    });
  }

  // One OSRM "route" call across all ordered waypoints with overview=full.
  // Returns { coords, distance, duration } or null on failure.
  function fetchFullRoute(orderedIdxs, profile) {
    if (orderedIdxs.length < 2) return Promise.resolve(null);
    var coordStr = orderedIdxs.map(function (i) {
      var p = attractions[i];
      return p.lng.toFixed(6) + ',' + p.lat.toFixed(6);
    }).join(';');
    var url = 'https://router.project-osrm.org/route/v1/' + profile + '/' +
      coordStr + '?overview=full&geometries=geojson&steps=false';

    return fetch(url)
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (d) {
        if (!d || d.code !== 'Ok' || !Array.isArray(d.routes) || d.routes.length === 0) {
          return null;
        }
        var route = d.routes[0];
        var geom = route.geometry;
        if (!geom || !Array.isArray(geom.coordinates) || geom.coordinates.length < 2) {
          return null;
        }
        return {
          coords: geom.coordinates,
          distance: route.distance,
          duration: route.duration
        };
      });
  }

  function drawRouteAlong(orderedIdxs, profile) {
    drawDashedThrough(orderedIdxs);
    if (orderedIdxs.length < 2) return;

    fetchFullRoute(orderedIdxs, profile).then(function (result) {
      if (!result) return;
      clearRoute();
      routeLayer = L.geoJSON(
        { type: 'LineString', coordinates: result.coords },
        { style: { color: '#0F766E', weight: 4, opacity: 0.9 } }
      ).addTo(map);

      var label = (profile === 'foot' ? 'Пешком' : 'На авто') +
        ' · ' + formatDistance(result.distance) +
        ' · ' + formatDuration(result.duration);
      setInfo(label);
    });
  }

  function attemptTripOptimization() {
    if (attractions.length < 3) {
      var trivial = attractions.map(function (_, i) { return i; });
      var profile = pickProfile(trivial.map(function (i) { return attractions[i]; }));
      relabelMarkers(trivial);
      drawRouteAlong(trivial, profile);
      postOrder(trivial);
      return;
    }

    var profile = pickProfile(attractions);
    var coordStr = attractions.map(function (p) {
      return p.lng.toFixed(6) + ',' + p.lat.toFixed(6);
    }).join(';');

    var tripUrl = 'https://router.project-osrm.org/trip/v1/' + profile + '/' +
      coordStr + '?source=first&roundtrip=false&overview=false';

    fetch(tripUrl)
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (d) {
        var orderedIdxs;
        if (
          d && d.code === 'Ok' && Array.isArray(d.waypoints) &&
          d.waypoints.length === attractions.length
        ) {
          orderedIdxs = attractions.map(function (_, i) {
            var wp = d.waypoints[i] || {};
            return {
              originalIndex: i,
              tripIndex: typeof wp.trips_index === 'number' ? wp.trips_index : 0,
              waypointIndex: typeof wp.waypoint_index === 'number' ? wp.waypoint_index : 0,
            };
          }).sort(function (a, b) {
            if (a.tripIndex !== b.tripIndex) return a.tripIndex - b.tripIndex;
            return a.waypointIndex - b.waypointIndex;
          }).map(function (x) { return x.originalIndex; });
        } else {
          orderedIdxs = attractions.map(function (_, i) { return i; });
        }

        relabelMarkers(orderedIdxs);
        drawRouteAlong(orderedIdxs, profile);
        postOrder(orderedIdxs);
      });
  }

  if (attractions.length > 1) {
    var initial = attractions.map(function (_, i) { return i; });
    drawDashedThrough(initial);
    attemptTripOptimization();
  } else if (attractions.length === 1) {
    attractionMarkers[0].setIcon(makeIcon(1, null));
  }

  setTimeout(function () { map.invalidateSize(); }, 200);
  window.addEventListener('resize', function () { map.invalidateSize(); });
})();
</script>
</body>
</html>`;
}
