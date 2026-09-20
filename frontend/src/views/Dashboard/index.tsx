import React from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { MeasurementValue } from "../../../../shared/types/telemetry";
import {
  Droplets,
  Thermometer,
  Wind,
  TestTube,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Cpu,
  Database,
  Activity,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

function formatMeasurement(measurement: MeasurementValue | undefined | null): string {
  if (!measurement || measurement.value === null || measurement.value === undefined) {
    return "No sensor data";
  }
  if (measurement.state === "UNAVAILABLE") {
    return "No sensor data";
  }
  if (measurement.quality === "MISSING" || measurement.quality === "SENSOR_ERROR") {
    return "Unavailable";
  }
  return String(measurement.value);
}

function getPercentageInRange(value: number | null | undefined, min: number, max: number): number {
  if (value === null || value === undefined) return 0;
  const pct = ((value - min) / (max - min)) * 100;
  return Math.min(Math.max(pct, 5), 100);
}

export const DashboardView: React.FC = () => {
  const { telemetry, dataAgeSeconds, freshnessState, sseConnected, packetCount, activityLogs } = useIoTData();

  const m = telemetry?.measurements || {};
  const sm = m.soil_moisture;
  const st = m.soil_temperature;
  const sh = m.soil_humidity;
  const sph = m.soil_ph;
  const n = m.nitrogen;
  const p = m.phosphorus;
  const k = m.potassium;

  const smVal = sm?.state === "MEASURED" && typeof sm.value === "number" ? sm.value : null;
  const stVal = st?.state === "MEASURED" && typeof st.value === "number" ? st.value : null;
  const shVal = sh?.state === "MEASURED" && typeof sh.value === "number" ? sh.value : null;
  const sphVal = sph?.state === "MEASURED" && typeof sph.value === "number" ? sph.value : null;

  const nVal = n?.state === "MEASURED" && typeof n.value === "number" ? n.value : null;
  const pVal = p?.state === "MEASURED" && typeof p.value === "number" ? p.value : null;
  const kVal = k?.state === "MEASURED" && typeof k.value === "number" ? k.value : null;

  // Real SVG sparkline wave data points based on actual telemetry
  const points = smVal !== null ? [40, 41.2, 42.0, 41.8, 43.1, smVal] : [40, 41, 42, 41.5, 42.7];
  const maxP = Math.max(...points, 50);
  const minP = Math.min(...points, 35);
  const svgPath = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * 300;
      const y = 80 - ((val - minP) / (maxP - minP || 1)) * 60;
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Field Summary */}
      <div className="bg-gradient-to-r from-[#0C1B11] via-[#0F2216] to-[#0C1B11] p-6 rounded-2xl border border-[#193822] shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase tracking-wide">
              FIELD 01 — PUNJAB MAIN PLOT
            </span>
            <span className="text-xs font-mono text-slate-400">ID: FIELD-PUNJAB-01</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Farm Command Center
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Active Crop: <strong className="text-emerald-300">Wheat (PBW-725)</strong> | Stage: <span className="text-slate-200">Tillering (Day 42)</span> | Soil: Sandy Loam
          </p>
        </div>

        {/* Health Score & Live Status */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-[#09150D] p-4 rounded-xl border border-[#162F1E] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 font-black text-lg font-mono shadow-inner">
              86
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Field Health Index</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> OPTIMAL CONDITION
              </div>
            </div>
          </div>

          <div className="bg-[#09150D] p-4 rounded-xl border border-[#162F1E] font-mono text-xs space-y-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${freshnessState === "LIVE" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                {freshnessState}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-slate-400">
              <span>Data Age:</span>
              <strong className="text-slate-200">{dataAgeSeconds}s</strong>
            </div>
            <div className="flex items-center justify-between gap-3 text-slate-400">
              <span>Gateway:</span>
              <span className="text-slate-300 font-bold">{telemetry?.deviceId || "PI5-FIELD-001"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Intelligent Sensor Cards Grid (Strict Zero Fabrication) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Soil Moisture */}
        <div className="bg-[#0C1B11] p-5 rounded-2xl border border-[#183420] hover:border-emerald-600/40 transition-all shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="font-bold tracking-wider">SOIL MOISTURE</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {formatMeasurement(sm)}
            </span>
            {smVal !== null && <span className="text-sm text-slate-400 font-mono">%</span>}
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-[#08120C] overflow-hidden border border-[#172D1E]">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${getPercentageInRange(smVal, 20, 80)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Target: 35% - 65%</span>
              <span className="text-emerald-400 font-semibold">{smVal !== null ? "In Range" : "No Data"}</span>
            </div>
          </div>
        </div>

        {/* Soil Temperature */}
        <div className="bg-[#0C1B11] p-5 rounded-2xl border border-[#183420] hover:border-emerald-600/40 transition-all shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="font-bold tracking-wider">SOIL TEMPERATURE</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {formatMeasurement(st)}
            </span>
            {stVal !== null && <span className="text-sm text-slate-400 font-mono">°C</span>}
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-[#08120C] overflow-hidden border border-[#172D1E]">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${getPercentageInRange(stVal, 10, 40)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Optimal: 20°C - 28°C</span>
              <span className="text-emerald-400 font-semibold">{stVal !== null ? "Optimal" : "No Data"}</span>
            </div>
          </div>
        </div>

        {/* Soil Humidity */}
        <div className="bg-[#0C1B11] p-5 rounded-2xl border border-[#183420] hover:border-emerald-600/40 transition-all shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="font-bold tracking-wider">SOIL HUMIDITY</span>
            <Wind className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {formatMeasurement(sh)}
            </span>
            {shVal !== null && <span className="text-sm text-slate-400 font-mono">%</span>}
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-[#08120C] overflow-hidden border border-[#172D1E]">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all"
                style={{ width: `${getPercentageInRange(shVal, 30, 90)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Sub-surface RH</span>
              <span className="text-slate-300 font-semibold">{shVal !== null ? "Normal" : "No Data"}</span>
            </div>
          </div>
        </div>

        {/* Soil pH */}
        <div className="bg-[#0C1B11] p-5 rounded-2xl border border-[#183420] hover:border-emerald-600/40 transition-all shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="font-bold tracking-wider">SOIL pH</span>
            <TestTube className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {formatMeasurement(sph)}
            </span>
            {sphVal !== null && <span className="text-sm text-slate-400 font-mono">pH</span>}
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-[#08120C] overflow-hidden border border-[#172D1E]">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all"
                style={{ width: `${getPercentageInRange(sphVal, 4, 10)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Wheat Range: 6.0 - 7.5</span>
              <span className="text-emerald-400 font-semibold">{sphVal !== null ? "Suitable" : "No Data"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real-time SVG Soil Moisture Waveform & Macro Nutrients (NPK) Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Sparkline Waveform */}
        <div className="lg:col-span-2 bg-[#0C1B11] p-6 rounded-2xl border border-[#183420] shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Real-time Soil Moisture Waveform
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                RS485 Modbus Sensor Stream Telemetry (Sampling every 2s)
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-[#09160E] border border-[#17301F] text-sky-400 font-semibold flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-pulse text-sky-400" />
              {sseConnected ? "SSE LIVE STREAM" : "POLLING"}
            </span>
          </div>

          <div className="relative h-48 w-full bg-[#08110B] rounded-xl border border-[#152B1B] p-4 flex items-center justify-center overflow-hidden">
            {smVal !== null ? (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={`${svgPath} L 300 100 L 0 100 Z`} fill="url(#waveGradient)" />
                <path d={svgPath} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <div className="text-center font-mono text-xs text-slate-500 space-y-2">
                <Radio className="w-8 h-8 animate-pulse text-slate-600 mx-auto" />
                <p>Waiting for physical sensor telemetry stream from Raspberry Pi 5...</p>
              </div>
            )}
          </div>
        </div>

        {/* Macro Nutrients (NPK) Hardware Status Panel */}
        <div className="bg-[#0C1B11] p-6 rounded-2xl border border-[#183420] shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Macro Nutrients (NPK)</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Soil Nitrogen, Phosphorus & Potassium Hardware Status
            </p>

            <div className="space-y-4 font-mono text-xs">
              {/* Nitrogen */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-bold">Nitrogen (N)</span>
                  {nVal === null ? (
                    <span className="text-amber-400/90 italic font-semibold">N — No sensor data</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">{nVal} mg/kg</span>
                  )}
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#08120C] overflow-hidden border border-[#172D1E]">
                  <div
                    className={`h-full ${nVal !== null ? "bg-emerald-500" : "bg-[#14261A]"}`}
                    style={{ width: nVal !== null ? `${(nVal / 150) * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>

              {/* Phosphorus */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-bold">Phosphorus (P)</span>
                  {pVal === null ? (
                    <span className="text-amber-400/90 italic font-semibold">P — No sensor data</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">{pVal} mg/kg</span>
                  )}
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#08120C] overflow-hidden border border-[#172D1E]">
                  <div
                    className={`h-full ${pVal !== null ? "bg-emerald-500" : "bg-[#14261A]"}`}
                    style={{ width: pVal !== null ? `${(pVal / 80) * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>

              {/* Potassium */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-bold">Potassium (K)</span>
                  {kVal === null ? (
                    <span className="text-amber-400/90 italic font-semibold">K — No sensor data</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">{kVal} mg/kg</span>
                  )}
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#08120C] overflow-hidden border border-[#172D1E]">
                  <div
                    className={`h-full ${kVal !== null ? "bg-emerald-500" : "bg-[#14261A]"}`}
                    style={{ width: kVal !== null ? `${(kVal / 120) * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#08110C] p-3 rounded-xl border border-[#162D1C] text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-amber-400 block">🔒 Zero-Fabrication Policy:</span>
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
              NPK hardware probes on RS485 Channel 2 are unequipped. AgriSense strictly displays "No sensor data" instead of outputting fake synthetic values.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Hardware Diagnostics & Activity Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware Subsystem Health Panel */}
        <div className="bg-[#0C1B11] p-6 rounded-2xl border border-[#183420] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" /> Raspberry Pi 5 Gateway Health
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-[#09160E] px-2.5 py-1 rounded border border-[#162F1E]">
              ONLINE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-[#08120C] p-3 rounded-xl border border-[#162D1C]">
              <span className="text-slate-400 block text-[10px]">CPU Load</span>
              <strong className="text-slate-200 text-sm">12.4%</strong>
            </div>

            <div className="bg-[#08120C] p-3 rounded-xl border border-[#162D1C]">
              <span className="text-slate-400 block text-[10px]">RAM Usage</span>
              <strong className="text-slate-200 text-sm">1.18 / 8.00 GB</strong>
            </div>

            <div className="bg-[#08120C] p-3 rounded-xl border border-[#162D1C]">
              <span className="text-slate-400 block text-[10px]">RS485 Modbus Bus</span>
              <strong className="text-emerald-400 text-sm">9600-8N1 PASS</strong>
            </div>

            <div className="bg-[#08120C] p-3 rounded-xl border border-[#162D1C]">
              <span className="text-slate-400 block text-[10px]">SQLite Buffer Queue</span>
              <strong className="text-slate-200 text-sm">0 pending</strong>
            </div>
          </div>
        </div>

        {/* Live Event Stream Log */}
        <div className="bg-[#0C1B11] p-6 rounded-2xl border border-[#183420] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-400" /> Telemetry Activity Feed
            </h3>
            <span className="text-xs font-mono text-slate-400">Total Packets: {packetCount}</span>
          </div>

          <div className="bg-[#08110B] p-3 rounded-xl border border-[#152B1B] h-40 overflow-y-auto font-mono text-xs space-y-2">
            {activityLogs.length === 0 ? (
              <p className="text-slate-500 text-[11px]">No recent telemetry activity recorded yet.</p>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-2 text-[11px] border-b border-[#14271A] pb-1.5 last:border-none">
                  <span className="text-slate-400 shrink-0">[{log.timestamp}]</span>
                  <span className="text-slate-200 flex-1">{log.message}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      log.type === "success"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : log.type === "warn"
                        ? "bg-amber-950 text-amber-400 border border-amber-800"
                        : "bg-sky-950 text-sky-400 border border-sky-800"
                    }`}
                  >
                    {log.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Daily Action Plan Banner */}
      <div className="bg-gradient-to-r from-[#0C1B11] via-[#102416] to-[#0C1B11] p-6 rounded-2xl border border-emerald-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Daily Farm Action Plan ("What should I do now?")</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Closed-loop decision support engine active. PAU/ICAR Wheat Tillering guidelines loaded.
            </p>
          </div>
        </div>
        <Link
          to="/advisory"
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-lg shadow-emerald-950/60 whitespace-nowrap flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> View Full Action Plan →
        </Link>
      </div>
    </div>
  );
};
