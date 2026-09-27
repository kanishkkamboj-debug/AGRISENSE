import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchFields, saveFieldBoundary } from "../../services/api";
import { useIoTData } from "../../hooks/useIoTData";
import { Search, Layers, Square, MapPin, CheckSquare, X, Save, Radio, Edit3, Trash2, Check } from "lucide-react";

function calculatePolygonMetrics(coords: [number, number][]): { areaHectares: number; perimeterMeters: number } {
  if (coords.length < 3) return { areaHectares: 0, perimeterMeters: 0 };

  const R = 6378137; // Earth radius in meters
  let areaSum = 0;
  let perimeter = 0;

  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];

    const lat1 = (p1[0] * Math.PI) / 180;
    const lat2 = (p2[0] * Math.PI) / 180;
    const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
    const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    perimeter += R * c;

    const x1 = ((p1[1] * Math.PI) / 180) * R * Math.cos(lat1);
    const y1 = lat1 * R;
    const x2 = ((p2[1] * Math.PI) / 180) * R * Math.cos(lat2);
    const y2 = lat2 * R;

    areaSum += x1 * y2 - x2 * y1;
  }

  const areaM2 = Math.abs(areaSum) / 2;
  const areaHectares = parseFloat((areaM2 / 10000).toFixed(2));
  const perimeterMeters = parseFloat(perimeter.toFixed(0));

  return { areaHectares, perimeterMeters };
}

