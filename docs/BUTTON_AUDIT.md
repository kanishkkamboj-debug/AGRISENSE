# AgriSense AI — Button & Control Audit (BUTTON_AUDIT.md)

| Page | Control / Button | Expected Behavior | Frontend Handler | API Endpoint | DB Operation | Success State | Failure State | Loading State | Implemented |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Header** | Logo | Navigate to `/` | React Router Link | None | None | Dashboard view renders | N/A | N/A | YES |
| **Dashboard** | Crop Selector | Change crop context | `setSelectedCropId` | `GET /api/v1/public/crops` | Read Crop KB | Re-evaluate SHI & deltas | Fallback to Wheat | Loading crops | YES |
| **Dashboard** | Stage Selector | Change stage context | `setSelectedStageId` | None | None | Re-evaluate stage targets | Fallback to Stage 1 | N/A | YES |
| **Dashboard** | System Mode Toggle | Switch REAL / SIM | `setSystemMode` | `GET /api/v1/public/telemetry/latest` | Query Telemetry | Updates dataMode badge | Keep current mode | Reloading data | YES |
| **GIS** | Search Go | Geocode location query | `handleSearchLocation` | Nominatim API | None | Map pans & zooms to lat/lng | Warning toast | Searching... | YES |
| **GIS** | Save Boundary | Save polygon boundary | `handleSaveBoundary` | `POST /api/v1/public/gis/fields` | `fields.findOneAndUpdate` | Boundary saved message | Error toast | Saving... | YES |
| **Crops** | Initiate Scan | Start scan session | `handleStartScan` | `POST /api/v1/device/config` (Downlink) | `devices.updateOne` | Active scan status | Device offline alert | Initiating... | TO CONNECT |
| **Crops** | Reset Scan | Reset scan controls | `handleReset` | None | None | Resets scan sliders | N/A | N/A | YES |
| **Analytics** | Range Buttons | Filter time range | `setRange` | `GET /api/v1/public/analytics?range=...` | `telemetry.find` aggregate | Renders aggregated stats | Shows error message | Loading stats | YES |
| **Reports** | Export CSV | Download telemetry CSV | `handleExportCsv` | `GET /api/v1/public/reports/export-csv` | `telemetry.find` stream | CSV file downloads | Error download | Processing... | YES |
| **Settings** | Save Settings | Update project profile | `handleSave` | `POST /api/v1/public/settings` | `settings.findOneAndUpdate` | Saved to DB confirmation | Error toast | Saving... | YES |
| **Alerts** | Resolve Alert | Mark alert resolved | `handleResolve` | `POST /api/v1/public/alerts/:id/resolve` | `alerts.findByIdAndUpdate` | Alert status = RESOLVED | Error toast | Resolving... | YES |
| **Alerts** | Create Action | Convert alert to task | `handleCreateAction` | `POST /api/v1/public/alerts/:id/create-action` | `actions.create` | Task added to queue | Error toast | Creating... | YES |
| **Alerts** | Refresh Alerts | Reload alerts list | `loadAlerts` | `GET /api/v1/public/alerts` | `alerts.find` | Refreshed alert cards | Error toast | Spin icon | YES |
| **Intelligence** | Refresh Signals | Reload intelligence | `loadIntelligenceData` | `GET /api/v1/public/intelligence/live` | `telemetry.find` | Signals updated | Error toast | Spin icon | YES |
| **Intelligence** | Run Simulation | Run what-if scenario | `handleRunSimulation` | `POST /api/v1/public/intelligence/what-if` | None | Simulation output card | Error toast | Simulating... | YES |
| **Intelligence** | Play Replay | Toggle 24h replay | `setIsPlaying` | `GET /api/v1/public/intelligence/replay` | `telemetry.find` | Replay index ticks | Insufficient points | Playing... | YES |
| **Ask AI** | Ask Button / Enter | Ask AI assistant | `handleAsk` | `POST /api/v1/public/advisories/ask` | None | AI answer rendered | Offline fallback | Thinking... | YES |
| **Sidebar** | Change State | Navigate to `/advisory` | React Router Link | None | None | Renders advisory view | N/A | N/A | YES |
