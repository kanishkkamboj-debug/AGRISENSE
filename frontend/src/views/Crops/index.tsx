import React, { useState } from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { CropSelector } from "../../components/CropSelector";
import { updateDeviceConfig } from "../../services/api";
import { analyzeTelemetryAgainstCrop } from "../../utils/agronomy";
import { Play, RotateCcw, Droplets, TestTube, Sprout, Activity, RefreshCw, AlertTriangle, ShieldCheck, Thermometer, ShieldAlert, Radio } from "lucide-react";

export const CropsView: React.FC = () => {
  const { telemetry, selectedCrop, selectedCropId, selectedStageId, systemMode, packetCount, freshnessState, dataAgeSeconds } = useIoTData();
  const [readingInterval, setReadingInterval] = useState<number>(5);
  const [sessionDuration, setSessionDuration] = useState<number>(60);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);

  const isLive = systemMode === "SIMULATION" || freshnessState === "LIVE" || freshnessState === "RECENT";

  const analysis = analyzeTelemetryAgainstCrop(telemetry, selectedCrop, selectedStageId, systemMode);
  const { shiScore, shiStatus, deltas, anomalies } = analysis;

  const m = isLive ? telemetry?.measurements || {} : {};
  const moistureVal = m.soil_moisture?.value ?? null;
  const phVal = m.soil_ph?.value ?? null;
  const nitrogenVal = m.nitrogen?.value ?? null;
  const tempVal = m.soil_temperature?.value ?? m.ambient_temperature?.value ?? null;

  const handleStartScan = async () => {
    if (!isLive && systemMode === "REAL_IOT") {
      setScanStatusMessage("🔴 DEVICE OFFLINE — Reconnect ESP8266 to initiate scan session.");
      setTimeout(() => setScanStatusMessage(null), 4000);
      return;
    }
    setIsScanning(true);
    const ok = await updateDeviceConfig(readingInterval);
    if (ok) {
      setScanStatusMessage(`✓ Scan session active! Downlink config sent to ESP8266 (${readingInterval}s interval).`);
      setTimeout(() => setScanStatusMessage(null), 4000);
    }
  };

  const handleReset = () => {
    setIsScanning(false);
  };

  return (
    <div className="space-y-6 text-[#F0FDF4] font-sans">
      {/* Header & 20-Crop Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A16] border border-[#202922] shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Condition Detection & Crop Knowledge</h1>
          <p className="text-xs text-[#8E9B91] font-mono mt-1">
            Real-time botanical archival and diagnostic monitoring against 20 crop profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CropSelector />
          <button
            onClick={handleStartScan}
            className="px-4 py-2.5 rounded-xl bg-[#34D399] text-[#08120B] font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#34D399]/10 hover:bg-[#2DD4BF] transition-all font-mono"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Initiate Scan
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-[#0F1411] border border-[#1F2922] text-[#8E9B91] font-bold text-xs flex items-center gap-2 hover:text-white transition-all font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {scanStatusMessage && (
        <div className={`p-4 rounded-xl font-mono text-xs font-bold border ${
          scanStatusMessage.includes("OFFLINE") ? "bg-red-950/60 border-red-800 text-red-300" : "bg-[#14261B] border-[#23422F] text-[#34D399]"
        }`}>
          {scanStatusMessage}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Environment State & Scan Parameters */}
        <div className="space-y-6">
          {/* Environment State */}
          <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-[#6B7C6F] tracking-wider">ENVIRONMENT STATE</span>
            <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
              {isLive ? (
                <>
                  <span className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                    shiStatus === "OPTIMAL" ? "bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40" : "bg-[#0F1411] text-slate-400"
                  }`}>
                    ● Normal
                  </span>
                  <span className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                    shiStatus === "ATTENTION" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-[#0F1411] text-slate-400"
                  }`}>
                    ⚠️ Alert
                  </span>
                  <span className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                    shiStatus === "CRITICAL" ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-[#0F1411] text-slate-400"
                  }`}>
                    ❄️ Critical
                  </span>
                </>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-red-950/60 text-red-300 border border-red-800 flex items-center gap-1.5">
                  🔴 Device Offline ({dataAgeSeconds}s ago)
                </span>
              )}
            </div>
          </div>

          {/* Scan Parameters */}
          <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm space-y-4 font-mono text-xs">
            <span className="text-[10px] font-bold uppercase text-[#6B7C6F] tracking-wider">Scan Parameters</span>

            <div className="space-y-1.5">
              <div className="flex justify-between text-white font-bold">
                <span>Reading Interval</span>
                <span className="text-[#34D399]">{readingInterval}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={readingInterval}
                onChange={(e) => setReadingInterval(Number(e.target.value))}
                className="w-full accent-[#34D399]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-white font-bold">
                <span>Session Duration</span>
                <span className="text-[#34D399]">01:00</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="w-full accent-[#34D399]"
              />
            </div>

            {/* Session Summary */}
            <div className="bg-[#0F1411] p-4 rounded-xl border border-[#1F2922] text-white flex justify-between items-center shadow-inner">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#34D399] block">Session Summary</span>
                <span className="text-2xl font-extrabold block text-white">
                  {isLive && shiScore !== null ? `${shiScore}%` : "UNAVAILABLE"}
                </span>
                <span className="text-[9px] text-[#8E9B91]">AVG SHI INDEX</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-xl font-bold block text-white">{packetCount}</span>
                <span className="text-[9px] text-[#8E9B91]">READINGS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Active Monitoring & Selected Crop Profile Details */}
        <div className="lg:col-span-2 bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#6B7C6F] tracking-wider">Active Botanical Profile</span>
              <span className="text-xs text-[#34D399] font-bold">{selectedCrop?.category}</span>
            </div>

            <div className="bg-[#0F1411] p-4 rounded-xl border border-[#1F2922] space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">{selectedCrop?.name}</h2>
                  <p className="text-xs text-[#8E9B91] font-mono italic">{selectedCrop?.scientificName}</p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-[#34D399] font-bold block">Opt Temp: {selectedCrop?.temperature.optimal}°C</span>
                  <span className="text-[10px] text-[#8E9B91]">Range: {selectedCrop?.temperature.min}–{selectedCrop?.temperature.max}°C</span>
                </div>
              </div>

              {/* Targets Table */}
              <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-2 border-t border-[#1F2922]">
                <div className="p-2 rounded-lg bg-[#141A16]">
                  <span className="text-[9px] text-[#6B7C6F] block">MOISTURE</span>
                  <strong className="text-white">{selectedCrop?.soil.moisture.min}–{selectedCrop?.soil.moisture.max}%</strong>
                </div>
                <div className="p-2 rounded-lg bg-[#141A16]">
                  <span className="text-[9px] text-[#6B7C6F] block">PREFERRED pH</span>
                  <strong className="text-white">{selectedCrop?.soil.preferredPH.min}–{selectedCrop?.soil.preferredPH.max}</strong>
                </div>
                <div className="p-2 rounded-lg bg-[#141A16]">
                  <span className="text-[9px] text-[#6B7C6F] block">OPT N-P-K</span>
                  <strong className="text-[#34D399]">{selectedCrop?.nutrients.n.optimal}-{selectedCrop?.nutrients.p.optimal}-{selectedCrop?.nutrients.k.optimal}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* IoT Sensor Array Banner */}
          <div className="bg-gradient-to-r from-[#1F2B22] to-[#141A16] h-24 rounded-xl p-4 text-white flex items-center justify-between font-mono text-xs border border-[#202922]">
            <div>
              <span className="text-[#34D399] font-bold block">IoT Sensor Array — Hardware Ingestion</span>
              <span className="text-[#8E9B91] text-[10px]">Modbus RS485 Field Bus (AGRISENSE-ESP8266-001)</span>
            </div>
            <span className={`px-3 py-1 rounded-lg font-bold border ${isLive ? "bg-[#0F1411] text-[#34D399] border-[#34D399]/30" : "bg-red-950/80 text-red-300 border-red-800"}`}>
              {isLive ? "ONLINE" : "DEVICE OFFLINE"}
            </span>
          </div>
        </div>

        {/* Right Column: Reading Log */}
        <div className="space-y-6">
          <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[#6B7C6F] tracking-wider">Live Reading Log</span>
              <RefreshCw className="w-4 h-4 text-[#34D399]" />
            </div>

            {/* Soil Moisture */}
            <div className="bg-[#0F1411] p-3 rounded-xl border border-[#1F2922] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span className="text-[#8E9B91] font-bold">MOISTURE</span>
              </div>
              <strong className="text-white text-sm font-extrabold">
                {isLive && moistureVal !== null ? `${moistureVal}%` : "UNAVAILABLE"}
              </strong>
            </div>

            {/* pH Level */}
            <div className="bg-[#0F1411] p-3 rounded-xl border border-[#1F2922] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TestTube className="w-4 h-4 text-[#34D399]" />
                <span className="text-[#8E9B91] font-bold">pH LEVEL</span>
              </div>
              <strong className="text-white text-sm font-extrabold">
                {isLive && phVal !== null ? `${phVal}` : "UNAVAILABLE"}
              </strong>
            </div>

            {/* Nitrogen */}
            <div className="bg-[#0F1411] p-3 rounded-xl border border-[#1F2922] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-amber-400" />
                <span className="text-[#8E9B91] font-bold">NITROGEN</span>
              </div>
              <strong className="text-white text-sm font-extrabold">
                {isLive && nitrogenVal !== null ? `${nitrogenVal} ppm` : "UNAVAILABLE"}
              </strong>
            </div>

            {/* Temperature */}
            <div className="bg-[#0F1411] p-3 rounded-xl border border-[#1F2922] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-400" />
                <span className="text-[#8E9B91] font-bold">TEMP</span>
              </div>
              <strong className="text-white text-sm font-extrabold">
                {isLive && tempVal !== null ? `${tempVal}°C` : "UNAVAILABLE"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
