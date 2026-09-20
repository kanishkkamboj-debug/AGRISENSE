import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { TelemetryRecord } from "../../../shared/types/telemetry";
import { fetchLatestTelemetry } from "../services/api";

interface IoTContextType {
  telemetry: TelemetryRecord | null;
  dataAgeSeconds: number;
  freshnessState: "LIVE" | "RECENT" | "STALE" | "OFFLINE" | "NO_DATA";
  dataMode: "REAL" | "MOCK";
  isConnected: boolean;
  retryCount: number;
  backoffDelayMs: number;
  refreshNow: () => void;
}

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export const IoTProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [telemetry, setTelemetry] = useState<TelemetryRecord | null>(null);
  const [dataAgeSeconds, setDataAgeSeconds] = useState<number>(0);
  const [dataMode, setDataMode] = useState<"REAL" | "MOCK">("REAL");
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [backoffDelayMs, setBackoffDelayMs] = useState<number>(2000);

  const loadData = useCallback(async () => {
    try {
      const res = await fetchLatestTelemetry("FIELD-PUNJAB-01");
      if (res && res.data) {
        setTelemetry(res.data);
        setDataMode(res.dataMode === "MOCK" ? "MOCK" : "REAL");

        if (res.data.timestamp) {
          const age = Math.max(0, Math.floor((Date.now() - Date.parse(res.data.timestamp)) / 1000));
          setDataAgeSeconds(age);
        }

        if (!isConnected) {
          console.log("🌐 Connection restored to backend! Resetting polling backoff.");
          setIsConnected(true);
        }
        setRetryCount(0);
        setBackoffDelayMs(2000);
      }
    } catch (err) {
      console.warn("Polling attempt failed. Triggering exponential backoff...");
      setIsConnected(false);
      setRetryCount((prev) => prev + 1);
      setBackoffDelayMs((prev) => Math.min(prev * 2, 30000));
    }
  }, [isConnected]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, backoffDelayMs);
    return () => clearInterval(interval);
  }, [loadData, backoffDelayMs]);

  // Compute freshness state
  let freshnessState: "LIVE" | "RECENT" | "STALE" | "OFFLINE" | "NO_DATA" = "NO_DATA";
  if (!isConnected) {
    freshnessState = "OFFLINE";
  } else if (dataAgeSeconds <= 15) {
    freshnessState = "LIVE";
  } else if (dataAgeSeconds <= 300) {
    freshnessState = "RECENT";
  } else {
    freshnessState = "STALE";
  }

  return (
    <IoTContext.Provider
      value={{
        telemetry,
        dataAgeSeconds,
        freshnessState,
        dataMode,
        isConnected,
        retryCount,
        backoffDelayMs,
        refreshNow: loadData,
      }}
    >
      {children}
    </IoTContext.Provider>
  );
};

export function useIoTContext() {
  const ctx = useContext(IoTContext);
  if (!ctx) {
    throw new Error("useIoTContext must be used within an IoTProvider");
  }
  return ctx;
}
