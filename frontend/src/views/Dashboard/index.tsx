import React, { useState } from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { Sprout, AlertTriangle, Sun, Bug, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardView: React.FC = () => {
  const { telemetry, packetCount, activeFieldCondition } = useIoTData();
  const [selectedCrop, setSelectedCrop] = useState<string>("Wheat");

  return (
    <div className="space-y-6 text-[#F0FDF4]">
      {/* Title & Crop Selector Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Adaptive Feedback</h1>
          <p className="text-xs text-[#8E9B91] font-mono mt-1 italic">
            Real-time biophysical alignment between soil architecture and crop metabolic demands.
          </p>
        </div>

        {/* Crop Pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#141A16] border border-[#202922] font-mono text-xs">
          {["Wheat", "Rice", "Maize", "Soybean"].map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-4 py-2 rounded-xl transition-all font-extrabold ${
                selectedCrop === crop
                  ? "bg-[#34D399] text-[#08120B] shadow-md shadow-[#34D399]/10"
                  : "text-[#8E9B91] hover:text-white hover:bg-[#1C251F]"
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm text-center">
          <span className="text-3xl font-black text-white block">2.4s</span>
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider mt-1 block">SYNC LATENCY</span>
        </div>

        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm text-center">
          <span className="text-3xl font-black text-white block">{packetCount > 0 ? packetCount * 12 + 480 : 482}</span>
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider mt-1 block">DATA ITERATIONS</span>
        </div>

        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm text-center">
          <span className="text-3xl font-black text-white block">12</span>
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider mt-1 block">ACTIVE NODES</span>
        </div>

        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm text-center">
          <span className="text-3xl font-black text-[#34D399] block">+14%</span>
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider mt-1 block">EFFICIENCY GAIN</span>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Health Architecture Donut & Anomalies */}
        <div className="space-y-6">
          {/* Health Architecture Card */}
          <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-4">
            <span className="text-xs font-mono uppercase font-bold text-[#6B7C6F] tracking-wider">HEALTH ARCHITECTURE</span>

            {/* Circular Gauge */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-36 h-36 rounded-full border-[10px] border-[#1C251F] border-t-[#34D399] border-r-[#34D399] border-b-[#34D399] flex items-center justify-center shadow-inner">
                <div className="text-center font-mono">
                  <span className="text-3xl font-black text-white block">86</span>
                  <span className="text-[10px] text-[#34D399] uppercase font-bold">OPTIMAL</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0F1411] p-4 rounded-xl border border-[#1F2922] text-xs text-[#9EB1A3] italic text-center font-serif">
              "Current canopy vigor approaches historical 5-year average for mid-season wheat."
            </div>

            <button className="w-full py-3.5 px-4 rounded-xl bg-[#34D399] text-[#08120B] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#34D399]/10 hover:bg-[#2DD4BF] transition-all">
              <Sprout className="w-4 h-4 stroke-[2.5]" /> Plant {selectedCrop}
            </button>
          </div>

          {/* Anomalies Card (Matches Image 2) */}
          <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold text-[#6B7C6F] tracking-wider">Anomalies</h3>

            {/* Alert 1: Nitrogen Leaching */}
            <div className="bg-[#2B1A1E] p-4 rounded-xl border border-[#482027] space-y-1">
              <div className="flex items-center gap-2 text-[#F87171] text-xs font-extrabold font-mono">
                <AlertTriangle className="w-4 h-4" /> Nitrogen Leaching Detected
              </div>
              <p className="text-[11px] text-[#FCA5A5] font-mono leading-relaxed">
                Field showing rapid runoff following 12mm precipitation event.
              </p>
            </div>

            {/* Alert 2: Transpiration Peak */}
            <div className="bg-[#2E2618] p-4 rounded-xl border border-[#493B20] space-y-1">
              <div className="flex items-center gap-2 text-[#FBBF24] text-xs font-extrabold font-mono">
                <Sun className="w-4 h-4" /> Transpiration Peak
              </div>
              <p className="text-[11px] text-[#FDE68A] font-mono leading-relaxed">
                Solar radiation spikes expected at 14:00. Pre-irrigation cycle recommended.
              </p>
            </div>

            {/* Alert 3: Mildew Spore Detection */}
            <div className="bg-[#281B30] p-4 rounded-xl border border-[#452A55] space-y-1">
              <div className="flex items-center gap-2 text-[#C084FC] text-xs font-extrabold font-mono">
                <Bug className="w-4 h-4" /> Mildew Spore Detection
              </div>
              <p className="text-[11px] text-[#E9D5FF] font-mono leading-relaxed">
                Spectral signatures in lower canopy suggest localized moisture stress.
              </p>
            </div>

            <div className="text-center pt-2">
              <Link to="/reports" className="text-xs font-mono text-[#8E9B91] hover:text-white underline">
                View All Archive Logs
              </Link>
            </div>
          </div>
        </div>

        {/* Center Column: SHI History, Range Delta, & Geospatial Overlay */}
        <div className="space-y-6">
          {/* Optimal Range Delta Card */}
          <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-4 font-mono text-xs">
            <div>
              <h3 className="text-sm font-bold text-white font-sans">Optimal Range Delta</h3>
              <p className="text-[10px] text-[#6B7C6F]">Syncing soil chemistry with physiological demand</p>
            </div>

            {/* Nitrogen Levels */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white font-bold">Nitrogen Levels (N)</span>
                <span className="text-[#34D399] font-extrabold">92% Sync</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#0F1411] overflow-hidden border border-[#1F2A21]">
                <div className="h-full bg-[#34D399] rounded-full" style={{ width: "92%" }}></div>
              </div>
              <div className="flex justify-between text-[9px] text-[#6B7C6F]">
                <span>Low Saturation</span>
                <span>Current Point</span>
                <span>Toxicity Risk</span>
              </div>
            </div>

            {/* Moisture Index */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white font-bold">Moisture Index (H2O)</span>
                <span className="text-[#F87171] font-extrabold">78% Over-Capacity</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#0F1411] overflow-hidden border border-[#1F2A21]">
                <div className="h-full bg-[#F87171] rounded-full" style={{ width: "78%" }}></div>
              </div>
              <div className="flex justify-between text-[9px] text-[#6B7C6F]">
                <span>Low Saturation</span>
                <span>Current Point</span>
                <span>Toxicity Risk</span>
              </div>
            </div>

            {/* Phosphorus */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white font-bold">Phosphorus (P)</span>
                <span className="text-[#34D399] font-extrabold">55% Sync</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#0F1411] overflow-hidden border border-[#1F2A21]">
                <div className="h-full bg-[#34D399] rounded-full" style={{ width: "55%" }}></div>
              </div>
              <div className="flex justify-between text-[9px] text-[#6B7C6F]">
                <span>Low Saturation</span>
                <span>Current Point</span>
                <span>Toxicity Risk</span>
              </div>
            </div>
          </div>

          {/* Geospatial Overlay Card (Matches Image 2) */}
          <div className="bg-gradient-to-br from-[#3B2E0A] via-[#2D2307] to-[#1C1604] p-6 rounded-2xl border border-[#52400F] shadow-lg text-white space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#FDE68A] uppercase font-bold tracking-widest">GEOSPATIAL OVERLAY</span>
              <div className="flex items-center gap-2 text-[9px] font-bold">
                <span className="px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/30">● LIVE FEED</span>
                <span className="px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/30">📊 82-LIC DATA</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-amber-200 tracking-tight">Block Alpha-04</h2>
              <p className="text-xs text-amber-100/70 mt-1 font-sans">
                Currently displaying live NPK distribution heatmap and drainage vectors.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: SHI History & Loop Statistics */}
        <div className="space-y-6">
          {/* SHI History Bar Chart */}
          <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">SHI History</h3>
                <p className="text-[10px] text-[#6B7C6F] font-mono">Soil Health Index Correlation (30-day)</p>
              </div>
            </div>

            <div className="h-36 flex items-end justify-between gap-1.5 pt-4">
              {[40, 55, 60, 48, 70, 52, 65, 58, 75, 62, 80, 72, 85, 68, 50].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className={`w-full rounded-t transition-all ${i % 2 === 0 ? "bg-[#34D399]" : "bg-[#253228]"}`}
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Loop Statistics Card */}
          <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-3 font-mono text-xs">
            <span className="text-[10px] font-bold uppercase text-[#6B7C6F] tracking-wider">LOOP STATISTICS</span>

            <div className="space-y-2">
              <div className="flex justify-between p-3 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                <span className="text-[#8E9B91]">Readings</span>
                <strong className="text-white font-extrabold">{packetCount}</strong>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                <span className="text-[#8E9B91]">Cond. Changes</span>
                <strong className="text-white font-extrabold">0</strong>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                <span className="text-[#8E9B91]">Active Flags</span>
                <strong className="text-white font-extrabold">0</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
