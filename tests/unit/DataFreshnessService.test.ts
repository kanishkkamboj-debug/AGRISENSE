import { DataFreshnessService } from "../../backend/src/services/DataFreshnessService";

describe("DataFreshnessService Unit Tests", () => {
  test("Resolves LIVE for recent telemetry within 15 seconds", () => {
    const nowIso = new Date().toISOString();
    expect(DataFreshnessService.getFreshnessState(nowIso)).toBe("LIVE");
    expect(DataFreshnessService.isFresh(nowIso)).toBe(true);
  });

  test("Resolves STALE for telemetry older than 5 minutes", () => {
    const oldDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(DataFreshnessService.getFreshnessState(oldDate)).toBe("STALE");
    expect(DataFreshnessService.isStale(oldDate)).toBe(true);
  });

  test("Resolves NO_DATA for undefined or null timestamp", () => {
    expect(DataFreshnessService.getFreshnessState(undefined)).toBe("NO_DATA");
  });
});
