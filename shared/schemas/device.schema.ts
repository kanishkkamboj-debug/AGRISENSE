import { DeviceRecord } from "../types/device";

export function validateDeviceRecord(device: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!device || typeof device !== "object") {
    return { valid: false, errors: ["DeviceRecord must be a non-null object"] };
  }

  const d = device as Partial<DeviceRecord>;

  if (!d.deviceId) errors.push("Missing deviceId");
  if (!d.model) errors.push("Missing device model");
  if (!d.status) errors.push("Missing device status");
  if (!d.health || typeof d.health !== "object") errors.push("Missing device health object");
  if (!Array.isArray(d.capabilities)) errors.push("capabilities must be an array");

  return {
    valid: errors.length === 0,
    errors,
  };
}
