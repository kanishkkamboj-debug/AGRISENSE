import { TelemetryRecord } from "../../../shared/types/telemetry";
import { FieldContext, CropProfile } from "../../../shared/types/agriculture";
import { AdvisoryResponse } from "../../../shared/types/api";

const API_BASE = "/api/v1/public";

export async function fetchLatestTelemetry(fieldId = "FIELD-PUNJAB-01", mode = "REAL_IOT"): Promise<{ data: TelemetryRecord | null; dataMode: string }> {
  try {
    const res = await fetch(`${API_BASE}/telemetry/latest?fieldId=${fieldId}&mode=${mode}`);
    const json = await res.json();
    if (json.success) {
      return { data: json.data || null, dataMode: json.dataMode || "REAL" };
    }
  } catch (e) {
    console.warn("API offline or network error", e);
  }
  return {
    dataMode: "REAL",
    data: null,
  };
}

export async function fetchTelemetryHistory(fieldId = "FIELD-PUNJAB-01", limit = 48): Promise<TelemetryRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/telemetry/history?fieldId=${fieldId}&limit=${limit}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) return json.data;
  } catch (e) {
    console.warn("History API error", e);
  }
  return [];
}

export async function updateDeviceConfig(telemetryIntervalSeconds: number, deviceId = "AGRISENSE-ESP8266-001"): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/device/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, telemetryIntervalSeconds }),
    });
    const json = await res.json();
    return json.success;
  } catch (e) {
    console.warn("Update device config API error", e);
    return false;
  }
}

export async function fetchFields(): Promise<FieldContext[]> {
  try {
    const res = await fetch(`${API_BASE}/gis/fields`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) return json.data;
  } catch (e) {
    console.warn("Fields API error", e);
  }
  return [];
}

export async function saveFieldBoundary(fieldData: Partial<FieldContext>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/gis/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fieldData),
    });
    const json = await res.json();
    return json.success;
  } catch (e) {
    return false;
  }
}

export async function fetchCrops(): Promise<CropProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/crops`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) return json.data;
  } catch (e) {
    console.warn("Crops API error", e);
  }
  return [];
}

export async function fetchAdvisory(fieldId = "FIELD-PUNJAB-01", mode = "REAL_IOT"): Promise<AdvisoryResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/advisories?fieldId=${fieldId}&mode=${mode}`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (e) {
    console.warn("Advisory API error", e);
  }
  return null;
}

export async function fetchAnalytics(fieldId = "FIELD-PUNJAB-01", range = "24h", mode = "REAL_IOT") {
  try {
    const res = await fetch(`${API_BASE}/analytics?fieldId=${fieldId}&range=${range}&mode=${mode}`);
    const json = await res.json();
    if (json.success) return json.data;
  } catch (e) {
    console.warn("Analytics API error", e);
  }
  return null;
}

export async function fetchSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    const json = await res.json();
    if (json.success) return json.data;
  } catch (e) {
    console.warn("Settings API fetch error", e);
  }
  return null;
}

export async function updateSettings(settingsData: Record<string, any>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsData),
    });
    const json = await res.json();
    return json.success;
  } catch (e) {
    console.warn("Settings API update error", e);
    return false;
  }
}

export async function fetchDeviceStatus(deviceId = "AGRISENSE-ESP8266-001") {
  try {
    const res = await fetch(`${API_BASE}/telemetry/device-status?deviceId=${deviceId}`);
    const json = await res.json();
    return json;
  } catch (e) {
    return null;
  }
}

export async function fetchConnectionHistory(deviceId = "AGRISENSE-ESP8266-001") {
  try {
    const res = await fetch(`${API_BASE}/telemetry/connection-history?deviceId=${deviceId}`);
    const json = await res.json();
    if (json.success) return json.data;
  } catch (e) {
    console.warn("Connection history API error", e);
  }
  return null;
}

