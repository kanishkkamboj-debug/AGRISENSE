import { SatelliteContext } from "../../../../shared/types/agriculture";

export class SatelliteService {
  static getSatelliteContext(fieldId: string): SatelliteContext {
    return {
      lastUpdated: new Date().toISOString(),
      ndviAverage: 0.74,
      ndviTrend: "STABLE",
      moistureIndex: 0.48,
      provider: "Sentinel-2 L2A Multispectral",
      imageryUrl: `https://sentinel-hub.com/api/v1/wms?fieldId=${fieldId}`,
      available: true,
    };
  }
}
