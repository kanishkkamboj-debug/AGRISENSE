import React, { useState, useEffect } from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { fetchTelemetryHistory } from "../../services/api";
import { analyzeTelemetryAgainstCrop } from "../../utils/agronomy";
import { Download, FileText, CheckCircle, Radio, Sprout } from "lucide-react";

export const ReportsView: React.FC = () => {
  const { telemetry, packetCount, selectedCrop, selectedStageId, systemMode } = useIoTData();
  const analysis = analyzeTelemetryAgainstCrop(telemetry, selectedCrop, selectedStageId, systemMode);
  const { shiScore, anomalies } = analysis;

  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  useEffect(() => {
    async function loadHistory() {
      const records = await fetchTelemetryHistory("FIELD-PUNJAB-01", 10);
      setHistoryRecords(records);
    }
    loadHistory();
  }, [telemetry]);

  const m = telemetry?.measurements || {};
  const tempVal = m.soil_temperature?.value ?? m.ambient_temperature?.value ?? null;

  const dataPoints = historyRecords.map((doc) => {
    const sm = doc.measurements?.soil_moisture?.value;
    return sm !== null && sm !== undefined ? Math.min(100, Math.max(10, sm * 1.5)) : 50;
  }).reverse();

  const timestamps = historyRecords.map((doc) => new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })).reverse();

  const maxVal = 100;
  const minVal = 0;

  const svgPath = dataPoints.length > 1
    ? dataPoints
        .map((val, idx) => {
          const x = (idx / (dataPoints.length - 1)) * 600;
          const y = 150 - ((val - minVal) / (maxVal - minVal)) * 120;
          return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ")
    : "";

  const handleExportCsv = () => {
    window.open("/api/v1/public/reports/export-csv", "_blank");
  };

  return (
    <div className="space-y-6 text-[#F0FDF4] font-sans">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A16] border border-[#202922] shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Session Reports</h1>
          <p className="text-xs text-[#8E9B91] font-mono mt-1">
            View historical SHI trends and parameter breakdowns for target crop: <strong className="text-[#34D399]">{selectedCrop?.name}</strong>.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-5 py-2.5 rounded-xl bg-[#34D399] text-[#08120B] font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#34D399]/10 hover:bg-[#2DD4BF] transition-all font-mono"
        >
          <Download className="w-4 h-4 stroke-[2.5]" /> Export Report (CSV)
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-1">
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">AVERAGE SHI</span>
          <span className="text-3xl font-black text-[#34D399] block">
            {shiScore !== null ? shiScore : "UNAVAILABLE"}
          </span>
        </div>

        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-1">
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">PEAK TEMP</span>
          <span className="text-3xl font-black text-white block">
            {tempVal !== null ? `${tempVal}°C` : "UNAVAILABLE"}
          </span>
        </div>

        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-1">
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">TOTAL READINGS</span>
          <span className="text-3xl font-black text-white block">{packetCount}</span>
        </div>

        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-1">
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">ACTIVE ALERTS</span>
          <span className={`text-3xl font-black block ${anomalies.length > 0 ? "text-red-400" : "text-[#34D399]"}`}>
            {anomalies.length}
          </span>
        </div>
      </div>

      {/* SHI History Graph Container */}
      <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-6 font-mono">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-sans">SHI History ({selectedCrop?.name})</h3>
          <span className="text-xs text-[#34D399] font-bold">
            {systemMode === "REAL_IOT" ? "REAL IoT MODE" : "SIMULATION"}
          </span>
        </div>

        <div className="relative h-64 w-full bg-[#0F1411] rounded-xl border border-[#1F2922] p-6 flex flex-col justify-between overflow-hidden">
          {dataPoints.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-xs font-mono text-[#6B7C6F] text-center space-y-1">
              <span className="font-bold text-slate-400">NO HISTORICAL TELEMETRY STORED</span>
              <span className="text-[10px] opacity-75">Connect ESP8266 to record telemetry sessions</span>
            </div>
          ) : (
            <>
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                <line x1="0" y1="72" x2="600" y2="72" stroke="#34D399" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.6" />
                <text x="300" y="65" fill="#34D399" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  Healthy Threshold (80% Sync)
                </text>
                <line x1="0" y1="108" x2="600" y2="108" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth="1" opacity="0.4" />
                {svgPath && <path d={svgPath} fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                {dataPoints.map((val, idx) => {
                  const x = dataPoints.length > 1 ? (idx / (dataPoints.length - 1)) * 600 : 300;
                  const y = 150 - ((val - minVal) / (maxVal - minVal)) * 120;
                  return <circle key={idx} cx={x} cy={y} r="4" fill="#34D399" stroke="#0F1411" strokeWidth="2" />;
                })}
              </svg>

              <div className="flex justify-between text-[10px] text-[#6B7C6F] pt-4 border-t border-[#1F2922]">
                {timestamps.map((ts, i) => (
                  <span key={i}>{ts}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
