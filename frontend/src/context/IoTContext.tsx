import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { TelemetryRecord } from "../../../shared/types/telemetry";
import { CropProfile } from "../../../shared/types/agriculture";
import { DeviceStatus } from "../../../shared/types/device";
import { fetchLatestTelemetry, fetchCrops, fetchDeviceStatus } from "../services/api";

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
  deviceStatus: DeviceStatus;
  lastSeen: string | null;
  outageDurationSeconds: number;
  reconnectionNotification: string | null;
  dataMode: "REAL" | "MOCK";
  systemMode: "REAL_IOT" | "SIMULATION";
  setSystemMode: (mode: "REAL_IOT" | "SIMULATION") => void;
  cropsList: CropProfile[];
  selectedCrop: CropProfile | null;
  selectedCropId: string;
  setSelectedCropId: (id: string) => void;
  selectedStageId: string;
  setSelectedStageId: (id: string) => void;
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
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>("ONLINE");
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [outageDurationSeconds, setOutageDurationSeconds] = useState<number>(0);
  const [reconnectionNotification, setReconnectionNotification] = useState<string | null>(null);

  const [dataMode, setDataMode] = useState<"REAL" | "MOCK">("REAL");
  const [systemMode, setSystemMode] = useState<"REAL_IOT" | "SIMULATION">("REAL_IOT");
  const [cropsList, setCropsList] = useState<CropProfile[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>("wheat");
  const [selectedStageId, setSelectedStageId] = useState<string>("tillering");

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

  // Fetch 20 crops knowledge base on mount
  useEffect(() => {
    async function loadCrops() {
      const list = await fetchCrops();
      if (list && list.length > 0) {
        setCropsList(list);
      }
    }
    loadCrops();
  }, []);

  const selectedCrop = cropsList.find((c) => c.id === selectedCropId) || cropsList[0] || null;

  const loadData = useCallback(async () => {
    try {
      const [res, devRes] = await Promise.all([
        fetchLatestTelemetry("FIELD-PUNJAB-01", systemMode),
        fetchDeviceStatus("AGRISENSE-ESP8266-001"),
      ]);

      if (devRes) {
        setDeviceStatus(devRes.status || "OFFLINE");
        if (devRes.lastSeen) setLastSeen(devRes.lastSeen);
        if (devRes.lastOutageDurationSeconds) setOutageDurationSeconds(devRes.lastOutageDurationSeconds);
      }

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
  }, [isConnected, systemMode, addActivityLog]);

  // When system mode toggles, reload telemetry immediately!
  const handleSetSystemMode = (mode: "REAL_IOT" | "SIMULATION") => {
    setSystemMode(mode);
    addActivityLog(`System mode switched to ${mode === "REAL_IOT" ? "REAL IoT MODE (Physical Sensors Only)" : "SIMULATION MODE"}`, mode === "REAL_IOT" ? "success" : "warn");
    loadData();
  };

  // Real-time SSE EventSource connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/v1/public/telemetry/stream");

      eventSource.onopen = () => {
        setSseConnected(true);
        setIsConnected(true);
        addActivityLog("Real-time SSE stream connected (ESP8266 Live Hub)", "success");
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.eventType === "DEVICE_STATUS_CHANGE") {
            setDeviceStatus(payload.status);
            if (payload.lastSeen) setLastSeen(payload.lastSeen);
            addActivityLog(`Device state changed to ${payload.status}`, payload.status === "OFFLINE" ? "error" : "warn");
            return;
          }

          if (payload.eventType === "DEVICE_RECONNECTED") {
            setDeviceStatus("ONLINE");
            setOutageDurationSeconds(payload.outageDurationSeconds || 0);
            setReconnectionNotification(payload.message || `Device reconnected after ${payload.outageDurationSeconds}s outage.`);
            addActivityLog(`✓ Device reconnected after ${payload.outageDurationSeconds}s outage`, "success");
            return;
          }

          // Normal telemetry packet
          setTelemetry(payload);
          setPacketCount((prev) => prev + 1);
          setIsConnected(true);
          if (payload.wasOffline) {
            setDeviceStatus("ONLINE");
            setReconnectionNotification(`✓ Telemetry synchronized after ${payload.outageDurationSeconds || 0}s outage.`);
          } else if (deviceStatus === "OFFLINE") {
            setDeviceStatus("ONLINE");
          }

          if (payload.timestamp) {
            const age = Math.max(0, Math.floor((Date.now() - Date.parse(payload.timestamp)) / 1000));
            setDataAgeSeconds(age);
            setLastSeen(payload.timestamp);
          }
          addActivityLog(`Live telemetry packet received from ${payload.deviceId || "AGRISENSE-ESP8266-001"}`, "info");
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
  }, [addActivityLog, deviceStatus]);

  // Data Age seconds ticker & independent frontend fallback status ticker
  useEffect(() => {
    const timer = setInterval(() => {
      if (telemetry?.timestamp) {
        const age = Math.max(0, Math.floor((Date.now() - Date.parse(telemetry.timestamp)) / 1000));
        setDataAgeSeconds(age);

        // Fallback frontend state evaluation if SSE drops
        if (age > 120 && deviceStatus !== "OFFLINE" && systemMode !== "SIMULATION") {
          setDeviceStatus("OFFLINE");
        } else if (age > 30 && age <= 120 && deviceStatus === "ONLINE" && systemMode !== "SIMULATION") {
          setDeviceStatus("STALE");
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [telemetry, deviceStatus, systemMode]);

  // Initial load and periodic polling fallback
  useEffect(() => {
    loadData();
    if (sseConnected) return;
    const pollInterval = sseConnected ? 30000 : backoffDelayMs;
    const interval = setInterval(loadData, pollInterval);
    return () => clearInterval(interval);
  }, [loadData, sseConnected, backoffDelayMs]);

  // Compute freshness state
  let freshnessState: "LIVE" | "RECENT" | "STALE" | "OFFLINE" | "NO_DATA" = "NO_DATA";
  if (!telemetry) {
    freshnessState = "NO_DATA";
  } else if (deviceStatus === "OFFLINE" || (!isConnected && !sseConnected)) {
    freshnessState = "OFFLINE";
  } else if (dataAgeSeconds <= 30) {
    freshnessState = "LIVE";
  } else if (dataAgeSeconds <= 120) {
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
        deviceStatus,
        lastSeen: lastSeen || telemetry?.timestamp || null,
        outageDurationSeconds,
        reconnectionNotification,
        dataMode,
        systemMode,
        setSystemMode: handleSetSystemMode,
        cropsList,
        selectedCrop,
        selectedCropId,
        setSelectedCropId,
        selectedStageId,
        setSelectedStageId,
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
