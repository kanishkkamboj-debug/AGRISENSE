import { WeatherService } from "../../backend/src/services/WeatherService";

describe("WeatherService Unit Tests", () => {
  const originalEnv = process.env.OPENWEATHER_API_KEY;

  afterEach(() => {
    process.env.OPENWEATHER_API_KEY = originalEnv;
  });

  test("Returns isAvailable: false with UNAVAILABLE provider when OPENWEATHER_API_KEY is missing", async () => {
    delete process.env.OPENWEATHER_API_KEY;
    const res = await WeatherService.getWeatherForLocation(30.901, 75.857);

    expect(res.isAvailable).toBe(false);
    expect(res.provenance).toBe("UNAVAILABLE");
    expect(res.errorReason).toContain("OPENWEATHER_API_KEY");
  });
});
