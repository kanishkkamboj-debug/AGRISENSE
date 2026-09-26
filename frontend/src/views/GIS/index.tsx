import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchFields, saveFieldBoundary } from "../../services/api";
import { useIoTData } from "../../hooks/useIoTData";
import { Search, Layers, Square, MapPin, CheckSquare, X, Save, Radio } from "lucide-react";

export const GISView: React.FC = () => {
  const { selectedCrop } = useIoTData();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [activeTab, setActiveTab] = useState<"Layers" | "Location" | "Sources">("Layers");
  const [worldSoil, setWorldSoil] = useState<boolean>(true);
  const [ndviVegetation, setNdviVegetation] = useState<boolean>(true);
  const [floodRisk, setFloodRisk] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [currentCoords, setCurrentCoords] = useState<[number, number]>([30.901, 75.857]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current).setView(currentCoords, 13);
    mapRef.current = map;

    // Esri Satellite World Imagery Base Layer
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS",
    }).addTo(map);

    // Green NDVI Vegetation Overlay Polygon
    const ndviPolygon = L.polygon(
      [
        [30.895, 75.850],
        [30.895, 75.865],
        [30.908, 75.865],
        [30.908, 75.850],
      ],
      {
        color: "#34D399",
        fillColor: "#34D399",
        fillOpacity: 0.25,
        weight: 2,
      }
    ).addTo(map);

    // Marker over Field Hub
    const marker = L.marker(currentCoords)
      .addTo(map)
      .bindPopup(`<b>Field 01 — Demonstration Plot</b><br>Target Crop: ${selectedCrop?.name || "Wheat"}<br>RS485 Node Active`)
      .openPopup();

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setCurrentCoords([lat, lng]);
      marker.setLatLng([lat, lng]);
      marker.bindPopup(`<b>Selected Coordinates</b><br>Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°`).openPopup();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

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
    const success = await saveFieldBoundary({
      fieldId: "FIELD-PUNJAB-01",
      name: "Field 01 - Main Plot",
      locationName: searchQuery || "Punjab Plot",
      centroid: currentCoords,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [currentCoords[1] - 0.005, currentCoords[0] - 0.005],
            [currentCoords[1] + 0.005, currentCoords[0] - 0.005],
            [currentCoords[1] + 0.005, currentCoords[0] + 0.005],
            [currentCoords[1] - 0.005, currentCoords[0] + 0.005],
            [currentCoords[1] - 0.005, currentCoords[0] - 0.005],
          ],
        ],
      },
      currentCropId: selectedCrop?.id || "wheat",
    });
    setIsSaving(false);
    if (success) {
      setSaveStatus("Field boundary saved to MongoDB!");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-6 text-[#F0FDF4] font-sans">
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A16] border border-[#202922] shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">GIS Field Map & Location Intelligence</h1>
          <p className="text-xs text-[#8E9B91] font-mono mt-1">
            Click map to set centroid · Search locations · Saved boundaries sync directly to MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
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
