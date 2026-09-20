import { TelemetryRecord } from "../../../shared/types/telemetry";
import { FieldContext, CropProfile } from "../../../shared/types/agriculture";
import { AdvisoryResponse } from "../../../shared/types/api";

const API_BASE = "/api/v1/public";

export async function fetchLatestTelemetry(fieldId = "FIELD-PUNJAB-01"): Promise<{ data: TelemetryRecord | null; dataMode: string }> {
  try {
    const res = await fetch(`${API_BASE}/telemetry/latest?fieldId=${fieldId}`);
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

export async function fetchAdvisory(fieldId = "FIELD-PUNJAB-01"): Promise<AdvisoryResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/advisories?fieldId=${fieldId}`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (e) {
    console.warn("Advisory API error", e);
  }
  return null;
}

export async function fetchAnalytics(fieldId = "FIELD-PUNJAB-01", range = "24h") {
  try {
    const res = await fetch(`${API_BASE}/analytics?fieldId=${fieldId}&range=${range}`);
    const json = await res.json();
    if (json.success) return json.data;
  } catch (e) {
    console.warn("Analytics API error", e);
  }
  return null;
}
