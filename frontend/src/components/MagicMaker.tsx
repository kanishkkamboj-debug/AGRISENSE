import React, { useState, useEffect } from "react";
import { useIoTData } from "../hooks/useIoTData";
import { fetchMagicMaker } from "../services/api";
import { Sparkles, Sprout, MapPin, Activity, TrendingUp, CloudSun, ShieldAlert, CheckCircle2, Info, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";

export const MagicMaker: React.FC = () => {
  const { selectedCrop, selectedCropId, selectedStageId, selectedFieldId } = useIoTData();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchMagicMaker(selectedFieldId, selectedCropId, selectedStageId);
      if (res) {
        setData(res);
      }
      setLoading(false);
    }
    load();
  }, [selectedCropId, selectedStageId, selectedFieldId]);

  if (loading) {
    return (
      <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#34D399]" />
          <span className="text-white font-bold">Evaluating Dynamic Magic Maker Pipeline for {selectedCrop?.name || "Target Crop"}...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm font-mono text-xs text-[#8E9B91]">
        Unable to load Magic Maker pipeline for target crop {selectedCrop?.name}.
      </div>
    );
  }

  const { selectedCrop: cropInfo, fieldContext, currentTelemetry, historicalTrends, weather, cropSpecificRules, riskDetection, recommendation, explanationAction, pipelineTrace } = data;

  return (
    <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-lg space-y-6 font-mono text-xs text-[#F0FDF4]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202922] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#34D399] fill-current" />
            <h2 className="text-lg font-black text-white tracking-tight">
              Dynamic Magic Maker: {cropInfo.name} Precision Engine
            </h2>
          </div>
          <p className="text-[11px] text-[#8E9B91] font-sans mt-0.5">
            Data-driven agronomic synthesis powered by real telemetry, weather context, & {cropInfo.name}-specific rule engine.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#34D399]/10 text-[#34D399] font-bold border border-[#34D399]/30 text-[10px]">
          Target: {cropInfo.name} ({cropInfo.scientificName})
        </span>
      </div>

      {/* 9-Step Pipeline Visual Strip */}
      <div className="space-y-2">
        <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">MAGIC MAKER DATA PIPELINE FLOW</span>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 text-[9px] font-bold text-center">
          <div className="p-2 rounded-lg bg-[#0F1411] border border-[#34D399]/40 text-[#34D399]">
            <Sprout className="w-3.5 h-3.5 mx-auto mb-1" /> 1. Crop
          </div>
          <div className="p-2 rounded-lg bg-[#0F1411] border border-[#1F2922] text-[#8E9B91]">
            <MapPin className="w-3.5 h-3.5 mx-auto mb-1 text-sky-400" /> 2. Field
          </div>
          <div className="p-2 rounded-lg bg-[#0F1411] border border-[#1F2922] text-[#8E9B91]">
            <Activity className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" /> 3. Telemetry
          </div>
          <div className="p-2 rounded-lg bg-[#0F1411] border border-[#1F2922] text-[#8E9B91]">
            <TrendingUp className="w-3.5 h-3.5 mx-auto mb-1 text-indigo-400" /> 4. Trends
          </div>
          <div className="p-2 rounded-lg bg-[#0F1411] border border-[#1F2922] text-[#8E9B91]">
            <CloudSun className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" /> 5. Weather
          </div>
          <div className="p-2 rounded-lg bg-[#0F1411] border border-[#1F2922] text-[#8E9B91]">
            <CheckCircle2 className="w-3.5 h-3.5 mx-auto mb-1 text-blue-400" /> 6. Rules
          </div>
          <div className="p-2 rounded-lg bg-[#0F1411] border border-[#1F2922] text-[#8E9B91]">
            <ShieldAlert className="w-3.5 h-3.5 mx-auto mb-1 text-rose-400" /> 7. Risks
          </div>
          <div className="p-2 rounded-lg bg-[#0F1411] border border-[#1F2922] text-[#8E9B91]">
            <Info className="w-3.5 h-3.5 mx-auto mb-1 text-purple-400" /> 8. Action
          </div>
          <div className="p-2 rounded-lg bg-[#34D399]/20 border border-[#34D399] text-[#34D399]">
            <Sparkles className="w-3.5 h-3.5 mx-auto mb-1" /> 9. Output
          </div>
        </div>
      </div>

      {/* Grid of Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Crop & Field Context */}
        <div className="p-4 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-2.5">
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">1. CROP & FIELD TARGET</span>
          <div className="space-y-1">
            <p className="text-white font-bold text-sm">{cropInfo.name} ({cropInfo.scientificName})</p>
            <p className="text-[#8E9B91]">Field: {fieldContext.name} ({fieldContext.locationName})</p>
            <p className="text-[#8E9B91]">Stage: <strong className="text-[#34D399]">{cropSpecificRules.growthStageName}</strong></p>
          </div>
          <div className="pt-2 border-t border-[#1F2922] space-y-1 text-[11px] text-[#8E9B91]">
            <div className="flex justify-between">
              <span>Target Moisture:</span>
              <span className="text-white font-bold">{cropInfo.preferredMoisture.min}% - {cropInfo.preferredMoisture.max}%</span>
            </div>
            <div className="flex justify-between">
              <span>Water Requirement:</span>
              <span className="text-[#34D399] font-bold">{cropSpecificRules.waterRequirementMmDay} mm/day</span>
            </div>
          </div>
        </div>

        {/* Card 2: Live Telemetry & Historical Trends */}
        <div className="p-4 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-2.5">
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">2. TELEMETRY & HISTORICAL TRENDS</span>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#8E9B91]">Live Moisture:</span>
              <span className={`font-bold ${currentTelemetry.moisture !== null ? "text-white" : "text-amber-400"}`}>
                {currentTelemetry.moisture !== null ? `${currentTelemetry.moisture}%` : "Insufficient live data"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8E9B91]">Soil Temp:</span>
              <span className="text-white font-bold">
                {currentTelemetry.soilTemp !== null ? `${currentTelemetry.soilTemp}°C` : "Insufficient live data"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8E9B91]">Telemetry Status:</span>
              <span className={`text-[10px] font-bold ${currentTelemetry.isLive ? "text-[#34D399]" : "text-amber-400"}`}>
                {currentTelemetry.statusText}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#1F2922] space-y-1 text-[11px] text-[#8E9B91]">
            <div className="flex justify-between">
              <span>24h Avg Moisture:</span>
              <span className="text-white font-bold">{historicalTrends.avgMoisture24h !== null ? `${historicalTrends.avgMoisture24h}%` : "No data"}</span>
            </div>
            <div className="flex justify-between">
              <span>Trajectory:</span>
              <span className="text-sky-400 font-bold">{historicalTrends.moistureTrajectory}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Weather Context & Risk Detection */}
        <div className="p-4 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-2.5">
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">3. WEATHER & DETECTED RISKS</span>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#8E9B91]">Weather State:</span>
              <span className={`font-bold ${weather.isAvailable ? "text-white" : "text-amber-400"}`}>
                {weather.isAvailable ? `${weather.weatherConditionText} (${weather.currentTempCelsius}°C)` : "Weather data unavailable"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8E9B91]">Primary Risk:</span>
              <span className={`font-bold ${riskDetection.severity === "CRITICAL" || riskDetection.severity === "HIGH" ? "text-rose-400" : "text-[#34D399]"}`}>
                {riskDetection.primaryCondition} ({riskDetection.severity})
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#1F2922] space-y-1 text-[11px]">
            <span className="text-[#8E9B91] block">Crop Pest & Disease Radar:</span>
            <div className="flex flex-wrap gap-1">
              {riskDetection.diseaseRisks.slice(0, 2).map((d: string, i: number) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[9px]">
                  {d}
                </span>
              ))}
              {riskDetection.pestRisks.slice(0, 2).map((p: string, i: number) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[9px]">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Recommendation & Agronomic Explanation */}
      <div className="p-5 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#34D399]" /> {explanationAction.headline}
          </h3>
          <span className="text-[10px] text-[#34D399] font-mono font-bold">DECISION SOURCE: ICAR/PAU DETERMINISTIC ENGINE</span>
        </div>

        <p className="text-xs text-[#9EB1A3] font-sans leading-relaxed">
          {explanationAction.narrative}
        </p>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Recommended Action Steps for {cropInfo.name}:</span>
          <ul className="space-y-1 text-xs text-[#D1FAE5] list-disc list-inside">
            {recommendation.steps.map((step: string, i: number) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>

        {recommendation.doNotActions && recommendation.doNotActions.length > 0 && (
          <div className="p-3 rounded-lg bg-[#2B1A1E] border border-[#482027] text-xs text-[#FCA5A5] space-y-1">
            <span className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> DO NOT ACTIONS:
            </span>
            <ul className="list-disc list-inside space-y-0.5">
              {recommendation.doNotActions.map((act: string, i: number) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
