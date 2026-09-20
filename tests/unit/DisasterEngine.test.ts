import { DisasterEngine } from "../../backend/src/services/IntelligenceEngine/DisasterEngine";
import { MockDataService } from "../../backend/src/services/MockDataService";

describe("DisasterEngine Unit Tests", () => {
  test("Triggers waterlogging risk when soil saturation duration >= 12h", () => {
    const ctx = MockDataService.getMockContext("waterlogging");
    const { recommendations } = DisasterEngine.analyze(ctx);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].condition).toBe("WATERLOGGING_RISK");
    expect(recommendations[0].doNot).toContain("Irrigate");
    expect(recommendations[0].verification?.windowMinutes).toBe(360);
  });

  test("Triggers flood warning when rainfall > 100mm", () => {
    const ctx = MockDataService.getMockContext("flood");
    const { recommendations } = DisasterEngine.analyze(ctx);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].condition).toBe("FLOOD_RISK");
    expect(recommendations[0].priority).toBe("URGENT");
  });
});
