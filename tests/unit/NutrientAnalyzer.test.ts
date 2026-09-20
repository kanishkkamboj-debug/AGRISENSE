import { NutrientAnalyzer } from "../../backend/src/services/IntelligenceEngine/NutrientAnalyzer";
import { MockDataService } from "../../backend/src/services/MockDataService";

describe("NutrientAnalyzer Unit Tests", () => {
  test("Reports explicit missing status for unequipped NPK sensors without fabricating numbers", () => {
    const ctx = MockDataService.getMockContext("normal");
    const { findings } = NutrientAnalyzer.analyze(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].description).toContain("Nitrogen sensor data unavailable");
    expect(findings[0].evidence[0].value).toBeNull();
    expect(findings[0].evidence[0].quality).toBe("MISSING");
  });
});
