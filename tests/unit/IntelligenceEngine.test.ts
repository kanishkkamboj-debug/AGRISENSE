import { IntelligenceEngine } from "../../backend/src/services/IntelligenceEngine/IntelligenceEngine";
import { MockDataService } from "../../backend/src/services/MockDataService";
import { ChemicalSafetyValidator } from "../../backend/src/services/IntelligenceEngine/ChemicalSafetyValidator";

describe("IntelligenceEngine & Agronomic Analyzers", () => {
  test("Normal condition scenario evaluates cleanly", () => {
    const context = MockDataService.getMockContext("normal");
    const result = IntelligenceEngine.evaluate(context);

    expect(result).toBeDefined();
    expect(result.condition.code).toBe("NORMAL");
    expect(result.confidence).toBe("HIGH");
    expect(result.recommendation.length).toBeGreaterThan(0);
  });

  test("Waterlogging scenario triggers WATERLOGGING_RISK with urgent drainage advisory", () => {
    const context = MockDataService.getMockContext("waterlogging");
    const result = IntelligenceEngine.evaluate(context);

    expect(result.condition.code).toBe("WATERLOGGING_RISK");
    expect(result.condition.severity).toBe("HIGH");
    expect(result.recommendation[0].action.type).toBe("DRAINAGE");
    expect(result.recommendation[0].doNot).toContain("Irrigate");
  });

  test("ChemicalSafetyValidator blocks unconfirmed pest spray", () => {
    const validation = ChemicalSafetyValidator.validate({
      targetPest: "Aphids",
      cropId: "Wheat",
      cropStage: "Tillering",
      isActionThresholdExceeded: false,
      confirmedDiagnosis: false,
    });

    expect(validation.allowed).toBe(false);
    expect(validation.blockReason).toContain("CHEMICAL_RECOMMENDATION_BLOCKED");
  });
});
