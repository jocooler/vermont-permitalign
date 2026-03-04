import { useEffect, useRef, useState } from "react";
import { X, Search, CheckCircle2, MapPin, Loader2 } from "lucide-react";

const PARCEL_URL =
  "https://services1.arcgis.com/BkFxaEFNwHqX3tAw/arcgis/rest/services/FS_VCGI_OPENDATA_Cadastral_VTPARCELS_poly_standardized_parcels_SP_v1/FeatureServer/0";

// Query the feature service via REST — no SDK needed
async function queryParcelAtPoint(mapPoint, mapView) {
  // Convert screen click to map coords, then do a spatial query
  const { x, y } = mapPoint;
  const url = `${PARCEL_URL}/query?` + new URLSearchParams({
    geometry: JSON.stringify({ x, y, spatialReference: { wkid: 32145 } }),
    geometryType: "esriGeometryPoint",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "SPAN,TOWN,TNAME,OWNER1,ADDRGL1",
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
    outFields: "SPAN,TOWN,TNAME,OWNER1,ADDRGL1",
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
    outFields: "SPAN,TOWN,TNAME,OWNER1,ADDRGL1",
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
export default function ParcelPicker({ onClose, onSelect }) {
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

    const map = L.map(mapRef.current, {
      center: [44.0, -72.7], // Center of Vermont
      zoom: 8,
      zoomControl: true,
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
        layer.on("click", () => handleFeatureSelect(feature));
        layer.on("mouseover", function () {
          this.setStyle({ fillOpacity: 0.6, weight: 2.5 });
        });
        layer.on("mouseout", function () {
          parcelLayer.resetStyle(this);
        });
      },
    }).addTo(map);

    // Click on map (not on a feature) — do a REST query
    map.on("click", async (e) => {
      if (e.originalEvent.target !== map._container &&
        !e.originalEvent.target.classList.contains("leaflet-tile")) return;
      handleMapClick(e.latlng, map);
    });

    leafletMapRef.current = map;
    parcelLayerRef.current = parcelLayer;

    return () => { map.remove(); leafletMapRef.current = null; };
  }, [mapReady]);

  const highlightParcel = (feature) => {
    const L = window.L;
    const map = leafletMapRef.current;
    if (!map) return;

    // Remove old highlight
    if (map._parcelHighlight) { map.removeLayer(map._parcelHighlight); }

    if (feature?.geometry) {
      const geojsonLayer = L.geoJSON(feature, {
        style: { color: "#1a3d2e", weight: 3, fillColor: "#52b788", fillOpacity: 0.5 },
      }).addTo(map);
      map._parcelHighlight = geojsonLayer;
      map.fitBounds(geojsonLayer.getBounds(), { maxZoom: 17, padding: [40, 40] });
    }
  };

  const handleFeatureSelect = (feature) => {
    const attrs = feature.properties || feature.attributes || {};
    const span = attrs.SPAN || attrs.span || "";
    const town = attrs.TOWN || attrs.TNAME || "";
    const owner = attrs.OWNER1 || "";
    const addr = attrs.ADDRGL1 || "";
    setSelectedParcel({ span, town, owner, addr, feature });
    setError(null);
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
        outFields: "SPAN,TOWN,TNAME,OWNER1,ADDRGL1",
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
      onSelect(selectedParcel.span, selectedParcel.town, selectedParcel.addr);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60">
      <div className="bg-white flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: "#1a3d2e" }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-green-300">Vermont Parcel Finder</div>
            <div className="text-white font-semibold text-sm">Search or click a parcel to select it</div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
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
              </div>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded flex-shrink-0"
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
      </div>
    </div>
  );
}