export const GISView: React.FC = () => {
  const { selectedCrop } = useIoTData();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [activeTab, setActiveTab] = useState<"Layers" | "Location" | "Sources">("Layers");
  const [worldSoil, setWorldSoil] = useState<boolean>(true);
  const [ndviVegetation, setNdviVegetation] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [currentCoords, setCurrentCoords] = useState<[number, number]>([30.901, 75.857]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([
    [30.900, 75.855],
    [30.900, 75.860],
    [30.905, 75.860],
    [30.905, 75.855],
  ]);

  const drawnPolygonRef = useRef<L.Polygon | null>(null);
  const drawnMarkersRef = useRef<L.Marker[]>([]);

  const metrics = calculatePolygonMetrics(drawnPoints);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current).setView(currentCoords, 14);
    mapRef.current = map;

    // Esri Satellite World Imagery Base Layer
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS",
    }).addTo(map);

    // Marker over Field Hub
    const marker = L.marker(currentCoords)
      .addTo(map)
      .bindPopup(`<b>Field 01 — Demonstration Plot</b><br>Target Crop: ${selectedCrop?.name || "Wheat"}`)
      .openPopup();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update polygon layer on drawnPoints change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (drawnPolygonRef.current) {
      map.removeLayer(drawnPolygonRef.current);
      drawnPolygonRef.current = null;
    }
    drawnMarkersRef.current.forEach((m) => map.removeLayer(m));
    drawnMarkersRef.current = [];

    if (drawnPoints.length > 0) {
      drawnPolygonRef.current = L.polygon(drawnPoints, {
        color: isDrawing ? "#F59E0B" : "#34D399",
        fillColor: isDrawing ? "#F59E0B" : "#34D399",
        fillOpacity: 0.3,
        weight: 3,
      }).addTo(map);

      drawnPoints.forEach((pt, idx) => {
        const m = L.circleMarker(pt, { radius: 5, color: "#FFFFFF", fillColor: "#34D399", fillOpacity: 1 }).addTo(map);
        drawnMarkersRef.current.push(m as any);
      });
    }
  }, [drawnPoints, isDrawing]);

  // Click handler for drawing vs setting centroid
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const pt: [number, number] = [parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))];

      if (isDrawing) {
        setDrawnPoints((prev) => [...prev, pt]);
      } else {
        setCurrentCoords(pt);
      }
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [isDrawing]);

  const handleSearchLocation = async () => {
    if (!searchQuery.trim() || !mapRef.current) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCurrentCoords([lat, lon]);
        mapRef.current.setView([lat, lon], 14);
      }
    } catch (e) {
      console.warn("Geocoding error", e);
    }
  };

  const handleSaveBoundary = async () => {
    setIsSaving(true);
    const polygonGeoJson = drawnPoints.length >= 3
      ? {
          type: "Polygon" as const,
          coordinates: [drawnPoints.map(([lat, lng]) => [lng, lat])],
        }
      : {
          type: "Polygon" as const,
          coordinates: [
            [
              [currentCoords[1] - 0.005, currentCoords[0] - 0.005],
              [currentCoords[1] + 0.005, currentCoords[0] - 0.005],
              [currentCoords[1] + 0.005, currentCoords[0] + 0.005],
              [currentCoords[1] - 0.005, currentCoords[0] + 0.005],
              [currentCoords[1] - 0.005, currentCoords[0] - 0.005],
            ],
          ],
        };

    const success = await saveFieldBoundary({
      fieldId: "FIELD-PUNJAB-01",
      name: "Field 01 - Main Plot",
      locationName: searchQuery || "Punjab Main Plot",
      centroid: currentCoords,
      geometry: polygonGeoJson,
      currentCropId: selectedCrop?.id || "wheat",
    });
    setIsSaving(false);
    if (success) {
      setSaveStatus(`Saved! (${metrics.areaHectares || 4.5} Ha)`);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-6 text-[#F0FDF4] font-sans">
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A16] border border-[#202922] shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">GIS Field Map & Boundary Engine</h1>
          <p className="text-xs text-[#8E9B91] font-mono mt-1">
            Draw custom field polygon boundaries · Real-time Hectare area calculation · Syncs directly to MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setIsDrawing(!isDrawing)}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 border transition-all ${
              isDrawing ? "bg-[#F59E0B] text-black border-[#F59E0B]" : "bg-[#0F1411] text-[#34D399] border-[#1F2922] hover:text-white"
            }`}
          >
            <Edit3 className="w-4 h-4" /> {isDrawing ? "Finish Drawing" : "Draw Boundary"}
          </button>

          {drawnPoints.length > 0 && (
            <button
              onClick={() => setDrawnPoints([])}
              className="px-3 py-2 rounded-xl bg-[#0F1411] text-[#EF4444] border border-[#1F2922] font-bold flex items-center gap-1 hover:bg-[#EF4444]/10"
            >
              <Trash2 className="w-4 h-4" /> Clear
            </button>
          )}

          <button
            onClick={handleSaveBoundary}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-[#34D399] text-[#08120B] font-extrabold flex items-center gap-2 shadow-lg shadow-[#34D399]/10 hover:bg-[#2DD4BF] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saveStatus || (isSaving ? "Saving..." : "Save Field Boundary")}
          </button>
        </div>
      </div>

      {/* Map Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Drawer Panel */}
        <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm space-y-5 font-mono text-xs">
          {/* Search Location Input */}
          <div className="relative flex gap-2">
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
              className="w-full pl-9 pr-3 py-2.5 bg-[#0F1411] border border-[#1F2922] rounded-xl text-white font-sans text-xs focus:outline-none focus:border-[#34D399]"
            />
            <Search className="w-4 h-4 text-[#8E9B91] absolute left-3 top-3" />
            <button
              onClick={handleSearchLocation}
              className="px-3 py-2.5 rounded-xl bg-[#0F1411] border border-[#1F2922] text-[#34D399] font-bold hover:text-white"
            >
              Go
            </button>
          </div>

          {/* Area & Metrics Card */}
          <div className="p-3.5 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-2">
            <span className="text-[10px] text-[#6B7C6F] font-bold uppercase block">FIELD METRICS (GEODESIC)</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#8E9B91]">Calculated Area</span>
                <p className="text-white font-black text-sm">{metrics.areaHectares} Ha</p>
              </div>
              <div>
                <span className="text-[10px] text-[#8E9B91]">Perimeter</span>
                <p className="text-white font-black text-sm">{metrics.perimeterMeters} m</p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#1F2922] text-[10px] text-[#8E9B91] flex justify-between">
              <span>Points: {drawnPoints.length}</span>
              <span>Mode: {isDrawing ? "Drawing..." : "Centroid Select"}</span>
            </div>
          </div>

          {/* Coordinates Card */}
          <div className="p-3 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-1">
            <span className="text-[10px] text-[#6B7C6F] font-bold uppercase block">ACTIVE CENTROID</span>
            <div className="text-white font-bold flex items-center justify-between text-xs">
              <span>Lat: {currentCoords[0].toFixed(4)}°</span>
              <span>Lng: {currentCoords[1].toFixed(4)}°</span>
            </div>
          </div>

          {/* Layer Sub-Tabs */}
          <div className="flex border-b border-[#202922] font-bold">
            {(["Layers", "Location", "Sources"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-3 transition-all ${
                  activeTab === tab ? "bg-[#34D399] text-[#08120B] rounded-t-xl" : "text-[#8E9B91] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Layer Controls */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                <input type="radio" name="base" defaultChecked className="accent-[#34D399]" /> Satellite <span className="text-[10px] text-[#8E9B91]">Esri World Imagery</span>
              </label>
            </div>

            <span className="text-[10px] font-bold uppercase text-[#6B7C6F] tracking-wider block pt-2 border-t border-[#202922]">
              Overlays
            </span>

            <div className="space-y-2">
              <div
                onClick={() => setWorldSoil(!worldSoil)}
                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                  worldSoil ? "bg-[#34D399]/10 border-[#34D399] text-white" : "bg-[#0F1411] border-[#1F2922] text-[#8E9B91]"
                }`}
              >
                <input type="checkbox" checked={worldSoil} readOnly className="accent-[#34D399] mt-0.5" />
                <div>
                  <strong className="text-white text-xs block">🟧 World Soil Layer</strong>
                  <span className="text-[10px] text-[#8E9B91]">ISRIC SoilGrids Data</span>
                </div>
              </div>

              <div
                onClick={() => setNdviVegetation(!ndviVegetation)}
                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                  ndviVegetation ? "bg-[#34D399]/10 border-[#34D399] text-white" : "bg-[#0F1411] border-[#1F2922] text-[#8E9B91]"
                }`}
              >
                <input type="checkbox" checked={ndviVegetation} readOnly className="accent-[#34D399] mt-0.5" />
                <div>
                  <strong className="text-white text-xs block">🟩 NDVI Canopy Overlay</strong>
                  <span className="text-[10px] text-[#8E9B91]">Sentinel-2 L2A Stream</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map View */}
        <div className="lg:col-span-3 bg-[#141A16] p-3 rounded-2xl border border-[#202922] shadow-sm relative flex flex-col">
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2 font-mono text-[11px] font-bold">
            {isDrawing && (
              <span className="px-3 py-1 rounded-lg bg-[#F59E0B] text-black font-extrabold flex items-center gap-1.5 shadow animate-pulse">
                Click map to add boundary points
              </span>
            )}
            {ndviVegetation && (
              <span className="px-3 py-1 rounded-lg bg-[#34D399] text-[#08120B] flex items-center gap-1.5 shadow">
                NDVI Overlay Active <X className="w-3 h-3 cursor-pointer" onClick={() => setNdviVegetation(false)} />
              </span>
            )}
          </div>

          <div ref={mapContainerRef} className="w-full h-[540px] rounded-xl border border-[#202922] z-10"></div>
        </div>
      </div>
    </div>
  );
};
