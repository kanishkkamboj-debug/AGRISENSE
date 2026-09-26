import React, { useState, useEffect } from "react";
import {
  IoTIntelligenceReport,
  WhyAnalysisResult,
  WhatChangedResult,
  WhatIfSimulationResult,
  FieldReplayPoint,
  AgriculturalEvent,
} from "@agrisense/shared";
import {
  fetchIoTIntelligence,
  fetchWhyAnalysis,
  fetchWhatChanged,
  fetchWhatIfSimulation,
  fetchFieldReplay,
  fetchIoTEvents,
} from "../../services/api";
import { Activity, AlertTriangle, ArrowDown, ArrowUp, CheckCircle, Clock, Cpu, Droplets, Info, Play, RefreshCw, ShieldAlert, Sun, Thermometer, Wind, Zap } from "lucide-react";

export const IoTIntelligenceView: React.FC = () => {
  const [report, setReport] = useState<IoTIntelligenceReport | null>(null);
  const [whyData, setWhyData] = useState<WhyAnalysisResult | null>(null);
  const [whatChanged, setWhatChanged] = useState<WhatChangedResult | null>(null);
  const [simulation, setSimulation] = useState<WhatIfSimulationResult | null>(null);
  const [events, setEvents] = useState<AgriculturalEvent[]>([]);
  const [replayPoints, setReplayPoints] = useState<FieldReplayPoint[]>([]);
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "why" | "what-changed" | "what-if" | "digital-twin">("overview");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadIntelligenceData();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isPlaying && replayPoints.length > 0) {
      interval = setInterval(() => {
        setReplayIndex((prev) => (prev + 1) % replayPoints.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, replayPoints]);

  const loadIntelligenceData = async () => {
    setLoading(true);
    const [rep, why, changed, evts, replay] = await Promise.all([
      fetchIoTIntelligence(),
      fetchWhyAnalysis(),
      fetchWhatChanged("6h"),
      fetchIoTEvents(),
      fetchFieldReplay("24h"),
    ]);

    if (rep) setReport(rep);
    if (why) setWhyData(why);
    if (changed) setWhatChanged(changed);
    if (evts) setEvents(evts);
    if (replay) setReplayPoints(replay);
    setLoading(false);
  };

  const handleRunSimulation = async (scenario: string) => {
    const res = await fetchWhatIfSimulation(scenario);
    if (res) setSimulation(res);
  };

  if (loading || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-6">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-lg font-medium">Synthesizing AgriSense Intelligence v3 Signals...</p>
        <p className="text-sm text-slate-400 mt-1">Transforming raw telemetry into biophysical field insights</p>
      </div>
    );
  }

  const currentReplayPoint = replayPoints[replayIndex] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Zap className="w-7 h-7 text-emerald-400" /> AgriSense Intelligence v3
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              PHYSICAL TELEMETRY PIPELINE
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry derivation, multi-sensor correlation, sensor anomaly radar, & biophysical diagnostic engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="text-slate-400">Stress Level:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                report.environmentalStress.stressLevel === "CRITICAL"
                  ? "bg-rose-950 text-rose-400 border border-rose-800"
                  : report.environmentalStress.stressLevel === "HIGH"
                  ? "bg-amber-950 text-amber-400 border border-amber-800"
                  : report.environmentalStress.stressLevel === "MODERATE"
                  ? "bg-yellow-950 text-yellow-400 border border-yellow-800"
                  : "bg-emerald-950 text-emerald-400 border border-emerald-800"
              }`}
            >
              {report.environmentalStress.stressLevel}
            </span>
          </div>

          <button
            onClick={loadIntelligenceData}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Signals
          </button>
        </div>
      </div>

      {/* TOP METRICS & DERIVED CONDITIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium"><Thermometer className="w-4 h-4 text-rose-400" /> Temperature Signal</span>
            <span className="text-slate-500 font-mono">{report.derivedSignals.ambient_temperature?.trend || "STABLE"}</span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {report.derivedSignals.ambient_temperature?.value !== null ? `${report.derivedSignals.ambient_temperature?.value}°C` : <span className="text-slate-500 text-base">UNAVAILABLE</span>}
          </div>
          <div className="text-xs text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>24h Range: {report.derivedSignals.ambient_temperature?.min24h ?? "-"}°C - {report.derivedSignals.ambient_temperature?.max24h ?? "-"}°C</span>
            <span className="text-emerald-400 font-medium">{report.derivedSignals.ambient_temperature?.changeRatePerHour ?? 0}°C/hr</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium"><Wind className="w-4 h-4 text-cyan-400" /> Humidity Signal</span>
            <span className="text-slate-500 font-mono">{report.derivedSignals.ambient_humidity?.trend || "STABLE"}</span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {report.derivedSignals.ambient_humidity?.value !== null ? `${report.derivedSignals.ambient_humidity?.value}%` : <span className="text-slate-500 text-base">UNAVAILABLE</span>}
          </div>
          <div className="text-xs text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>Stability: {report.derivedSignals.ambient_humidity?.stabilityIndex || "STABLE"}</span>
            <span className="text-cyan-400 font-medium">{report.derivedSignals.ambient_humidity?.changeRatePerHour ?? 0}%/hr</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium"><Droplets className="w-4 h-4 text-blue-400" /> Soil Moisture & Drying Rate</span>
            <span className="text-slate-500 font-mono">{report.soilIntelligence.moistureTrend}</span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {report.derivedSignals.soil_moisture?.value !== null ? `${report.derivedSignals.soil_moisture?.value}%` : <span className="text-slate-500 text-base font-semibold">UNAVAILABLE</span>}
          </div>
          <div className="text-xs text-slate-400 flex justify-between pt-1 border-t border-slate-800">
            <span>Drying Speed: {report.soilIntelligence.dryingRatePerHour ? `-${report.soilIntelligence.dryingRatePerHour}%/hr` : "Stable"}</span>
            <span className="text-blue-400 font-medium">Deficit: {report.soilIntelligence.moistureDeficitPercent ?? 0}%</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium"><Cpu className="w-4 h-4 text-amber-400" /> Gas Raw Signal (MQ)</span>
            <span className="text-slate-500 font-mono">Unconverted</span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {report.derivedSignals.mq_raw?.value !== null ? report.derivedSignals.mq_raw?.value : <span className="text-slate-500 text-base">UNAVAILABLE</span>}
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Raw ADC signal monitored without false ppm conversion</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 border-b-2 transition ${activeTab === "overview" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Signal Intelligence Radar
        </button>
        <button
          onClick={() => setActiveTab("why")}
          className={`pb-3 border-b-2 transition ${activeTab === "why" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Why Is My Field Like This?
        </button>
        <button
          onClick={() => setActiveTab("what-changed")}
          className={`pb-3 border-b-2 transition ${activeTab === "what-changed" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          What Changed? (6h vs 24h)
        </button>
        <button
          onClick={() => setActiveTab("what-if")}
          className={`pb-3 border-b-2 transition ${activeTab === "what-if" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          What-If Simulator
        </button>
        <button
          onClick={() => setActiveTab("digital-twin")}
          className={`pb-3 border-b-2 transition ${activeTab === "digital-twin" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          Digital Twin & Field Replay
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW / RADAR */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: CORRELATIONS & PREDICTIONS */}
          <div className="lg:col-span-2 space-y-6">
            {/* MULTI-SENSOR CORRELATION CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Multi-Sensor Pattern Correlation Engine
              </h3>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300">
                {report.multiSensorCorrelation.summaryText}
              </div>

              {report.multiSensorCorrelation.detectedCombinations.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Cross-Sensor Correlations</p>
                  {report.multiSensorCorrelation.detectedCombinations.map((comb, idx) => (
                    <div key={idx} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 text-xs text-slate-200 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{comb}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No acute cross-sensor conflict patterns detected at this timestamp.</p>
              )}
            </div>

            {/* PREDICTIVE SOIL DEPLETION LAYER */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" /> Predictive Soil Depletion Forecast
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    report.predictions.isPredictionReliable
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {report.predictions.isPredictionReliable ? "RELIABLE FORECAST" : "INSUFFICIENT DATA FALLBACK"}
                </span>
              </div>

              {report.predictions.isPredictionReliable ? (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">+6 Hours</p>
                    <p className="text-xl font-bold text-blue-400">{report.predictions.moistureEstimate6h}%</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">+12 Hours</p>
                    <p className="text-xl font-bold text-amber-400">{report.predictions.moistureEstimate12h}%</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">+24 Hours</p>
                    <p className="text-xl font-bold text-rose-400">{report.predictions.moistureEstimate24h}%</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 text-xs text-amber-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Prediction Guard Active</p>
                    <p className="mt-0.5">{report.predictions.predictionReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COL: ANOMALIES & EVENTS */}
          <div className="space-y-6">
            {/* SENSOR ANOMALY RADAR */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" /> Sensor Anomaly Radar
              </h3>
              {report.anomalies.length > 0 ? (
                <div className="space-y-2">
                  {report.anomalies.map((anom) => (
                    <div key={anom.id} className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-rose-300 font-semibold">
                        <span>{anom.anomalyType}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800">{anom.severity}</span>
                      </div>
                      <p className="text-slate-300">{anom.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-lg text-center text-xs text-slate-400 border border-slate-800">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <p>All active hardware sensors are operating without signal anomalies.</p>
                </div>
              )}
            </div>

            {/* AGRICULTURAL EVENTS */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" /> Field Event Log
              </h3>
              {events.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {events.map((evt) => (
                    <div key={evt.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400">{evt.eventType}</span>
                        <span className="text-slate-500">{new Date(evt.startedAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300">{evt.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4">No critical agricultural events recorded recently.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WHY IS MY FIELD LIKE THIS */}
      {activeTab === "why" && whyData && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">{whyData.title}</h2>
            <p className="text-sm text-emerald-400 font-medium mt-1">Primary Biophysical Driver: {whyData.primaryDriver}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Derived Evidence Chain</h3>
            <div className="space-y-2">
              {whyData.evidenceChain.map((ev) => (
                <div key={ev.step} className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-semibold">
                    <span>Step {ev.step}: {ev.parameter}</span>
                  </div>
                  <p className="text-slate-200 font-medium">{ev.observation}</p>
                  <p className="text-slate-400 italic">Impact: {ev.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {whyData.missingDataNotes.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-4 space-y-2 text-xs text-amber-300">
              <p className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" /> Sensor Availability Constraints</p>
              <ul className="list-disc list-inside space-y-1">
                {whyData.missingDataNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: WHAT CHANGED */}
      {activeTab === "what-changed" && whatChanged && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">What Changed in Your Field ({whatChanged.period})</h2>
            <p className="text-sm text-slate-400 mt-1">{whatChanged.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whatChanged.changes.map((ch, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-white capitalize">
                  <span>{ch.parameter.replace("_", " ")}</span>
                  <span
                    className={`flex items-center gap-1 font-mono ${
                      ch.direction === "INCREASED" ? "text-emerald-400" : ch.direction === "DECREASED" ? "text-rose-400" : "text-slate-400"
                    }`}
                  >
                    {ch.direction === "INCREASED" ? <ArrowUp className="w-3.5 h-3.5" /> : ch.direction === "DECREASED" ? <ArrowDown className="w-3.5 h-3.5" /> : null}
                    {ch.changeText}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Prev: {ch.previousValue}</span>
                  <span>Curr: {ch.currentValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: WHAT-IF SIMULATOR */}
      {activeTab === "what-if" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">What-If Decision Simulator</h2>
            <p className="text-sm text-slate-400 mt-1">Simulate management actions on physical field conditions before applying them.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleRunSimulation("IRRIGATE_20MM")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
            >
              Simulate +20mm Irrigation
            </button>
            <button
              onClick={() => handleRunSimulation("RAINFALL_30MM")}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
            >
              Simulate +30mm Heavy Rain
            </button>
            <button
              onClick={() => handleRunSimulation("HEATWAVE_5C")}
              className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
            >
              Simulate +5°C Heatwave Spike
            </button>
          </div>

          {simulation && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-emerald-400 text-sm">Simulation Output: {simulation.scenarioName}</span>
                <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  SIMULATION ONLY (NOT REAL TELEMETRY)
                </span>
              </div>
              <p className="text-sm text-slate-200 font-medium">{simulation.predictedOutcome}</p>
              <div className="space-y-1 text-xs text-slate-400">
                {simulation.warnings.map((w, idx) => (
                  <p key={idx} className="italic text-amber-400/80">⚠️ {w}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: DIGITAL TWIN & FIELD REPLAY */}
      {activeTab === "digital-twin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DIGITAL TWIN NODE TREE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" /> Field Digital Twin Hierarchy
            </h3>
            <div className="space-y-2">
              {report.digitalTwin.nodes.map((node, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold block">{node.category}</span>
                    <span className="font-semibold text-white">{node.name}</span>
                    {node.details && <span className="text-slate-400 block text-[11px] mt-0.5">{node.details}</span>}
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 font-bold block">{node.value}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        node.status === "CRITICAL"
                          ? "bg-rose-950 text-rose-400"
                          : node.status === "WARNING"
                          ? "bg-amber-950 text-amber-400"
                          : "bg-emerald-950 text-emerald-400"
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FIELD REPLAY PLAYER */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-400" /> Animated Field Replay (24h)
              </h3>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> {isPlaying ? "Pause" : "Play Replay"}
              </button>
            </div>

            {currentReplayPoint ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="font-mono font-bold text-emerald-400">{new Date(currentReplayPoint.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block">Temp</span>
                    <span className="font-bold text-white text-base">{currentReplayPoint.temp ?? "N/A"}°C</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block">Humidity</span>
                    <span className="font-bold text-white text-base">{currentReplayPoint.humidity ?? "N/A"}%</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block">Moisture</span>
                    <span className="font-bold text-white text-base">{currentReplayPoint.moisture ?? "N/A"}%</span>
                  </div>
                </div>

                {/* SLIDER */}
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, replayPoints.length - 1)}
                  value={replayIndex}
                  onChange={(e) => setReplayIndex(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No historical replay telemetry points available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
