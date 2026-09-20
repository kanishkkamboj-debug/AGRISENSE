import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { TelemetryRecord } from "../../../shared/types/telemetry";
import { fetchLatestTelemetry } from "../services/api";

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warn" | "error";
}

interface IoTContextType {
  telemetry: TelemetryRecord | null;
  dataAgeSeconds: number;
  freshnessState: "LIVE" | "RECENT" | "STALE" | "OFFLINE" | "NO_DATA";
  dataMode: "REAL" | "MOCK";
  isConnected: boolean;
  sseConnected: boolean;
  packetCount: number;
  retryCount: number;
  backoffDelayMs: number;
  activityLogs: ActivityLog[];
  refreshNow: () => void;
}

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export const IoTProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [telemetry, setTelemetry] = useState<TelemetryRecord | null>(null);
  const [dataAgeSeconds, setDataAgeSeconds] = useState<number>(0);
  const [dataMode, setDataMode] = useState<"REAL" | "MOCK">("REAL");
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [packetCount, setPacketCount] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [backoffDelayMs, setBackoffDelayMs] = useState<number>(2000);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const addActivityLog = useCallback((message: string, type: "info" | "success" | "warn" | "error" = "info") => {
    const log: ActivityLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setActivityLogs((prev) => [log, ...prev].slice(0, 15));
  }, []);

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
          setIsConnected(true);
          addActivityLog("Backend connection established", "success");
        }
        setRetryCount(0);
        setBackoffDelayMs(2000);
      } else {
        if (telemetry === null) {
          addActivityLog("Waiting for initial sensor telemetry stream...", "info");
        }
      }
    } catch (err) {
      console.warn("Polling attempt failed", err);
      setIsConnected(false);
      setRetryCount((prev) => prev + 1);
      setBackoffDelayMs((prev) => Math.min(prev * 2, 30000));
      addActivityLog("Connection offline — retrying with exponential backoff", "warn");
    }
  }, [isConnected, telemetry, addActivityLog]);

  // Real-time SSE EventSource connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/v1/public/telemetry/stream");

      eventSource.onopen = () => {
        setSseConnected(true);
        setIsConnected(true);
        addActivityLog("Real-time SSE stream connected (Raspberry Pi 5 Live Hub)", "success");
      };

      eventSource.onmessage = (event) => {
        try {
          const record: TelemetryRecord = JSON.parse(event.data);
          setTelemetry(record);
          setPacketCount((prev) => prev + 1);
          setIsConnected(true);
          if (record.timestamp) {
            const age = Math.max(0, Math.floor((Date.now() - Date.parse(record.timestamp)) / 1000));
            setDataAgeSeconds(age);
          }
          addActivityLog(`Live telemetry packet #${packetCount + 1} received from ${record.deviceId || "PI5-FIELD-001"}`, "info");
        } catch (e) {
          console.error("Failed to parse SSE payload", e);
        }
      };

      eventSource.onerror = () => {
        setSseConnected(false);
      };
    } catch (e) {
      setSseConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [addActivityLog, packetCount]);

  // Data Age seconds ticker
  useEffect(() => {
    const timer = setInterval(() => {
      if (telemetry?.timestamp) {
        const age = Math.max(0, Math.floor((Date.now() - Date.parse(telemetry.timestamp)) / 1000));
        setDataAgeSeconds(age);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [telemetry]);

  // Initial load and periodic polling fallback
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, backoffDelayMs);
    return () => clearInterval(interval);
  }, [loadData, backoffDelayMs]);

  // Compute freshness state
  let freshnessState: "LIVE" | "RECENT" | "STALE" | "OFFLINE" | "NO_DATA" = "NO_DATA";
  if (!telemetry) {
    freshnessState = "NO_DATA";
  } else if (!isConnected && !sseConnected) {
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
        sseConnected,
        packetCount,
        retryCount,
        backoffDelayMs,
        activityLogs,
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
