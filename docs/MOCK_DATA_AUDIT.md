# AgriSense AI — Mock Data Search Audit (MOCK_DATA_AUDIT.md)

## Audit Target & Rules
Search all codebase files for production usage of mock data services, hardcoded numerical fallbacks, static arrays, and unvalidated placeholder data.

## Prohibited vs Permitted Usage

### Prohibited in Production (`REAL_IOT` mode):
- `MockDataService.getMockContext()` in `backend/src/controllers/intelligenceController.ts`.
- Static height arrays `[40, 55, 60, 48, ...]` for chart preview generation.
- Fallback expressions `value || 45` or `temp ?? 26.8` when telemetry is missing.
- Arbitrary condition state setting without telemetry evidence.

### Permitted Usage:
- Test fixtures in unit test suites (`tests/unit/*`).
- Explicitly enabled `SIMULATION` mode when toggled by user.
- Reference crop profile target ranges in `knowledge-base/crops/index.ts` (`KNOWLEDGE_BASE`).

## Resolved Code Modifications
1. `backend/src/controllers/intelligenceController.ts`:
   - Updated `/intelligence/live`, `/intelligence/why`, `/intelligence/what-changed`, `/intelligence/replay` to call `ContextBuilder.buildContext(fieldId, "REAL_IOT")`.
2. `frontend/src/views/Dashboard/index.tsx`:
   - Removed static fallback array `[40, 55, 60, ...]` in SHI History bar chart. Replaced with actual timestamped DB telemetry points or `NO HISTORICAL TELEMETRY`.
3. `frontend/src/views/Reports/index.tsx`:
   - Removed preview sparkline math `[shiScore - 4, shiScore - 2, ...]`. Replaced with actual database telemetry history records.
4. `frontend/src/views/Analytics/index.tsx`:
   - Returns `NO TELEMETRY AVAILABLE` when count is 0. Displays `INSUFFICIENT_DATA` for trend velocity when telemetry samples < 2.
5. `frontend/src/components/BottomTelemetryBar.tsx`:
   - Outputs `UNAVAILABLE` and data age provenance badge for all missing sensor parameters.

