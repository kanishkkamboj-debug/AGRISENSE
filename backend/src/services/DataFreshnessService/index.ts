import { FreshnessState } from "../../../../shared/constants";

export class DataFreshnessService {
  static getDataAgeSeconds(timestamp?: string): number | null {
    if (!timestamp) return null;
    const parsed = Date.parse(timestamp);
    if (isNaN(parsed)) return null;
    return Math.max(0, Math.floor((Date.now() - parsed) / 1000));
  }

  static getFreshnessState(timestamp?: string): FreshnessState {
    const ageSeconds = this.getDataAgeSeconds(timestamp);
    if (ageSeconds === null) return "NO_DATA";

    if (ageSeconds <= 15) {
      return "LIVE";
    } else if (ageSeconds <= 300) {
      // 5 minutes
      return "RECENT";
    } else if (ageSeconds <= 3600) {
      // 1 hour
      return "STALE";
    } else {
      return "OFFLINE";
    }
  }

  static isFresh(timestamp?: string): boolean {
    const state = this.getFreshnessState(timestamp);
    return state === "LIVE" || state === "RECENT";
  }

  static isStale(timestamp?: string): boolean {
    const state = this.getFreshnessState(timestamp);
    return state === "STALE" || state === "OFFLINE" || state === "NO_DATA";
  }
}
