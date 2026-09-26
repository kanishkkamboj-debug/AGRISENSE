import React, { useState, useEffect } from "react";
import { AlertTriangle, WifiOff, CheckCircle2, Clock } from "lucide-react";
import { useIoTData } from "../hooks/useIoTData";

export const OfflineBanner: React.FC = () => {
  const { deviceStatus, lastSeen, dataAgeSeconds, reconnectionNotification } = useIoTData();
  const [showReconnection, setShowReconnection] = useState(false);

  useEffect(() => {
    if (reconnectionNotification) {
      setShowReconnection(true);
      const timer = setTimeout(() => setShowReconnection(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [reconnectionNotification]);

  if (deviceStatus === "OFFLINE") {
    const ageFormatted =
      dataAgeSeconds > 60
        ? `${Math.floor(dataAgeSeconds / 60)} minutes ${dataAgeSeconds % 60} seconds`
        : `${dataAgeSeconds} seconds`;

    return (
      <div className="bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border border-red-800/80 rounded-2xl p-4 shadow-xl text-red-100 font-mono text-xs space-y-2 mb-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-900/60 border border-red-700/60 text-red-400 shrink-0">
              <WifiOff className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">⚠ AGRISENSE DEVICE OFFLINE</span>
                <span className="px-2 py-0.5 rounded-md bg-red-900/80 text-red-300 text-[10px] font-bold border border-red-700">
                  AGRISENSE-ESP8266-001
                </span>
              </div>
              <p className="text-[11px] text-red-200/90 mt-0.5 font-sans">
                Hardware communication timed out {ageFormatted} ago. Displayed telemetry is historical for reference only.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-red-300 bg-red-950/80 px-3 py-1.5 rounded-xl border border-red-800/60 shrink-0">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>Last Communication: {lastSeen ? new Date(lastSeen).toLocaleTimeString() : "Unknown"}</span>
          </div>
        </div>

        <div className="border-t border-red-900/60 pt-2 text-[10px] text-red-300/80 flex items-center justify-between italic">
          <span>Waiting for ESP8266 Wi-Fi / telemetry packet reconnection...</span>
          <span className="font-bold text-red-400">Do NOT use stale readings for automated decisions</span>
        </div>
      </div>
    );
  }

  if (showReconnection || deviceStatus === "RECONNECTING") {
    return (
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 border border-emerald-700/80 rounded-2xl p-4 shadow-xl text-emerald-100 font-mono text-xs space-y-1 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-700/60 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm">✓ AGRISENSE DEVICE RECONNECTED</span>
              <p className="text-[11px] text-emerald-200/90 font-sans">
                {reconnectionNotification || "Telemetry synchronized successfully with physical ESP8266 hardware."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowReconnection(false)}
            className="text-[10px] text-emerald-400 hover:text-white underline font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return null;
};
