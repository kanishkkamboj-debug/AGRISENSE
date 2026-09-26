import { AgriculturalCondition, RecommendationPriority, RecommendationStatus, ConfidenceLevel, DataQuality } from "../constants";
export interface Evidence {
    parameter: string;
    value: number | string | boolean | null;
    unit?: string;
    source: string;
    timestamp: string;
    quality: DataQuality;
}
export interface Finding {
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    evidence: Evidence[];
}
export interface ActionInstruction {
    title: string;
    steps: string[];
    type?: "IRRIGATION" | "DRAINAGE" | "NUTRIENT" | "PEST" | "DISEASE" | "WEED" | "CROP_SELECTION" | "GENERAL";
}
export interface TimingRequirement {
    start?: string;
    deadline?: string;
    reassessAfterMinutes?: number;
}
export interface VerificationPlan {
    parameters: string[];
    targetDirection: "INCREASE" | "DECREASE" | "STABILIZE";
    windowMinutes: number;
    targetValueRange?: {
        min: number;
        max: number;
    };
}
export interface Recommendation {
    id: string;
    condition: AgriculturalCondition;
    priority: RecommendationPriority;
    status: RecommendationStatus;
    action: ActionInstruction;
    timing?: TimingRequirement;
    doNot: string[];
    evidence: Evidence[];
    expectedOutcome?: string;
    verification?: VerificationPlan;
    confidence: ConfidenceLevel;
    limitations: string[];
    knowledgeBaseVersion: string;
    createdAt: string;
    updatedAt?: string;
}
export interface DataCompleteness {
    iot: number;
    weather: number;
    crop: number;
    gis: number;
    soil: number;
    npk: number;
}
export interface AnalysisResult {
    condition: {
        code: AgriculturalCondition;
        severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    };
    diagnosis: {
        findings: Finding[];
        evidence: Evidence[];
    };
    recommendation: Recommendation[];
    verification?: VerificationPlan;
    confidence: ConfidenceLevel;
    dataCompleteness?: DataCompleteness;
    dataQuality: {
        overall: DataQuality;
        validParameters: number;
        missingParameters: number;
        staleParameters: number;
    };
    generatedAt: string;
    engineVersion: string;
    knowledgeBaseVersion: string;
}
export interface AgronomicRule {
    id: string;
    version: string;
    crop?: string;
    stage?: string;
    condition: string;
    action: unknown;
    source: {
        organization: string;
        title: string;
        year?: number;
        reference?: string;
        url?: string;
    };
    reviewedAt: string;
    status: "ACTIVE" | "DRAFT" | "DEPRECATED";
    effectiveFrom?: string;
    effectiveUntil?: string;
}
