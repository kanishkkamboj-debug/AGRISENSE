import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { Finding, Evidence } from "../../../../shared/types/recommendation";

export class PestAnalyzer {
  static analyze(ctx: AgriculturalContext): { findings: Finding[]; evidence: Evidence[] } {
    const findings: Finding[] = [];
    const evidence: Evidence[] = [];

    const temp = ctx.weather?.currentTempCelsius || 25;
    const humidity = ctx.weather?.currentHumidityPercent || 60;

    // Check pest pressure conditions (e.g. Aphids in cool humid weather)
    if (temp >= 15 && temp <= 25 && humidity > 70 && ctx.crop.pestRisks?.includes("Aphids")) {
      const ev: Evidence = {
        parameter: "ambient_humidity",
        value: humidity,
        unit: "%",
        source: ctx.weather?.source || "weather-station",
        timestamp: new Date().toISOString(),
        quality: "VALID",
      };
      evidence.push(ev);

      findings.push({
        description: `Favorable micro-climate for Aphid population build-up on ${ctx.crop.name} (Temp: ${temp}°C, Humidity: ${humidity}%)`,
        severity: "MEDIUM",
        evidence: [ev],
      });
    }

    return { findings, evidence };
  }
}
