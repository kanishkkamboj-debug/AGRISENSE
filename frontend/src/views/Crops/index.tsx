import React, { useState } from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { Play, RotateCcw, Droplets, TestTube, Sprout, Activity, RefreshCw } from "lucide-react";

export const CropsView: React.FC = () => {
  const { telemetry } = useIoTData();
  const [readingInterval, setReadingInterval] = useState<number>(5);
  const [sessionDuration, setSessionDuration] = useState<number>(60);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);

  const m = telemetry?.measurements || {};
  const sm = m.soil_moisture;
  const sph = m.soil_ph;
  const n = m.nitrogen;

  const handleStartScan = () => {
    setIsScanning(true);
    setCountdown(sessionDuration);
  };

  const handleReset = () => {
    setIsScanning(false);
    setCountdown(sessionDuration);
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Condition Detection</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">Real-time botanical archival and diagnostic monitoring.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartScan}
            className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white font-bold text-xs flex items-center gap-2 shadow hover:bg-[#143326] transition-all font-mono"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Initiate Scan
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all font-mono shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Environment State & Scan Parameters */}
        <div className="space-y-6">
          {/* Environment State */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">Environment State</span>
            <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-[#1B4332] text-white flex items-center gap-1.5">● Normal</span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">⚠️ Alert</span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-900 border border-blue-300">❄️ Critical</span>
            </div>
          </div>

          {/* Scan Parameters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 font-mono text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Scan Parameters</span>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-700 font-bold">
                <span>Reading Interval</span>
                <span>{readingInterval}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={readingInterval}
                onChange={(e) => setReadingInterval(Number(e.target.value))}
                className="w-full accent-[#1B4332]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-700 font-bold">
                <span>Session Duration</span>
                <span>01:00</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="w-full accent-[#1B4332]"
              />
            </div>

            {/* Session Summary */}
            <div className="bg-[#1B4332] p-4 rounded-xl text-white flex justify-between items-center shadow-inner">
              <div>
                <span className="text-[9px] uppercase font-bold text-emerald-300 block">Session Summary</span>
                <span className="text-2xl font-extrabold block">96.8%</span>
                <span className="text-[9px] text-emerald-200">AVG SHI INDEX</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold block">{isScanning ? 12 : 0}</span>
                <span className="text-[9px] text-emerald-200">READINGS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Active Monitoring Session */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="text-center space-y-4">
            <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">Active Monitoring Session</span>

            {/* Circular Countdown Gauge */}
            <div className="flex items-center justify-center py-6">
              <div className="relative w-44 h-44 rounded-full border-[10px] border-emerald-800 flex items-center justify-center shadow-lg bg-[#F8F7F4]">
                <div className="text-center font-mono">
                  <span className="text-3xl font-black text-slate-900 block tracking-tight">01:00</span>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">{isScanning ? "SCANNING..." : "READY"}</span>
                </div>
              </div>
            </div>

            {/* Sensor Array Status */}
            <div className="bg-[#F8F7F4] p-3 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600 font-bold">📡 Sensor Array Status</span>
              <span className="px-3 py-1 rounded-lg bg-emerald-200 text-emerald-900 font-bold">OPTIMAL</span>
            </div>
          </div>

          {/* IoT Sensor Array Field Banner */}
          <div className="bg-gradient-to-r from-[#1B4332] to-[#2D5A46] h-28 rounded-xl p-4 text-white flex items-end justify-between font-mono text-xs shadow-inner">
            <span>IoT Sensor Array — Field Block A-12</span>
            <span className="text-emerald-300 font-bold">Modbus RS485 Active</span>
          </div>
        </div>

        {/* Right Column: Reading Log */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Reading Log</span>
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </div>

            {/* Moisture */}
            <div className="bg-[#F8F7F4] p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span className="text-slate-500 font-bold">MOISTURE</span>
              </div>
              <strong className="text-slate-900 text-sm">{sm?.value ? `${sm.value}%` : "42.7%"}</strong>
            </div>

            {/* pH Level */}
            <div className="bg-[#F8F7F4] p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TestTube className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-500 font-bold">pH LEVEL</span>
              </div>
              <strong className="text-slate-900 text-sm">{sph?.value ? `${sph.value}` : "6.5"}</strong>
            </div>

            {/* Nitrogen */}
            <div className="bg-[#F8F7F4] p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-amber-500" />
                <span className="text-slate-500 font-bold">NITROGEN</span>
              </div>
              <strong className="text-slate-900 text-sm">{n?.value ? `${n.value} ppm` : "53.1 ppm"}</strong>
            </div>

            {/* Mini GIS Map Thumbnail */}
            <div className="pt-2">
              <div className="bg-slate-900 h-28 rounded-xl p-2 text-white font-mono text-[10px] flex items-end justify-between border border-slate-800">
                <span>Field Block A-12 GIS</span>
                <span className="text-emerald-400 font-bold">30.901° N</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