export async function askAgriSense(query: string, fieldId = "FIELD-PUNJAB-01") {
  try {
    const res = await fetch(`${API_BASE}/advisories/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, fieldId }),
    });
    const json = await res.json();
    if (json.success) return json.data;
  } catch (e) {
    console.warn("Ask AgriSense API error", e);
  }
  return { answer: "Unable to reach AgriSense AI backend service.", isAiGenerated: false };
}

export async function fetchAlerts(fieldId = "FIELD-PUNJAB-01", status = "ALL", severity = "ALL") {
  try {
    const res = await fetch(`${API_BASE}/alerts?fieldId=${fieldId}&status=${status}&severity=${severity}`);
    const json = await res.json();
    if (json.success) return json.data;
  } catch (e) {
    console.warn("Alerts API error", e);
  }
  return [];
}

export async function resolveAlert(id: string) {
  try {
    const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, { method: "POST" });
    const json = await res.json();
    return json.success;
  } catch (e) {
    return false;
  }
}

export async function createActionFromAlert(id: string) {
  try {
    const res = await fetch(`${API_BASE}/alerts/${id}/create-action`, { method: "POST" });
    const json = await res.json();
    return json.success;
  } catch (e) {
    return false;
  }
}

export async function fetchActions(fieldId = "FIELD-PUNJAB-01") {
  try {
    const res = await fetch(`${API_BASE}/actions?fieldId=${fieldId}`);
    const json = await res.json();
    if (json.success) return json.data;
  } catch (e) {
    console.warn("Actions API error", e);
  }
  return [];
}

export async function createAction(actionData: any) {
  try {
    const res = await fetch(`${API_BASE}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actionData),
    });
    const json = await res.json();
    return json.success;
  } catch (e) {
    return false;
  }
}

export async function updateActionStatus(id: string, status: string) {
  try {
    const res = await fetch(`${API_BASE}/actions/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return json.success;
  } catch (e) {
    return false;
  }
}

export async function fetchObservations(fieldId = "FIELD-PUNJAB-01") {
  try {
    const res = await fetch(`${API_BASE}/observations?fieldId=${fieldId}`);
    const json = await res.json();
    if (json.success) return json.data;
  } catch (e) {
    console.warn("Observations API error", e);
  }
  return [];
}

export async function saveObservation(obsData: any) {
  try {
    const res = await fetch(`${API_BASE}/observations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obsData),
    });
    const json = await res.json();
    return json.success;
  } catch (e) {
    return false;
  }
}

export async function fetchSystemStatus() {
  try {
    const res = await fetch(`${API_BASE}/system-status`);
    const json = await res.json();
    if (json.success) return json.data;
  } catch (e) {
    console.warn("System Status API error", e);
  }
  return null;
}

export async function fetchIoTIntelligence(fieldId = "FIELD-PUNJAB-01") {
  try {
    const res = await fetch(`${API_BASE}/intelligence/live?fieldId=${fieldId}`);
    const json = await res.json();
    return json;
  } catch (e) {
    console.warn("IoT Intelligence API error", e);
    return null;
  }
}

export async function fetchWhyAnalysis(fieldId = "FIELD-PUNJAB-01") {
  try {
    const res = await fetch(`${API_BASE}/intelligence/why?fieldId=${fieldId}`);
    const json = await res.json();
    return json;
  } catch (e) {
    console.warn("Why analysis API error", e);
    return null;
  }
}

export async function fetchWhatChanged(period = "6h", fieldId = "FIELD-PUNJAB-01") {
  try {
    const res = await fetch(`${API_BASE}/intelligence/what-changed?period=${period}&fieldId=${fieldId}`);
    const json = await res.json();
    return json;
  } catch (e) {
    console.warn("What changed API error", e);
    return null;
  }
}

export async function fetchWhatIfSimulation(scenario: string) {
  try {
    const res = await fetch(`${API_BASE}/intelligence/what-if`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario }),
    });
    const json = await res.json();
    return json;
  } catch (e) {
    console.warn("What-If simulation API error", e);
    return null;
  }
}

export async function fetchFieldReplay(timeframe = "24h", fieldId = "FIELD-PUNJAB-01") {
  try {
    const res = await fetch(`${API_BASE}/intelligence/replay?timeframe=${timeframe}&fieldId=${fieldId}`);
    const json = await res.json();
    if (Array.isArray(json)) return json;
  } catch (e) {
    console.warn("Field replay API error", e);
  }
  return [];
}

export async function fetchIoTEvents(fieldId = "FIELD-PUNJAB-01") {
  try {
    const res = await fetch(`${API_BASE}/intelligence/events?fieldId=${fieldId}`);
    const json = await res.json();
    if (Array.isArray(json)) return json;
  } catch (e) {
    console.warn("IoT Events API error", e);
  }
  return [];
}
