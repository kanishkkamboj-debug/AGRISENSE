import { SoilAnalyzer } from "../../backend/src/services/IntelligenceEngine/SoilAnalyzer";
import { MockDataService } from "../../backend/src/services/MockDataService";

describe("SoilAnalyzer Unit Tests", () => {
  test("Detects soil moisture exceeding crop upper bound", () => {
    const ctx = MockDataService.getMockContext("waterlogging");
    const { findings } = SoilAnalyzer.analyze(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].description).toContain("severely exceeds crop upper bound");
    expect(findings[0].severity).toBe("HIGH");
  });

  test("Detects low soil moisture deficit", () => {
    const ctx = MockDataService.getMockContext("drought");
    const { findings } = SoilAnalyzer.analyze(ctx);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].description).toContain("below crop minimum threshold");
  });
});
