import { IrrigationAnalyzer } from "../../backend/src/services/IntelligenceEngine/IrrigationAnalyzer";
import { MockDataService } from "../../backend/src/services/MockDataService";

describe("IrrigationAnalyzer Unit Tests", () => {
  test("Recommends suspending irrigation when soil moisture is excessive (>80%)", () => {
    const ctx = MockDataService.getMockContext("waterlogging");
    const { recommendation } = IrrigationAnalyzer.analyze(ctx);

    expect(recommendation).toBeDefined();
    expect(recommendation?.action.title).toContain("Stop Irrigation");
    expect(recommendation?.priority).toBe("URGENT");
  });

  test("Calculates required water volume for drought condition", () => {
    const ctx = MockDataService.getMockContext("drought");
    const { recommendation } = IrrigationAnalyzer.analyze(ctx);

    expect(recommendation).toBeDefined();
    expect(recommendation?.condition).toBe("MOISTURE_STRESS");
    expect(recommendation?.action.title).toContain("Schedule");
    expect(recommendation?.verification?.targetDirection).toBe("INCREASE");
  });
});
