import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { Finding, Evidence } from "../../../../shared/types/recommendation";

export class DiseaseAnalyzer {
  static analyze(ctx: AgriculturalContext): { findings: Finding[]; evidence: Evidence[] } {
    const findings: Finding[] = [];
    const evidence: Evidence[] = [];

    const humidity = ctx.weather?.currentHumidityPercent || 60;
    const temp = ctx.weather?.currentTempCelsius || 25;

    // Fungal pathogen favorability check
    if (humidity > 80 && temp >= 18 && temp <= 26 && ctx.crop.diseaseRisks && ctx.crop.diseaseRisks.length > 0) {
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
        description: `High humidity (${humidity}%) promotes fungal pathogen incubation (${ctx.crop.diseaseRisks[0]})`,
        severity: "MEDIUM",
        evidence: [ev],
      });
    }

    return { findings, evidence };
  }
}
