import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet-draw";
import { Search, Layers, Square, Hexagon, MapPin, CheckSquare, X } from "lucide-react";

export const GISView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [activeTab, setActiveTab] = useState<"Layers" | "Location" | "Sources">("Layers");
  const [worldSoil, setWorldSoil] = useState<boolean>(true);
  const [ndviVegetation, setNdviVegetation] = useState<boolean>(true);
  const [floodRisk, setFloodRisk] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize Leaflet Map over Punjab plot
    const map = L.map(mapContainerRef.current).setView([30.901, 75.857], 13);
    mapRef.current = map;

    // Esri Satellite World Imagery Base Layer
    const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    }).addTo(map);

    // Green NDVI Vegetation Semi-transparent Overlay Polygon
    const ndviPolygon = L.polygon(
      [
        [30.85, 75.75],
        [30.85, 75.95],
        [30.95, 75.95],
        [30.95, 75.75],
      ],
      {
        color: "#22c55e",
        fillColor: "#22c55e",
        fillOpacity: 0.35,
        weight: 1,
      }
    ).addTo(map);

    // Marker over Field Hub
    L.marker([30.901, 75.857])
      .addTo(map)
      .bindPopup("<b>Field 01 — Punjab Demonstration Plot</b><br>RS485 Sensor Node Active")
      .openPopup();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Title Header & Provider Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">GIS Field Map</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Click anywhere on the map to fetch real-time soil & weather data · Draw to select an area
          </p>
        </div>

        {/* Data Provider Badges */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] font-bold">
          {["NASA", "ARCGIS HUB", "HDX", "UNEP", "DIVA-GIS", "GEOFABRIK"].map((prov) => (
            <span key={prov} className="px-2.5 py-1 rounded bg-emerald-100/80 text-emerald-900 border border-emerald-300">
              {prov}
            </span>
          ))}
        </div>
      </div>

      {/* Map Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Drawer Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 font-mono text-xs">
          {/* Search Location Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search any location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-sans text-xs focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Area Selection Toggles */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Area Selection</span>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200">
                <Square className="w-3.5 h-3.5" /> Rectangle
              </button>
              <button className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200">
                <Hexagon className="w-3.5 h-3.5" /> Polygon
              </button>
            </div>
          </div>

          {/* Layer Sub-Tabs */}
          <div className="flex border-b border-slate-200 font-bold">
            {(["Layers", "Location", "Sources"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 transition-all ${
                  activeTab === tab ? "bg-[#1B4332] text-white rounded-t-xl" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Layer Controls */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input type="radio" name="base" defaultChecked className="accent-[#1B4332]" /> Satellite <span className="text-[10px] text-slate-400 font-normal">Esri / Maxar</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input type="radio" name="base" className="accent-[#1B4332]" /> Topographic <span className="text-[10px] text-slate-400 font-normal">CartoDB Voyager</span>
              </label>
            </div>

            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block pt-2 border-t border-slate-200">
              Overlays
            </span>

            <div className="space-y-2">
              <div
                onClick={() => setWorldSoil(!worldSoil)}
                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                  worldSoil ? "bg-amber-50 border-amber-300" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input type="checkbox" checked={worldSoil} readOnly className="accent-amber-600 mt-0.5" />
                <div>
                  <strong className="text-slate-900 text-xs block">🟧 World Soil</strong>
                  <span className="text-[10px] text-slate-500">ISRIC SoilGrids (Free)</span>
                </div>
              </div>

              <div
                onClick={() => setNdviVegetation(!ndviVegetation)}
                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                  ndviVegetation ? "bg-emerald-50 border-emerald-300" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input type="checkbox" checked={ndviVegetation} readOnly className="accent-emerald-600 mt-0.5" />
                <div>
                  <strong className="text-slate-900 text-xs block">🟩 NDVI Vegetation</strong>
                  <span className="text-[10px] text-slate-500">NASA Earthdata (Free)</span>
                </div>
              </div>

              <div
                onClick={() => setFloodRisk(!floodRisk)}
                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                  floodRisk ? "bg-blue-50 border-blue-300" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input type="checkbox" checked={floodRisk} readOnly className="accent-blue-600 mt-0.5" />
                <div>
                  <strong className="text-slate-900 text-xs block">🟦 Flood Risk</strong>
                  <span className="text-[10px] text-slate-500">HOT OSM / Humanitarian (Free)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map View */}
        <div className="lg:col-span-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm relative flex flex-col">
          {/* Active Overlay Pills on Top Right of Map */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2 font-mono text-[11px] font-bold">
            {worldSoil && (
              <span className="px-3 py-1 rounded-lg bg-amber-700 text-white flex items-center gap-1.5 shadow">
                World Soil <X className="w-3 h-3 cursor-pointer" onClick={() => setWorldSoil(false)} />
              </span>
            )}
            {ndviVegetation && (
              <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white flex items-center gap-1.5 shadow">
                NDVI Vegetation <X className="w-3 h-3 cursor-pointer" onClick={() => setNdviVegetation(false)} />
              </span>
            )}
          </div>

          <div ref={mapContainerRef} className="w-full h-[540px] rounded-xl border border-slate-200 z-10"></div>
        </div>
      </div>
    </div>
  );
};
