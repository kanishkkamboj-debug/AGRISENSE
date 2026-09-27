import React, { useEffect, useState } from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { fetchAnalytics } from "../../services/api";
import { formatTimeAgo } from "../../utils/agronomy";
import { BarChart3, Calendar, Filter, TrendingUp, Activity, Radio, AlertTriangle, RefreshCw, Sprout } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const AnalyticsView: React.FC = () => {
  const { telemetry, systemMode, selectedCrop, selectedCropId, selectedFieldId, freshnessState, dataAgeSeconds } = useIoTData();
  const [range, setRange] = useState<string>("24h");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isLive = systemMode === "SIMULATION" || freshnessState === "LIVE" || freshnessState === "RECENT";

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchAnalytics(selectedFieldId, range, selectedCropId, systemMode);
      setAnalyticsData(res);
      setLoading(false);
    }
    load();
  }, [selectedFieldId, range, selectedCropId, systemMode]);

  const stats = analyticsData?.aggregates?.soil_moisture || analyticsData?.stats?.soil_moisture || null;
  const tempStats = analyticsData?.aggregates?.soil_temperature || null;
  const dataPoints = analyticsData?.dataPoints ?? analyticsData?.samplesCount ?? 0;
  const cropInterpretation = analyticsData?.cropInterpretation || "";
  const telemetryList = analyticsData?.telemetry || [];

  // Transform telemetry into chart points
  const chartData = telemetryList.map((t: any) => {
    const sm = t.measurements?.soil_moisture?.value;
    const st = t.measurements?.soil_temperature?.value ?? t.measurements?.ambient_temperature?.value;
    return {
      time: t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      moisture: typeof sm === "number" ? sm : null,
      temperature: typeof st === "number" ? st : null,
    };
  });

  return (
    <div className="space-y-6 text-[#F0FDF4] font-sans">
      {/* Header */}
      <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 tracking-tight">
            <BarChart3 className="w-6 h-6 text-[#34D399]" /> Historical Telemetry Analytics
          </h1>
          <p className="text-xs text-[#8E9B91] font-mono mt-1">
            Historical field telemetry aggregated for target crop: <strong className="text-[#34D399]">{selectedCrop?.name || "Crop"}</strong> over {selectedFieldId}.
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

      {/* Live vs Historical Notice */}
      {!isLive && (
        <div className="bg-[#2B1A1E] p-4 rounded-xl border border-[#482027] text-xs font-mono text-[#FCA5A5] flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <strong className="block font-bold">CURRENT LIVE TELEMETRY: UNAVAILABLE (ESP8266 Disconnected)</strong>
            <span>Showing historical database baseline over range {range} ({formatTimeAgo(dataAgeSeconds)} since last packet).</span>
          </div>
        </div>
      )}

      {/* Dynamic Crop Context Interpretation Notice */}
      {cropInterpretation && (
        <div className="bg-[#0F1411] p-4 rounded-xl border border-[#1F2922] text-xs font-mono text-[#9EB1A3] flex items-center gap-3">
          <Sprout className="w-5 h-5 text-[#34D399] shrink-0" />
          <div>
            <strong className="block text-white font-bold">Crop Context Interpretation ({selectedCrop?.name})</strong>
            <span>{cropInterpretation} Target Moisture Range: {selectedCrop?.soil?.moisture?.min}% - {selectedCrop?.soil?.moisture?.max}%.</span>
          </div>
        </div>
      )}

      {/* Aggregate Stats Cards */}
      {loading ? (
        <div className="p-8 rounded-2xl bg-[#141A16] border border-[#202922] text-center font-mono text-xs text-[#8E9B91] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#34D399]" />
          <span>Querying historical telemetry database for {range} range...</span>
        </div>
      ) : dataPoints === 0 ? (
        <div className="p-8 rounded-2xl bg-[#141A16] border border-[#202922] text-center font-mono text-xs text-slate-400">
          <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="font-bold text-white text-sm">No telemetry recorded for this period.</p>
          <p className="text-[11px] mt-1 text-[#8E9B91]">No stored physical telemetry samples were found in the database for range '{range}'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm">
            <span className="text-[#6B7C6F] text-xs font-bold block mb-1">AVERAGE MOISTURE</span>
            <span className="text-3xl font-black text-[#34D399]">
              {stats?.avg !== undefined && stats?.avg !== null ? `${stats.avg}%` : "UNAVAILABLE"}
            </span>
            <span className="text-xs text-[#8E9B91] block mt-2">{range} Database Aggregation</span>
          </div>

          <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm">
            <span className="text-[#6B7C6F] text-xs font-bold block mb-1">MINIMUM MOISTURE</span>
            <span className="text-3xl font-black text-sky-400">
              {stats?.min !== undefined && stats?.min !== null ? `${stats.min}%` : "UNAVAILABLE"}
            </span>
            <span className="text-xs text-[#8E9B91] block mt-2">Lowest Point ({range})</span>
          </div>

          <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm">
            <span className="text-[#6B7C6F] text-xs font-bold block mb-1">MAXIMUM MOISTURE</span>
            <span className="text-3xl font-black text-indigo-400">
              {stats?.max !== undefined && stats?.max !== null ? `${stats.max}%` : "UNAVAILABLE"}
            </span>
            <span className="text-xs text-[#8E9B91] block mt-2">Peak Moisture ({range})</span>
          </div>

          <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm">
            <span className="text-[#6B7C6F] text-xs font-bold block mb-1">CURRENT TRAJECTORY</span>
            <span className="text-2xl font-black text-emerald-400 block truncate">
              {stats?.trend || "Insufficient historical data"}
            </span>
            <span className="text-xs text-[#8E9B91] block mt-2">{dataPoints} Data Points Analyzed</span>
          </div>
        </div>
      )}

      {/* Historical Time-Series Chart */}
      {chartData.length > 0 && (
        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#202922] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#34D399]" /> Historical Field Telemetry Time-Series ({range})
            </h3>
            <span className="text-[10px] text-[#8E9B91]">Target Crop Interpretation: {selectedCrop?.name}</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#202922" />
                <XAxis dataKey="time" stroke="#6B7C6F" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6B7C6F" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F1411", borderColor: "#202922", color: "#F0FDF4", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="moisture" name="Soil Moisture (%)" stroke="#34D399" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="temperature" name="Soil Temp (°C)" stroke="#F87171" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
