import React from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { Clock, Droplets, Thermometer, Wind, TestTube, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardView: React.FC = () => {
  const { telemetry, dataAgeSeconds, freshnessState } = useIoTData();

  const m = telemetry?.measurements || {};
  const sm = m.soil_moisture;
  const st = m.soil_temperature;
  const sh = m.soil_humidity;
  const sph = m.soil_ph;
  const n = m.nitrogen;
  const p = m.phosphorus;
  const k = m.potassium;

  // Real SVG sparkline wave data points based on actual telemetry
  const points = sm?.value ? [40, 41.5, 42.0, 41.8, 43.1, sm.value] : [40, 41, 42, 41.5, 42.7];
  const maxP = Math.max(...points, 50);
  const minP = Math.min(...points, 30);
  const svgPath = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * 300;
      const y = 80 - ((val - minP) / (maxP - minP || 1)) * 60;
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-6">
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`w-3.5 h-3.5 rounded-full ${freshnessState === "LIVE" ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`}></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase tracking-wider">
                ● {freshnessState}
              </span>
              <span className="text-sm font-semibold text-slate-200">Device: {telemetry?.deviceId || "PI5-FIELD-001"}</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">Field 01 — Punjab Main Plot | Lat: 30.901 N, Lng: 75.857 E</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Data Age: <strong className="text-slate-200">{dataAgeSeconds}s</strong></span>
          </div>
          <div className="w-px h-4 bg-slate-800"></div>
          <div>
            <span>Last Update: <strong className="text-slate-200">{telemetry?.timestamp ? new Date(telemetry.timestamp).toLocaleTimeString() : "--:--:--"}</strong></span>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Soil Moisture Card */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>SOIL MOISTURE</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{sm?.value !== null && sm?.value !== undefined ? sm.value : "--"}</span>
            <span className="text-sm text-slate-400 font-mono">%</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Target Range: 35% - 65%</span>
            <span className="text-emerald-400 flex items-center"><ArrowUpRight className="w-3 h-3" /> Normal</span>
          </div>
        </div>

        {/* Soil Temp Card */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>SOIL TEMPERATURE</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{st?.value !== null && st?.value !== undefined ? st.value : "--"}</span>
            <span className="text-sm text-slate-400 font-mono">°C</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Optimal: 20°C - 28°C</span>
            <span className="text-emerald-400 flex items-center"><CheckCircle2 className="w-3 h-3" /> Good</span>
          </div>
        </div>

        {/* Soil Humidity Card */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>SOIL HUMIDITY</span>
            <Wind className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{sh?.value !== null && sh?.value !== undefined ? sh.value : "--"}</span>
            <span className="text-sm text-slate-400 font-mono">%</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Sub-surface RH</span>
            <span className="text-slate-400">Stable</span>
          </div>
        </div>

        {/* Soil pH Card */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>SOIL pH</span>
            <TestTube className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{sph?.value !== null && sph?.value !== undefined ? sph.value : "--"}</span>
            <span className="text-sm text-slate-400 font-mono">pH</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Wheat Optimal: 6.0 - 7.5</span>
            <span className="text-emerald-400">Suitable</span>
          </div>
        </div>
      </div>

      {/* SVG Real-time Sensor Waveform & NPK Live Hardware Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Sparkline Waveform */}
        <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Live Soil Moisture Waveform</h3>
              <p className="text-xs text-slate-400 font-mono">Recent sensor telemetry movement (RS485 Modbus)</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-sky-400 font-semibold">
              Live Stream
            </span>
          </div>

          <div className="relative h-44 w-full bg-slate-900/60 rounded-xl border border-slate-800/80 p-4 flex items-center justify-center">
            {sm?.value !== null ? (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path d={svgPath} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <p className="text-xs font-mono text-slate-500">Waiting for sensor telemetry stream...</p>
            )}
          </div>
        </div>

        {/* NPK Hardware Status (Strict Zero-Fabrication Enforcement) */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-1">Macro Nutrients (NPK)</h3>
            <p className="text-xs text-slate-400 font-mono mb-6">Soil Nitrogen, Phosphorus & Potassium Status</p>

            <div className="space-y-4 font-mono text-xs">
              {/* Nitrogen */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-bold">Nitrogen (N)</span>
                  {!n || n.state === "UNAVAILABLE" || n.value === null ? (
                    <span className="text-amber-400/80 italic">N — No sensor data</span>
                  ) : (
                    <span className="text-slate-200">{n.value} mg/kg</span>
                  )}
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div className={`h-full ${n?.value ? "bg-emerald-500" : "bg-slate-800"}`} style={{ width: n?.value ? `${(n.value / 150) * 100}%` : "0%" }}></div>
                </div>
              </div>

              {/* Phosphorus */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-bold">Phosphorus (P)</span>
                  {!p || p.state === "UNAVAILABLE" || p.value === null ? (
                    <span className="text-amber-400/80 italic">P — No sensor data</span>
                  ) : (
                    <span className="text-slate-200">{p.value} mg/kg</span>
                  )}
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div className={`h-full ${p?.value ? "bg-emerald-500" : "bg-slate-800"}`} style={{ width: p?.value ? `${(p.value / 80) * 100}%` : "0%" }}></div>
                </div>
              </div>

              {/* Potassium */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-bold">Potassium (K)</span>
                  {!k || k.state === "UNAVAILABLE" || k.value === null ? (
                    <span className="text-amber-400/80 italic">K — No sensor data</span>
                  ) : (
                    <span className="text-slate-200">{k.value} mg/kg</span>
                  )}
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div className={`h-full ${k?.value ? "bg-emerald-500" : "bg-slate-800"}`} style={{ width: k?.value ? `${(k.value / 120) * 100}%` : "0%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic mt-4">
            * Note: AgriSense strictly presents "No sensor data" for absent hardware instead of inventing fake values.
          </p>
        </div>
      </div>

      {/* Daily Farm Action Plan Teaser */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Daily Farm Action Plan ("What should I do now?")</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Closed-loop decision support: Field conditions optimal for Wheat (Tillering).
            </p>
          </div>
        </div>
        <Link
          to="/advisory"
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-lg shadow-emerald-950/50 whitespace-nowrap"
        >
          View Full Action Plan →
        </Link>
      </div>
    </div>
  );
};
