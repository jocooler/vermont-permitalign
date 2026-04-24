import { useEffect, useRef, useState } from "react";
import { X, Search, CheckCircle2, MapPin, Loader2, AlertTriangle, Leaf } from "lucide-react";

const PARCEL_URL =
  "https://services1.arcgis.com/BkFxaEFNwHqX3tAw/arcgis/rest/services/FS_VCGI_OPENDATA_Cadastral_VTPARCELS_poly_standardized_parcels_SP_v1/FeatureServer/0";

const WETLAND_URL =
  "https://services5.arcgis.com/Uzks6LSde6r23wwG/arcgis/rest/services/Vermont_Significant_Wetland_Inventory/FeatureServer/0";

// FEMA NFHL — try primary, fall back to ArcGIS Online hosted copy
const FEMA_NFHL_URLS = [
  "https://hazards-fema.maps.arcgis.com/arcgis/rest/services/FIRMette/NFHLREST/FeatureServer/28",
  "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28",
];

const NHD_FLOWLINE_URL =
  "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/6"; // Flowline - Large Scale

const NHD_WATERBODY_URL =
  "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/12"; // Waterbody - Large Scale

const VTRANS_ROADS_URL =
  "https://maps.vtrans.vermont.gov/arcgis/rest/services/Master/General/FeatureServer/39"; // All Roads

// Degrees per meter at ~44°N latitude
const DEG_PER_METER = 1 / 111320;
const STREAM_BUFFER_M = 100;
const LAKE_BUFFER_M = 250 * 0.3048; // 250 ft in meters (about 76m)

function bufferEnvelope(rings, bufferDeg) {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return {
    xmin: minLon - bufferDeg, ymin: minLat - bufferDeg,
    xmax: maxLon + bufferDeg, ymax: maxLat + bufferDeg,
    spatialReference: { wkid: 4326 },
  };
}

// Check if a parcel (GeoJSON geometry) intersects a classified wetland (Class I or II)
async function checkWetlandIntersection(parcelGeometry) {
  const esriGeom = {
    rings: parcelGeometry.coordinates,
    spatialReference: { wkid: 4326 },
  };
  const url = `${WETLAND_URL}/query?` + new URLSearchParams({
    geometry: JSON.stringify(esriGeom),
    geometryType: "esriGeometryPolygon",
    spatialRel: "esriSpatialRelIntersects",
    where: "CLASS IN (1, 2)",
    outFields: "CLASS,NWICode",
    returnGeometry: false,
    inSR: 4326,
    f: "json",
  });
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await res.json();
  return data.features || [];
}

