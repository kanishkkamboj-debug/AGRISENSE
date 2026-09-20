import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet-draw";
import { MapPin, Layers, Save, Upload, Download, CheckCircle } from "lucide-react";
import { fetchFields, saveFieldBoundary } from "../../services/api";

export const GISView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  const [fieldArea, setFieldArea] = useState<number | null>(4.5);
  const [fieldPerimeter, setFieldPerimeter] = useState<number | null>(850);
  const [geoJsonData, setGeoJsonData] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize Leaflet Map centered over Punjab farm plot
    const map = L.map(mapContainerRef.current).setView([30.901, 75.857], 15);
    mapRef.current = map;

    // OpenStreetMap Base Layer
    const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors | AgriSense GIS',
    }).addTo(map);

    // Satellite Base Layer
    const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    });

    L.control.layers({ "Street Map": osmLayer, "Satellite View": satelliteLayer }).addTo(map);

    // FeatureGroup for drawn polygons/rectangles
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    // Default Farm Field Polygon
    const defaultPolygon = L.polygon(
      [
        [30.900, 75.855],
        [30.900, 75.860],
        [30.905, 75.860],
        [30.905, 75.855],
      ],
      { color: "#10b981", fillColor: "#10b981", fillOpacity: 0.25 }
    ).addTo(drawnItems);

    setGeoJsonData(JSON.stringify(defaultPolygon.toGeoJSON(), null, 2));

    // IoT Sensor Marker
    const sensorMarker = L.marker([30.9025, 75.8575]).addTo(map);
    sensorMarker.bindPopup("<b>IoT Gateway: PI5-FIELD-001</b><br>RS485 Sensor Node 01").openPopup();

    // Leaflet Draw Control Setup
    const drawControl = new (L.Control as any).Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polygon: { allowIntersection: false, shapeOptions: { color: "#10b981" } },
        rectangle: { shapeOptions: { color: "#38bdf8" } },
      },
    });
    map.addControl(drawControl);

    // Leaflet Draw Events
    map.on((L as any).Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      const geoJson = layer.toGeoJSON();
      setGeoJsonData(JSON.stringify(geoJson, null, 2));

      // Calculate approximate area
      const bounds = layer.getBounds();
      const latDiff = Math.abs(bounds.getNorth() - bounds.getSouth());
      const lngDiff = Math.abs(bounds.getEast() - bounds.getWest());
      const approxAreaHa = parseFloat(((latDiff * 111) * (lngDiff * 111) * 100).toFixed(2));
      setFieldArea(approxAreaHa);
      setFieldPerimeter(Math.round((latDiff + lngDiff) * 2 * 111000));
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleSaveField = async () => {
    const success = await saveFieldBoundary({
      fieldId: "FIELD-PUNJAB-01",
      name: "Field 01 - Main Demonstration Plot",
      areaHectares: fieldArea || 4.5,
      perimeterMeters: fieldPerimeter || 850,
      centroid: [30.901, 75.857],
      geometry: geoJsonData ? JSON.parse(geoJsonData) : {},
    });
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" /> GIS & Spatial Farm Intelligence
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Leaflet Spatial Subsystem | GeoJSON Polygon & Rectangle Boundary Calculations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveField}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            {savedSuccess ? <CheckCircle className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? "Saved to GISService!" : "Save Field Geometry"}
          </button>
        </div>
      </div>

      {/* Map & Geometry Data Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Leaflet Map */}
        <div className="lg:col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-mono font-bold text-slate-300">Interactive Map View</span>
            <span className="text-[11px] font-mono text-slate-500">Use Draw Toolbar to create Rectangle / Polygon</span>
          </div>
          <div ref={mapContainerRef} className="w-full h-[500px] rounded-xl border border-slate-800 z-10"></div>
        </div>

        {/* Spatial Calculations & GeoJSON Metadata Panel */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4">Field Spatial Geometry</h3>

            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-bold block mb-1">CALCULATED AREA</span>
                <span className="text-2xl font-extrabold text-emerald-400">{fieldArea || 4.5} <span className="text-xs font-normal text-slate-400">Hectares</span></span>
                <p className="text-[11px] text-slate-500 mt-1">~{( (fieldArea || 4.5) * 2.471 ).toFixed(2)} Acres</p>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-bold block mb-1">PERIMETER & CENTROID</span>
                <span className="text-sm font-bold text-white">Perimeter: {fieldPerimeter || 850} m</span>
                <p className="text-[11px] text-slate-400 mt-1">Centroid: [30.901° N, 75.857° E]</p>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">GeoJSON Representation:</label>
                <textarea
                  value={geoJsonData}
                  onChange={(e) => setGeoJsonData(e.target.value)}
                  rows={8}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic border-t border-slate-800 pt-3">
            * Operational Cache TTL: 10 mins (`LOCATION_CACHE_HIT` / `MISS` logged).
          </div>
        </div>
      </div>
    </div>
  );
};
