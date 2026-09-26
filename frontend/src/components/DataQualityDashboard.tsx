import React, { useEffect, useState } from "react";
import { ShieldCheck, Cpu, Database, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { fetchSystemStatus } from "../services/api";

export const DataQualityDashboard: React.FC = () => {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);
    const data = await fetchSystemStatus();
    if (data) setStatusData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const esp = statusData?.esp8266 || { state: "OFFLINE", ageSeconds: 0 };
  const sensors = statusData?.sensors || { sht40: "STALE", dht11: "STALE", mq653: "STALE", rain: "STALE", npk: "UNAVAILABLE", soilMoisture: "STALE" };

  return (
    <div className="bg-[#141A16] border border-[#202922] rounded-2xl p-6 shadow-sm space-y-5 font-mono text-xs text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202922] pb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#34D399]" /> Data Quality & System Health Dashboard
          </h2>
          <p className="text-[10px] text-[#8E9B91] font-sans">
            Real-time validity, completeness, sensor availability, and database persistence health
          </p>
        </div>

        <button
          onClick={loadStatus}
          className="px-3 py-1.5 rounded-xl bg-[#0F1411] border border-[#1F2922] text-[#8E9B91] hover:text-white flex items-center gap-1.5 self-start sm:self-auto font-bold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Health Check
        </button>
      </div>

      {/* System Infrastructure Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0F1411] p-4 rounded-xl border border-[#1F2922] space-y-1">
          <span className="text-[9px] text-[#6B7C6F] font-bold uppercase block">IoT Hardware (ESP8266)</span>
          <strong className={`text-base font-black block ${esp.state === "ONLINE" ? "text-[#34D399]" : "text-red-400"}`}>
            {esp.state}
          </strong>
          <span className="text-[9px] text-[#8E9B91] block">Firmware: {esp.firmwareVersion || "v2.1.0"}</span>
        </div>

        <div className="bg-[#0F1411] p-4 rounded-xl border border-[#1F2922] space-y-1">
          <span className="text-[9px] text-[#6B7C6F] font-bold uppercase block">Database Persistence</span>
          <strong className={`text-base font-black block ${statusData?.database === "HEALTHY" ? "text-[#34D399]" : "text-amber-400"}`}>
            {statusData?.database || "HEALTHY"}
          </strong>
          <span className="text-[9px] text-[#8E9B91] block">MongoDB Store</span>
        </div>

        <div className="bg-[#0F1411] p-4 rounded-xl border border-[#1F2922] space-y-1">
          <span className="text-[9px] text-[#6B7C6F] font-bold uppercase block">Gemini AI Engine</span>
          <strong className={`text-base font-black block ${statusData?.gemini === "HEALTHY" ? "text-[#34D399]" : "text-amber-400"}`}>
            {statusData?.gemini || "AVAILABLE"}
          </strong>
          <span className="text-[9px] text-[#8E9B91] block">Generative Model</span>
        </div>

        <div className="bg-[#0F1411] p-4 rounded-xl border border-[#1F2922] space-y-1">
          <span className="text-[9px] text-[#6B7C6F] font-bold uppercase block">Realtime Stream</span>
          <strong className="text-base font-black text-[#34D399] block">
            {statusData?.realtime || "SSE ACTIVE"}
          </strong>
          <span className="text-[9px] text-[#8E9B91] block">Server-Sent Events</span>
        </div>
      </div>

      {/* Sensor Availability Matrix */}
      <div className="space-y-3 pt-2">
        <h3 className="text-[10px] uppercase font-bold text-[#6B7C6F] tracking-wider">Physical Sensor Availability Matrix</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(sensors).map(([sensorName, st]) => {
            const isHealthy = st === "HEALTHY";
            const isStale = st === "STALE";
            const statusStr = String(st);

            return (
              <div
                key={sensorName}
                className={`p-3 rounded-xl border text-center space-y-1 ${
                  isHealthy
                    ? "bg-[#14261B] border-[#23422F]"
                    : isStale
                    ? "bg-amber-950/40 border-amber-800/60"
                    : "bg-[#0F1411] border-[#1F2922]"
                }`}
              >
                <span className="text-white font-bold uppercase text-[10px] block">{sensorName}</span>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded block ${
                    isHealthy
                      ? "text-[#34D399]"
                      : isStale
                      ? "text-amber-400"
                      : "text-slate-500"
                  }`}
                >
                  {statusStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
