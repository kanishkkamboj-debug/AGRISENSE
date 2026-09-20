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
  systemMode: "REAL_IOT" | "SIMULATION";
  setSystemMode: (mode: "REAL_IOT" | "SIMULATION") => void;
  isConnected: boolean;
  sseConnected: boolean;
  packetCount: number;
  retryCount: number;
  backoffDelayMs: number;
  activityLogs: ActivityLog[];
  activeFieldCondition: "Normal" | "Drought" | "Flood";
  setActiveFieldCondition: (state: "Normal" | "Drought" | "Flood") => void;
  refreshNow: () => void;
}

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export const IoTProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [telemetry, setTelemetry] = useState<TelemetryRecord | null>(null);
  const [dataAgeSeconds, setDataAgeSeconds] = useState<number>(0);
  const [dataMode, setDataMode] = useState<"REAL" | "MOCK">("REAL");
  const [systemMode, setSystemMode] = useState<"REAL_IOT" | "SIMULATION">("REAL_IOT");
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [packetCount, setPacketCount] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [backoffDelayMs, setBackoffDelayMs] = useState<number>(15000);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activeFieldCondition, setActiveFieldCondition] = useState<"Normal" | "Drought" | "Flood">("Normal");

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
        setDataMode("REAL");

        if (res.data.timestamp) {
          const age = Math.max(0, Math.floor((Date.now() - Date.parse(res.data.timestamp)) / 1000));
          setDataAgeSeconds(age);
        }

        if (!isConnected) {
          setIsConnected(true);
          addActivityLog("Backend connection established", "success");
        }
        setRetryCount(0);
      }
    } catch (err) {
      console.warn("Polling attempt failed", err);
      setIsConnected(false);
      setRetryCount((prev) => prev + 1);
    }
  }, [isConnected, addActivityLog]);

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
          addActivityLog(`Live telemetry packet received from ${record.deviceId || "PI5-FIELD-001"}`, "info");
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
  }, [addActivityLog]);

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

  // Initial load and periodic polling fallback (only poll when SSE is disconnected)
  useEffect(() => {
    loadData();
    if (sseConnected) return; // Skip HTTP polling when SSE is live!
    const pollInterval = sseConnected ? 30000 : backoffDelayMs;
    const interval = setInterval(loadData, pollInterval);
    return () => clearInterval(interval);
  }, [loadData, sseConnected, backoffDelayMs]);

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
        systemMode,
        setSystemMode,
        isConnected,
        sseConnected,
        packetCount,
        retryCount,
        backoffDelayMs,
        activityLogs,
        activeFieldCondition,
        setActiveFieldCondition,
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