// Check FEMA floodplain — try multiple endpoints
async function checkFloodplain(parcelGeometry) {
  const esriGeom = {
    rings: parcelGeometry.coordinates,
    spatialReference: { wkid: 4326 },
  };
  const params = new URLSearchParams({
    geometry: JSON.stringify(esriGeom),
    geometryType: "esriGeometryPolygon",
    spatialRel: "esriSpatialRelIntersects",
    where: "FLD_ZONE LIKE 'A%' OR FLD_ZONE LIKE 'V%'",
    outFields: "FLD_ZONE,ZONE_SUBTY",
    returnGeometry: false,
    inSR: 4326,
    f: "json",
  });
  for (const baseUrl of FEMA_NFHL_URLS) {
    try {
      const res = await fetch(`${baseUrl}/query?${params}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.error) continue;
      return (data.features || []).length > 0;
    } catch {
      // try next
    }
  }
  return null; // unavailable
}

// Check NHD perennial streams within ~100m buffer of parcel
async function checkNearStream(parcelGeometry) {
  const bufDeg = STREAM_BUFFER_M * DEG_PER_METER;
  const env = bufferEnvelope(parcelGeometry.coordinates, bufDeg);
  const url = `${NHD_FLOWLINE_URL}/query?` + new URLSearchParams({
    geometry: JSON.stringify(env),
    geometryType: "esriGeometryEnvelope",
    spatialRel: "esriSpatialRelIntersects",
    // FCode 46006 = perennial stream/river
    where: "FCode = 46006",
    outFields: "FCode,GNIS_Name",
    returnGeometry: false,
    inSR: 4326,
    f: "json",
  });
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await res.json();
  return (data.features || []).length > 0;
}

// Check NHD waterbodies (lakes/ponds >10 acres) within 250ft (~76m) buffer
async function checkNearLake(parcelGeometry) {
  const bufDeg = LAKE_BUFFER_M * DEG_PER_METER;
  const env = bufferEnvelope(parcelGeometry.coordinates, bufDeg);
  const url = `${NHD_WATERBODY_URL}/query?` + new URLSearchParams({
    geometry: JSON.stringify(env),
    geometryType: "esriGeometryEnvelope",
    spatialRel: "esriSpatialRelIntersects",
    // FTYPE 390 = LakePond, 436 = Reservoir; filter >10 acres (~0.040469 sqkm)
    where: "FTYPE IN (390, 436) AND AREASQKM > 0.040469",
    outFields: "FTYPE,GNIS_NAME,AREASQKM",
    returnGeometry: false,
    inSR: 4326,
    f: "json",
  });
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await res.json();
  return (data.features || []).length > 0;
}

// Check elevation at parcel centroid using USGS EPQS
async function checkElevation(rings) {
  const coords = rings[0];
  let sumLon = 0, sumLat = 0;
  for (const [lon, lat] of coords) { sumLon += lon; sumLat += lat; }
  const lon = sumLon / coords.length;
  const lat = sumLat / coords.length;
  const url = `https://epqs.nationalmap.gov/v1/json?x=${lon}&y=${lat}&units=Feet&includeDate=false`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await res.json();
  return data.value ?? data.locations?.[0]?.elevation; // feet
}

// Check if parcel touches a state-maintained highway (VTrans AOTCLASS state routes)
async function checkStateHighway(parcelGeometry) {
  const env = bufferEnvelope(parcelGeometry.coordinates, 0.0005); // ~50m buffer
  const url = `${VTRANS_ROADS_URL}/query?` + new URLSearchParams({
    geometry: JSON.stringify(env),
    geometryType: "esriGeometryEnvelope",
    spatialRel: "esriSpatialRelIntersects",
    // AOTCLASS: 5=US Route, 6=State Route, 7=Interstate
    where: "AOTCLASS IN (5, 6, 7)",
    outFields: "AOTCLASS,PRIMARYNAME,RTNAME",
    returnGeometry: false,
    inSR: 4326,
    f: "json",
  });
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await res.json();
  return (data.features || []).length > 0;
}

// Query the feature service via REST — no SDK needed
async function queryParcelAtPoint(mapPoint, mapView) {
  // Convert screen click to map coords, then do a spatial query
  const { x, y } = mapPoint;
  const url = `${PARCEL_URL}/query?` + new URLSearchParams({
    geometry: JSON.stringify({ x, y, spatialReference: { wkid: 32145 } }),
    geometryType: "esriGeometryPoint",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "SPAN,TOWN,TNAME,OWNER1,ADDRGL1,ACRESGL",
    returnGeometry: true,
    outSR: 4326,
    f: "json",
  });
  const res = await fetch(url);
  const data = await res.json();
  return data.features?.[0] || null;
}

async function searchBySpan(span) {
  const url = `${PARCEL_URL}/query?` + new URLSearchParams({
    where: `SPAN='${span.trim()}'`,
    outFields: "SPAN,TOWN,TNAME,OWNER1,ADDRGL1,ACRESGL",
    returnGeometry: true,
    outSR: 4326,
    f: "json",
  });
  const res = await fetch(url);
  const data = await res.json();
  return data.features?.[0] || null;
}

async function searchByAddress(address) {
  const url = `${PARCEL_URL}/query?` + new URLSearchParams({
    where: `ADDRGL1 LIKE '%${address.trim().toUpperCase()}%'`,
    outFields: "SPAN,TOWN,TNAME,OWNER1,ADDRGL1,ACRESGL",
    returnGeometry: true,
    outSR: 4326,
    resultRecordCount: 5,
    f: "json",
  });
  const res = await fetch(url);
  const data = await res.json();
  return data.features || [];
}

// Compute centroid of a polygon ring (lat/lng)
function centroidOfRing(rings) {
  const coords = rings[0];
  let sumLon = 0, sumLat = 0;
  for (const [lon, lat] of coords) { sumLon += lon; sumLat += lat; }
  return [sumLon / coords.length, sumLat / coords.length];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ParcelPicker({ onClose, onSelect, readOnly = false, initialAddress = null, initialTown = null, latitude = null, longitude = null, span = null }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const parcelLayerRef = useRef(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [searchMode, setSearchMode] = useState("address"); // "address" | "span"
  const [error, setError] = useState(null);
  const [siteChecks, setSiteChecks] = useState(null); // null | "checking" | { wetland, floodplain, stream, lake, elevation, stateHighway }

  // Load Leaflet + ESRI-Leaflet from CDN
  useEffect(() => {
    const loadScript = (src, id) => new Promise((resolve, reject) => {
      if (document.getElementById(id)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src; s.id = id;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
    const loadCSS = (href, id) => {
      if (document.getElementById(id)) return;
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = href; l.id = id;
      document.head.appendChild(l);
    };

    loadCSS("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", "leaflet-css");
    loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", "leaflet-js")
      .then(() => loadScript("https://unpkg.com/esri-leaflet@3.0.12/dist/esri-leaflet.js", "esri-leaflet-js"))
      .then(() => setMapReady(true));
  }, []);

  // Init map once libraries are loaded
  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMapRef.current) return;
    const L = window.L;
    const esriL = window.L.esri;

    // Use provided coordinates if available (read-only mode), otherwise center on Vermont
    const center = latitude && longitude ? [latitude, longitude] : [44.0, -72.7];
    const zoom = latitude && longitude ? 14 : 8;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: !readOnly,
    });

    // Basemap
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap, © CARTO",
      maxZoom: 20,
    }).addTo(map);

    // Vermont parcel feature layer (show at zoom 14+)
    const parcelLayer = esriL.featureLayer({
      url: PARCEL_URL,
      minZoom: 13,
      style: () => ({
        color: "#2d6a4f",
        weight: 1.5,
        fillColor: "#d8f3dc",
        fillOpacity: 0.3,
      }),
      onEachFeature: (feature, layer) => {
        layer.on("click", () => {
          if (!readOnly) {
            handleFeatureSelect(feature);
            highlightParcel(feature);
          }
        });
        layer.on("mouseover", function () {
          if (!readOnly) this.setStyle({ fillOpacity: 0.6, weight: 2.5 });
        });
        layer.on("mouseout", function () {
          if (!readOnly) parcelLayer.resetStyle(this);
        });
      },
    }).addTo(map);

    // Click on map tiles only — do a REST query (skip in read-only mode)
    if (!readOnly) {
      map.on("click", async (e) => {
        const target = e.originalEvent.target;
        const isMapSurface = target === map._container ||
          target.classList.contains("leaflet-tile") ||
          target.classList.contains("leaflet-tile-container") ||
          target.closest?.(".leaflet-tile-pane");
        if (!isMapSurface) return;
        handleMapClick(e.latlng, map);
      });
    }

    leafletMapRef.current = map;
    parcelLayerRef.current = parcelLayer;

    return () => { map.remove(); leafletMapRef.current = null; };
  }, [mapReady]);

  // Auto-zoom to parcel by SPAN in read-only mode
  useEffect(() => {
    if (!mapReady || !readOnly || !span || !leafletMapRef.current) return;
    const doZoom = async () => {
      const feature = await searchBySpan(span);
      if (feature) highlightParcel(feature);
    };
    doZoom();
  }, [mapReady, span]);

  const highlightParcel = (feature) => {
    const L = window.L;
    const map = leafletMapRef.current;
    if (!map || !L) return;

    // Remove old highlight
    if (map._parcelHighlight) {
      try { map.removeLayer(map._parcelHighlight); } catch (_) {}
      map._parcelHighlight = null;
    }

    if (!feature?.geometry) return;

    // Normalize: REST API returns {geometry: {rings: [...]}} not GeoJSON
    let geojsonFeature = feature;
    if (feature.geometry?.rings) {
      geojsonFeature = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: feature.geometry.rings,
        },
        properties: feature.attributes || feature.properties || {},
      };
    }

    try {
      const geojsonLayer = L.geoJSON(geojsonFeature, {
        style: { color: "#1a3d2e", weight: 3, fillColor: "#52b788", fillOpacity: 0.5 },
      }).addTo(map);
      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { maxZoom: 17, padding: [40, 40] });
      }
      map._parcelHighlight = geojsonLayer;
    } catch (e) {
      console.warn("Could not highlight parcel:", e);
    }
  };

  const handleFeatureSelect = async (feature) => {
    // REST API uses `attributes`, GeoJSON uses `properties`
    const attrs = feature.attributes || feature.properties || {};
    const span = attrs.SPAN || "";
    const town = attrs.TOWN || attrs.TNAME || "";
    const owner = attrs.OWNER1 || "";
    const addr = attrs.ADDRGL1 || "";
    const acres = attrs.ACRESGL != null ? parseFloat(attrs.ACRESGL) : null;
    setSelectedParcel({ span, town, owner, addr, acres, feature });
    setError(null);

    // Build GeoJSON geometry from feature
    let geom = null;
    if (feature.geometry?.rings) {
      geom = { type: "Polygon", coordinates: feature.geometry.rings };
    } else if (feature.geometry?.type === "Polygon") {
      geom = feature.geometry;
    }
    if (!geom) { setSiteChecks(null); return; }

    setSiteChecks("checking");

    const safe = async (name, fn) => {
      try { return await fn(); }
      catch (err) { console.error(`[ParcelPicker] ${name} failed:`, err); return null; }
    };

    const [wetlandHits, floodplain, stream, lake, elevation, stateHighway] = await Promise.all([
      safe("Wetlands (VSVI)", () => checkWetlandIntersection(geom)),
      safe("Floodplain (FEMA NFHL)", () => checkFloodplain(geom)),
      safe("Streams (NHD Flowline)", () => checkNearStream(geom)),
      safe("Lakes/Ponds (NHD Waterbody)", () => checkNearLake(geom)),
      safe("Elevation (USGS EPQS)", () => checkElevation(geom.coordinates)),
      safe("State Highways (VTrans)", () => checkStateHighway(geom)),
    ]);

    const classes = wetlandHits ? [...new Set(wetlandHits.map(h => (h.attributes || h.properties || {}).CLASS))] : [];
    const allFailed = [wetlandHits, floodplain, stream, lake, elevation, stateHighway].every(v => v === null);
    setSiteChecks({
      wetland: wetlandHits ? { hasWetland: wetlandHits.length > 0, classes } : null,
      floodplain,
      stream,
      lake,
      elevation,
      stateHighway,
      fetchError: allFailed,
    });
  };

  const handleMapClick = async (latlng, map) => {
    // Convert latlng to Vermont SP coords for the query
    setClicking(true);
    setError(null);
    try {
      // Use a small bounding box query instead (lat/lng → WKID 4326)
      const tol = 0.0001;
      const url = `${PARCEL_URL}/query?` + new URLSearchParams({
        geometry: JSON.stringify({
          xmin: latlng.lng - tol, ymin: latlng.lat - tol,
          xmax: latlng.lng + tol, ymax: latlng.lat + tol,
          spatialReference: { wkid: 4326 }
        }),
        geometryType: "esriGeometryEnvelope",
        spatialRel: "esriSpatialRelIntersects",
        outFields: "SPAN,TOWN,TNAME,OWNER1,ADDRGL1,ACRESGL",
        returnGeometry: true,
        inSR: 4326,
        outSR: 4326,
        f: "json",
      });
      const res = await fetch(url);
      const data = await res.json();
      const feature = data.features?.[0];
      if (feature) {
        handleFeatureSelect(feature);
        highlightParcel(feature);
      } else {
        setError("No parcel found at that location. Try clicking directly on a parcel boundary.");
      }
    } catch (e) {
      setError("Failed to query parcel. Please try again.");
    } finally {
      setClicking(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setSearching(true);
    setSearchResults([]);
    setError(null);
    try {
      let results;
      if (searchMode === "span") {
        const f = await searchBySpan(searchText);
        results = f ? [f] : [];
      } else {
        results = await searchByAddress(searchText);
      }
      if (results.length === 0) {
        setError("No parcels found. Try a different search term.");
      } else if (results.length === 1) {
        handleFeatureSelect(results[0]);
        highlightParcel(results[0]);
      } else {
        setSearchResults(results);
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleResultClick = (feature) => {
    handleFeatureSelect(feature);
    highlightParcel(feature);
    setSearchResults([]);
  };

  const handleConfirm = () => {
    if (selectedParcel?.span) {
      const checks = (siteChecks && siteChecks !== "checking") ? siteChecks : null;
      onSelect(
        selectedParcel.span,
        selectedParcel.town,
        selectedParcel.addr,
        checks?.wetland != null ? checks.wetland.hasWetland : undefined,
        checks?.floodplain != null ? checks.floodplain : undefined,
        checks?.stream != null ? checks.stream : undefined,
        checks?.lake != null ? checks.lake : undefined,
        checks?.stateHighway != null ? checks.stateHighway : undefined,
        checks?.elevation != null ? checks.elevation : undefined,
        selectedParcel.acres != null ? selectedParcel.acres : undefined,
      );
      onClose();
    }
  };

  return (
    <div className={`${readOnly ? "w-full h-full" : "fixed inset-0 z-50"} flex flex-col ${readOnly ? "bg-white" : "bg-black/60"}`} onClick={readOnly ? undefined : onClose}>
      <div className={`bg-white flex flex-col ${readOnly ? "h-full" : "h-full"}`} onClick={e => e.stopPropagation()}>
         {/* Header */}
         {!readOnly && (
         <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: "#1a3d2e" }}>
           <div>
             <div className="text-xs font-bold uppercase tracking-widest text-green-300">Vermont Parcel Finder</div>
             <div className="text-white font-semibold text-sm">Search or click a parcel to select it</div>
           </div>
           <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded">
             <X size={20} />
           </button>
         </div>
         )}

        {/* Search Bar */}
        {!readOnly && (
        <div className="flex-shrink-0 px-3 py-2 border-b bg-slate-50 flex gap-2 flex-wrap items-center">
          <div className="flex rounded border overflow-hidden text-xs font-semibold" style={{ borderColor: "#cbd5e1" }}>
            <button
              className="px-3 py-1.5 transition-colors"
              style={{ background: searchMode === "address" ? "#1a3d2e" : "white", color: searchMode === "address" ? "white" : "#64748b" }}
              onClick={() => setSearchMode("address")}
            >Address</button>
            <button
              className="px-3 py-1.5 transition-colors"
              style={{ background: searchMode === "span" ? "#1a3d2e" : "white", color: searchMode === "span" ? "white" : "#64748b" }}
              onClick={() => setSearchMode("span")}
            >SPAN</button>
          </div>
          <div className="flex flex-1 gap-2 min-w-0">
            <input
              className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none min-w-0"
              style={{ borderColor: "#cbd5e1" }}
              placeholder={searchMode === "span" ? "e.g. 273-086-10023" : "e.g. 123 Main St"}
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setSearchResults([]); }}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchText.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded disabled:opacity-40"
              style={{ background: "#2d6a4f", color: "white" }}
            >
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Search
            </button>
          </div>
          </div>
          )}

          {/* Search Results Dropdown */}
        {searchResults.length > 1 && (
          <div className="flex-shrink-0 border-b bg-white shadow-md max-h-40 overflow-y-auto">
            {searchResults.map((f, i) => {
              const a = f.attributes || f.properties || {};
              return (
                <button
                  key={i}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 border-b last:border-0 flex items-center gap-2"
                  style={{ borderColor: "#f1f5f9" }}
                  onClick={() => handleResultClick(f)}
                >
                  <MapPin size={13} className="text-green-700 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-slate-800">{a.ADDRGL1 || a.TNAME}</div>
                    <div className="text-xs text-slate-500">{a.TOWN} · SPAN: {a.SPAN}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex-shrink-0 px-4 py-2 text-xs text-amber-800 bg-amber-50 border-b border-amber-200">
            {error}
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative min-h-0">
          {clicking && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 pointer-events-none">
              <Loader2 size={28} className="animate-spin text-green-700" />
            </div>
          )}
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 size={18} className="animate-spin" /> Loading map…
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
          {mapReady && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm text-xs text-slate-600 px-3 py-1.5 rounded-full shadow border border-slate-200 pointer-events-none">
              Zoom in to see parcels · Click a parcel to select
            </div>
          )}
        </div>

        {/* Selected Parcel Footer */}
        {!readOnly && (
        <div className="flex-shrink-0 border-t bg-white px-4 py-3">
          {selectedParcel ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wide text-green-700">Selected Parcel</span>
                  <span className="font-mono text-sm font-bold text-slate-800">{selectedParcel.span}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  {[selectedParcel.addr, selectedParcel.town].filter(Boolean).join(" · ")}
                  {selectedParcel.owner && ` · ${selectedParcel.owner}`}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                  {selectedParcel.acres != null && (
                    <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      {selectedParcel.acres < 0.1
                        ? `${Math.round(selectedParcel.acres * 43560).toLocaleString()} sq ft`
                        : `${selectedParcel.acres.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} acres`}
                    </span>
                  )}
                  {siteChecks === "checking" && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Loader2 size={11} className="animate-spin" /> Checking site conditions…
                    </span>
                  )}
                  {siteChecks && siteChecks !== "checking" && (
                    <>
                      {/* Wetlands */}
                      {siteChecks.wetland != null && (
                        siteChecks.wetland.hasWetland ? (
                          <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle size={11} /> Class {siteChecks.wetland.classes.sort().join("/")} wetland
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            <Leaf size={11} /> No wetlands
                          </span>
                        )
                      )}
                      {/* Floodplain */}
                      {siteChecks.floodplain != null && (
                        siteChecks.floodplain ? (
                          <span className="flex items-center gap-1 font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <AlertTriangle size={11} /> In floodplain
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            <Leaf size={11} /> No floodplain
                          </span>
                        )
                      )}
                      {/* Stream */}
                      {siteChecks.stream && (
                        <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertTriangle size={11} /> Near stream
                        </span>
                      )}
                      {/* Lake */}
                      {siteChecks.lake && (
                        <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertTriangle size={11} /> Near lake/pond
                        </span>
                      )}
                      {/* Elevation */}
                      {siteChecks.elevation != null && (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${siteChecks.elevation > 2500 ? "text-amber-700 bg-amber-50 border-amber-200 font-semibold" : "text-slate-500 bg-slate-50 border-slate-200"}`}>
                          {siteChecks.elevation > 2500 ? <AlertTriangle size={11} /> : null}
                          Elevation: {Math.round(siteChecks.elevation).toLocaleString()} ft
                        </span>
                      )}
                      {/* State highway */}
                      {siteChecks.stateHighway && (
                        <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          <AlertTriangle size={11} /> State highway access
                        </span>
                      )}
                      {/* Fetch error */}
                      {siteChecks.fetchError && (
                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <AlertTriangle size={11} /> Site condition data unavailable — check console for details
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <button
                onPointerDown={e => { e.stopPropagation(); e.preventDefault(); handleConfirm(); }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded flex-shrink-0 cursor-pointer"
                style={{ background: "#1a3d2e", color: "white" }}
              >
                <CheckCircle2 size={15} /> Use This Parcel
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-1">
              No parcel selected — search above or click a parcel on the map
            </div>
          )}
          </div>
          )}
          </div>
          </div>
          );
          }