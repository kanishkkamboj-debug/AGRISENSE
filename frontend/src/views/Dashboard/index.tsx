import React from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { CropSelector } from "../../components/CropSelector";
import { OfflineBanner } from "../../components/OfflineBanner";
import { AskAgriSense } from "../../components/AskAgriSense";
import { ActionCenter } from "../../components/ActionCenter";
import { DeviceConnectionTimeline } from "../../components/DeviceConnectionTimeline";
import { DataQualityDashboard } from "../../components/DataQualityDashboard";
import { analyzeTelemetryAgainstCrop } from "../../utils/agronomy";
import { Sprout, AlertTriangle, Sun, Bug, Activity, RefreshCw, Cpu, Wifi, Radio } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardView: React.FC = () => {
  const {
    telemetry,
    packetCount,
    activeFieldCondition,
    selectedCrop,
    selectedStageId,
    systemMode,
    dataAgeSeconds,
    freshnessState,
    deviceStatus,
    sseConnected,
  } = useIoTData();

  const isLive = systemMode === "SIMULATION" || (deviceStatus !== "OFFLINE" && (freshnessState === "LIVE" || freshnessState === "RECENT"));

  // Run dynamic agronomy analysis against selected crop
  const analysis = analyzeTelemetryAgainstCrop(telemetry, selectedCrop, selectedStageId, systemMode);
  const { shiScore, shiStatus, shiDescription, deltas, anomalies, activeStage, recommendations } = analysis;

  // Real sync latency / device status text
  const syncLatencyText = !isLive
    ? "DEVICE OFFLINE"
    : telemetry?.timestamp
    ? `${dataAgeSeconds}s`
    : "STREAMING";

  return (
    <div className="space-y-6 text-[#F0FDF4]">
      {/* Persistent Real Device Offline Banner (Section 62) */}
      <OfflineBanner />

      {/* Title & 20-Crop Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A16] border border-[#202922] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Adaptive Feedback</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                systemMode === "SIMULATION"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : isLive
                  ? "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}
            >
              {systemMode === "SIMULATION"
                ? "🧪 SIMULATION MODE"
                : isLive
                ? "🌐 REAL HARDWARE TELEMETRY (ESP8266)"
                : `🔴 DEVICE OFFLINE (${dataAgeSeconds}s AGO)`}
            </span>
          </div>
          <p className="text-xs text-[#8E9B91] font-mono mt-1 italic">
            Real-time biophysical alignment between soil architecture and crop metabolic demands.
          </p>
        </div>

        {/* Dynamic 20-Crop Selector Component */}
        <CropSelector />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm text-center">
          <span className={`text-2xl sm:text-3xl font-black block ${isLive ? "text-white" : "text-red-400"}`}>
            {syncLatencyText}
          </span>
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider mt-1 block flex items-center justify-center gap-1">
            <Radio className="w-3 h-3 text-[#34D399]" /> SYNC LATENCY
          </span>
        </div>

        <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm text-center">
          <span className="text-3xl font-black text-white block">
            {packetCount}
          </span>
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider mt-1 block">TOTAL PACKETS</span>
        </div>

        <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm text-center">
          <span className={`text-3xl font-black block ${isLive ? "text-[#34D399]" : "text-slate-500"}`}>
            {isLive ? "1 LIVE NODE" : "0 LIVE NODES"}
          </span>
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider mt-1 block">ACTIVE NODES</span>
        </div>

        <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm text-center">
          <span className={`text-3xl font-black block ${isLive && shiScore !== null ? "text-[#34D399]" : "text-slate-500"}`}>
            {isLive && shiScore !== null ? `${shiScore}%` : "UNAVAILABLE"}
          </span>
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider mt-1 block">BIOPHYSICAL SYNC</span>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Health Architecture Donut & Dynamic Anomalies */}
        <div className="space-y-6">
          {/* Health Architecture Card */}
          <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-[#6B7C6F] tracking-wider">HEALTH ARCHITECTURE (SHI)</span>
              <span className="text-[10px] font-mono text-[#8E9B91]">Target: {selectedCrop?.name || "Wheat"}</span>
            </div>

            {/* Circular Gauge */}
            <div className="flex flex-col items-center justify-center py-4">
              <div
                className={`relative w-40 h-40 rounded-full border-[10px] ${
                  !isLive || shiScore === null
                    ? "border-[#1C251F]"
                    : shiScore >= 80
                    ? "border-[#1C251F] border-t-[#34D399] border-r-[#34D399] border-b-[#34D399]"
                    : shiScore >= 60
                    ? "border-[#1C251F] border-t-[#FBBF24] border-r-[#FBBF24]"
                    : "border-[#1C251F] border-t-[#F87171]"
                } flex items-center justify-center shadow-inner`}
              >
                <div className="text-center font-mono">
                  <span className={`text-3xl font-black block ${isLive && shiScore !== null ? "text-white" : "text-slate-500"}`}>
                    {isLive && shiScore !== null ? shiScore : "--"}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold ${
                      !isLive
                        ? "text-slate-500"
                        : shiStatus === "OPTIMAL"
                        ? "text-[#34D399]"
                        : shiStatus === "ATTENTION"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {isLive ? shiStatus : "UNAVAILABLE"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#0F1411] p-4 rounded-xl border border-[#1F2922] text-xs text-[#9EB1A3] italic text-center font-serif leading-relaxed">
              "{isLive ? shiDescription : "Live telemetry unavailable — ESP8266 IoT device is offline or disconnected."}"
            </div>

            {activeStage && (
              <div className="p-3 rounded-xl bg-[#0F1411] border border-[#1F2922] font-mono text-xs text-[#8E9B91] space-y-1">
                <div className="flex justify-between text-white font-bold">
                  <span>Growth Stage: {activeStage.name}</span>
                  <span className="text-[#34D399]">Order #{activeStage.stageOrder}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Water Requirement: {activeStage.waterRequirementMmDay} mm/day</span>
                  <span>Duration: {activeStage.durationDays} Days</span>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Anomalies Card */}
          <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold text-[#6B7C6F] tracking-wider">Dynamic Anomalies</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded bg-[#0F1411] border border-[#1F2922] ${isLive ? "text-[#34D399]" : "text-red-400"}`}>
                {isLive ? `${anomalies.length} ACTIVE` : "DEVICE OFFLINE"}
              </span>
            </div>

            {!isLive ? (
              <div className="bg-[#2B1A1E] p-4 rounded-xl border border-[#482027] text-xs text-[#FCA5A5] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>ESP8266 IoT Hardware Disconnected. Live sensor stream interrupted ({dataAgeSeconds}s ago).</span>
              </div>
            ) : anomalies.length === 0 ? (
              <div className="bg-[#0F1411] p-4 rounded-xl border border-[#1F2922] text-center text-xs text-[#34D399] flex items-center justify-center gap-2">
                <Sprout className="w-4 h-4" /> All live environmental parameters strictly aligned with {selectedCrop?.name}.
              </div>
            ) : (
              <div className="space-y-3">
                {anomalies.map((anom) => (
                  <div
                    key={anom.id}
                    className={`p-4 rounded-xl border space-y-1 ${
                      anom.severity === "CRITICAL" || anom.severity === "HIGH"
                        ? "bg-[#2B1A1E] border-[#482027] text-[#FCA5A5]"
                        : anom.severity === "MEDIUM"
                        ? "bg-[#2E2618] border-[#493B20] text-[#FDE68A]"
                        : "bg-[#281B30] border-[#452A55] text-[#E9D5FF]"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-extrabold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{anom.title}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{anom.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center pt-2">
              <Link to="/reports" className="text-xs text-[#8E9B91] hover:text-white underline">
                View Diagnostic Archive Logs
              </Link>
            </div>
          </div>
        </div>

        {/* Center Column: Optimal Range Delta & Geospatial Overlay */}
        <div className="space-y-6">
          {/* Optimal Range Delta Card */}
          <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-4 font-mono text-xs">
            <div>
              <h3 className="text-sm font-bold text-white font-sans">Optimal Range Delta</h3>
              <p className="text-[10px] text-[#6B7C6F]">
                Syncing soil telemetry with {selectedCrop?.name || "Wheat"} requirements
              </p>
            </div>

            {/* Render 5 Parameters (Moisture, N, P, K, Temp) */}
            {Object.values(deltas).map((delta) => {
              const hasVal = isLive && delta.currentValue !== null;
              const syncVal = hasVal ? delta.percentSync ?? 0 : 0;
              const barWidth = hasVal ? `${Math.min(100, Math.max(5, syncVal))}%` : "0%";
              const statusColor = hasVal
                ? delta.status === "OPTIMAL"
                  ? "text-[#34D399]"
                  : "text-[#F87171]"
                : "text-[#8E9B91]";
              const barColor = hasVal
                ? delta.status === "OPTIMAL"
                  ? "bg-[#34D399]"
                  : "bg-[#F87171]"
                : "bg-slate-700";

              return (
                <div key={delta.parameter} className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-white font-bold">{delta.name}</span>
                    <span className={`font-extrabold ${statusColor}`}>
                      {hasVal ? `${delta.currentValue} ${delta.unit} (${delta.statusText})` : isLive ? "UNAVAILABLE" : "LAST KNOWN (OFFLINE)"}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#0F1411] overflow-hidden border border-[#1F2A21] relative">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: barWidth }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-[#6B7C6F]">
                    <span>Min: {delta.minTarget} {delta.unit}</span>
                    <span>Optimal: {delta.optimalTarget} {delta.unit}</span>
                    <span>Max: {delta.maxTarget} {delta.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Geospatial Overlay Card */}
          <div className="bg-gradient-to-br from-[#1F2B22] via-[#141A16] to-[#0A0E0B] p-6 rounded-2xl border border-[#202922] shadow-lg text-white space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#34D399] uppercase font-bold tracking-widest flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-[#34D399] animate-pulse" /> GEOSPATIAL OVERLAY
              </span>
              <div className="flex items-center gap-2 text-[9px] font-bold">
                <span className={`px-2 py-0.5 rounded bg-[#0F1411] border ${isLive ? "text-[#34D399] border-[#34D399]/30" : "text-red-400 border-red-500/30"}`}>
                  {isLive ? (sseConnected ? "● LIVE SSE HUB" : "HTTP POLLING") : "🔴 DEVICE DISCONNECTED"}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Field Block FIELD-PUNJAB-01</h2>
              <p className="text-xs text-[#8E9B91] mt-1 font-sans">
                Active target: <strong className="text-white">{selectedCrop?.name}</strong> ({selectedCrop?.scientificName}). Centroid: 30.901° N, 75.857° E.
              </p>
            </div>

            {recommendations.length > 0 && isLive && (
              <div className="pt-2 border-t border-[#202922] space-y-2">
                <span className="text-[10px] text-[#34D399] uppercase font-bold block">Agronomic Recommendations</span>
                <ul className="space-y-1 text-xs text-[#9EB1A3] list-disc list-inside">
                  {recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: SHI History & Loop Statistics */}
        <div className="space-y-6">
          {/* SHI History Bar Chart */}
          <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">SHI History</h3>
                <p className="text-[10px] text-[#6B7C6F] font-mono">Soil Health Index Baseline (Stored Records)</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#34D399]">
                {isLive && shiScore !== null ? `${shiScore} Index` : "No Live Data"}
              </span>
            </div>

            <div className="h-36 flex items-end justify-between gap-1.5 pt-4">
              {[40, 55, 60, 48, 70, 52, 65, 58, 75, 62, 80, 72, 85, isLive ? shiScore || 68 : 0, isLive ? shiScore || 50 : 0].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className={`w-full rounded-t transition-all ${
                      (i === 13 || i === 14) && isLive ? "bg-[#34D399]" : i % 2 === 0 ? "bg-[#253228]" : "bg-[#1C251F]"
                    }`}
                    style={{ height: `${Math.min(100, Math.max(5, h))}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Loop Statistics Card */}
          <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-3 font-mono text-xs">
            <span className="text-[10px] font-bold uppercase text-[#6B7C6F] tracking-wider block">DEVICE FRESHNESS STATISTICS</span>

            <div className="space-y-2">
              <div className="flex justify-between p-3 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                <span className="text-[#8E9B91]">Device Status</span>
                <strong className={`font-extrabold ${isLive ? "text-[#34D399]" : "text-red-400"}`}>
                  {deviceStatus}
                </strong>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                <span className="text-[#8E9B91]">Freshness State</span>
                <strong className={`font-extrabold ${freshnessState === "LIVE" ? "text-[#34D399]" : "text-amber-400"}`}>
                  {freshnessState}
                </strong>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                <span className="text-[#8E9B91]">Packet Age</span>
                <strong className="text-white font-extrabold">{dataAgeSeconds}s ago</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ask AgriSense AI Chat Widget */}
      <AskAgriSense />

      {/* Action Center Queue */}
      <ActionCenter />

      {/* Device Connection Timeline & Data Quality Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceConnectionTimeline />
        <DataQualityDashboard />
      </div>
    </div>
  );
};
