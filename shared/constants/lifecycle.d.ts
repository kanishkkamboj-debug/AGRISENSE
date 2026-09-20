export type RecommendationStatus = "GENERATED" | "PRESENTED" | "ACKNOWLEDGED" | "ACTION_EXPECTED" | "REASSESSMENT_PENDING" | "VERIFICATION" | "IMPROVED" | "PARTIAL" | "NOT_IMPROVED" | "ADAPT_PLAN";
export type RecommendationPriority = "URGENT" | "HIGH" | "MEDIUM" | "ROUTINE";
export declare const RECOMMENDATION_STATUSES: Record<RecommendationStatus, RecommendationStatus>;
export declare const RECOMMENDATION_PRIORITIES: Record<RecommendationPriority, RecommendationPriority>;
