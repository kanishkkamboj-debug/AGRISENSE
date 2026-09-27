export declare const PARAM_RANGES: Record<string, {
    min: number;
    max: number;
}>;
export declare function isMeasurementValidRange(paramKey: string, val: number): boolean;
export declare function validateTelemetryPayload(payload: unknown): {
    valid: boolean;
    errors: string[];
};
