import { AnalysisResult, Recommendation } from "../../../../shared/types/recommendation";
import { FarmerActionPlan } from "../../../../shared/types/api";

export class ActionPlanner {
  static compileActionPlan(result: AnalysisResult): FarmerActionPlan {
    const urgent: Recommendation[] = [];
    const attention: Recommendation[] = [];
    const routine: Recommendation[] = [];

    for (const rec of result.recommendation) {
      if (rec.priority === "URGENT") {
        urgent.push(rec);
      } else if (rec.priority === "HIGH" || rec.priority === "MEDIUM") {
        attention.push(rec);
      } else {
        routine.push(rec);
      }
    }

    return {
      urgent,
      attention,
      routine,
      next24h: urgent.concat(attention),
      next3d: routine,
      next7d: [],
    };
  }
}
