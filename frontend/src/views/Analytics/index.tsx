import React, { useEffect, useState } from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { fetchAnalytics } from "../../services/api";
import { BarChart3, Calendar, Filter, TrendingUp, Activity, Radio, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const AnalyticsView: React.FC = () => {
  const { telemetry, systemMode, selectedCrop, freshnessState, dataAgeSeconds } = useIoTData();
  const [range, setRange] = useState<string>("24h");
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const isLive = systemMode === "SIMULATION" || freshnessState === "LIVE" || freshnessState === "RECENT";

  useEffect(() => {
    async function load() {
      const res = await fetchAnalytics("FIELD-PUNJAB-01", range, systemMode);
      setAnalyticsData(res);
    }
    load();
  }, [range, systemMode]);

  const m = isLive ? telemetry?.measurements || {} : {};
  const moistureVal = m.soil_moisture?.value ?? null;
  const tempVal = m.soil_temperature?.value ?? m.ambient_temperature?.value ?? null;

  const stats = analyticsData?.stats?.soil_moisture || null;

  return (
    <div className="space-y-6 text-[#F0FDF4] font-sans">
      {/* Header */}
      <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 tracking-tight">
            <BarChart3 className="w-6 h-6 text-[#34D399]" /> Historical Telemetry Analytics
          </h1>
          <p className="text-xs text-[#8E9B91] font-mono mt-1">
            Aggregated Sensor Data for Target Crop: <strong className="text-[#34D399]">{selectedCrop?.name || "Wheat"}</strong> over Field Node FIELD-PUNJAB-01.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 font-mono text-xs bg-[#0F1411] p-1.5 rounded-xl border border-[#1F2922]">
          {["1h", "6h", "24h", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                range === r ? "bg-[#34D399] text-[#08120B] shadow" : "text-[#8E9B91] hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Live vs Historical Status Notice */}
      {!isLive && (
        <div className="bg-[#2B1A1E] p-4 rounded-xl border border-[#482027] text-xs font-mono text-[#FCA5A5] flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <strong className="block font-bold">CURRENT LIVE TELEMETRY: UNAVAILABLE (ESP8266 Disconnected)</strong>
            <span>Showing historical database baseline from last recorded transmission ({dataAgeSeconds}s ago).</span>
          </div>
        </div>
      )}

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm">
          <span className="text-[#6B7C6F] text-xs font-bold block mb-1">AVERAGE MOISTURE</span>
          <span className="text-3xl font-black text-[#34D399]">
            {stats?.avg !== undefined && stats.avg !== null ? `${stats.avg}%` : "UNAVAILABLE"}
          </span>
          <span className="text-xs text-[#8E9B91] block mt-2">{range} Historical Baseline</span>
        </div>

        <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm">
          <span className="text-[#6B7C6F] text-xs font-bold block mb-1">MINIMUM MOISTURE</span>
          <span className="text-3xl font-black text-sky-400">
            {stats?.min !== undefined && stats.min !== null ? `${stats.min}%` : "UNAVAILABLE"}
          </span>
          <span className="text-xs text-[#8E9B91] block mt-2">Lowest Historical Point</span>
        </div>

        <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm">
          <span className="text-[#6B7C6F] text-xs font-bold block mb-1">MAXIMUM MOISTURE</span>
          <span className="text-3xl font-black text-indigo-400">
            {stats?.max !== undefined && stats.max !== null ? `${stats.max}%` : "UNAVAILABLE"}
          </span>
          <span className="text-xs text-[#8E9B91] block mt-2">Peak Capacity Recorded</span>
        </div>

        <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm">
          <span className="text-[#6B7C6F] text-xs font-bold block mb-1">CURRENT TRAJECTORY</span>
          <span className={`text-3xl font-black flex items-center gap-1 ${isLive ? "text-[#34D399]" : "text-slate-500"}`}>
            <TrendingUp className="w-6 h-6" /> {isLive ? stats?.trend || "STABLE" : "UNAVAILABLE"}
          </span>
          <span className="text-xs text-[#8E9B91] block mt-2">{isLive ? "Live Telemetry Velocity" : "Device Offline"}</span>
        </div>
      </div>
    </div>
  );
};
