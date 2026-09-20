import React, { useEffect, useState } from "react";
import { fetchAnalytics } from "../../services/api";
import { BarChart3, Calendar, Filter, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const AnalyticsView: React.FC = () => {
  const [range, setRange] = useState<string>("24h");
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetchAnalytics("FIELD-PUNJAB-01", range);
      setAnalyticsData(res);
    }
    load();
  }, [range]);

  // Generate chart samples for Recharts
  const chartData = [
    { time: "00:00", moisture: 41.2, temp: 22.0 },
    { time: "04:00", moisture: 40.8, temp: 21.5 },
    { time: "08:00", moisture: 42.5, temp: 24.1 },
    { time: "12:00", moisture: 43.1, temp: 27.8 },
    { time: "16:00", moisture: 42.9, temp: 26.5 },
    { time: "20:00", moisture: 42.7, temp: 24.8 },
  ];

  const stats = analyticsData?.stats?.soil_moisture || { current: 42.7, min: 38.2, max: 57.4, avg: 46.8, trend: "DOWN" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" /> Historical Telemetry Analytics
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Aggregated Sensor Data, Min/Max/Avg Ranges & Trend Analytics over Stored Telemetry
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 font-mono text-xs bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {["1h", "6h", "24h", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                range === r ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <span className="text-slate-500 text-xs font-bold block mb-1">AVERAGE MOISTURE</span>
          <span className="text-3xl font-extrabold text-white">{stats.avg}%</span>
          <span className="text-xs text-slate-400 block mt-2">24-hour mean</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <span className="text-slate-500 text-xs font-bold block mb-1">MINIMUM MOISTURE</span>
          <span className="text-3xl font-extrabold text-sky-400">{stats.min}%</span>
          <span className="text-xs text-slate-400 block mt-2">Lowest recorded</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <span className="text-slate-500 text-xs font-bold block mb-1">MAXIMUM MOISTURE</span>
          <span className="text-3xl font-extrabold text-indigo-400">{stats.max}%</span>
          <span className="text-xs text-slate-400 block mt-2">Peak recorded</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <span className="text-slate-500 text-xs font-bold block mb-1">CURRENT TREND</span>
          <span className="text-3xl font-extrabold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-6 h-6" /> {stats.trend}
          </span>
          <span className="text-xs text-slate-400 block mt-2">Trajectory</span>
        </div>
      </div>

      {/* Interactive Recharts Graph */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Soil Moisture & Temperature Historical Trend</h3>
          <span className="text-xs font-mono text-slate-400">Time Range: {range}</span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", color: "#fff" }} />
              <Line type="monotone" dataKey="moisture" stroke="#38bdf8" strokeWidth={3} name="Moisture (%)" />
              <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temperature (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
