import { SensorParameter } from "../constants";
import { SensorCapability } from "./telemetry";
export interface SensorConfig {
    id: string;
    parameter: SensorParameter;
    driver: string;
    protocol: "RS485" | "MODBUS" | "BLE" | "I2C" | "SPI" | "GPIO" | "ADC";
    interfaceDetails?: {
        baudRate?: number;
        slaveId?: number;
        registerMap?: Record<string, number>;
        pin?: number;
        address?: string;
    };
    installationDate?: string;
    calibrationDate?: string;
    calibrationCoefficient?: number;
    status: "ACTIVE" | "INACTIVE" | "ERROR" | "CALIBRATION_REQUIRED";
}
export interface DeviceHealth {
    cpuUsagePercent: number;
    ramUsagePercent: number;
    cpuTemperatureCelsius: number;
    uptimeSeconds: number;
    networkStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
    ipAddress?: string;
    wifiSignalDbm?: number;
    lastHeartbeat: string;
    bufferedTelemetryCount: number;
    sensorErrors: string[];
}
export interface DeviceRecord {
    deviceId: string;
    fieldId?: string;
    model: string;
    agentVersion: string;
    status: "ONLINE" | "OFFLINE" | "MAINTENANCE";
    lastHeartbeat: string;
    lastTelemetry?: string;
    health: DeviceHealth;
    capabilities: SensorCapability[];
    sensors: SensorConfig[];
}
