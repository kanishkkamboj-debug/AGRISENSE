import React, { useState, useEffect } from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { CropSelector } from "../../components/CropSelector";
import { fetchAgronomyEvaluation } from "../../services/api";
import { Sprout, AlertTriangle, CloudRain, CheckCircle, Sparkles, RefreshCw, ShieldCheck, Info } from "lucide-react";

export const AdvisoryView: React.FC = () => {
  const { activeFieldCondition, setActiveFieldCondition, selectedCrop, selectedCropId, selectedStageId, selectedFieldId } = useIoTData();
  const [agronomyData, setAgronomyData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchAgronomyEvaluation(selectedFieldId, selectedCropId, selectedStageId);
      if (res) {
        setAgronomyData(res);
      }
      setLoading(false);
    }
    load();
  }, [selectedFieldId, selectedCropId, selectedStageId]);

  const states = [
    {
      id: "Normal" as const,
      title: "Normal",
      subtitle: "Optimal soil conditions",
      icon: Sprout,
      bg: "bg-[#141A16]",
      border: "border-[#202922]",
      activeBorder: "ring-2 ring-[#34D399] border-[#34D399]",
      badgeBg: "bg-[#34D399]/20 text-[#34D399]",
      description: `Field in optimal state for ${selectedCrop?.name || "crop"}. Focus on stage-specific nutrient management.`,
      indicators: [
        `Soil Moisture: ${selectedCrop?.soil?.moisture?.min || 35}–${selectedCrop?.soil?.moisture?.max || 65}%`,
        `Target Temp: ${selectedCrop?.temperature?.optimal || 20}°C`,
        `pH: ${selectedCrop?.soil?.preferredPH?.min || 6.0}–${selectedCrop?.soil?.preferredPH?.max || 7.5}`,
      ],
      aiMethods: selectedCrop?.recommendations || ["Precision Irrigation", "Stage-Specific Fertilization"],
    },
    {
      id: "Drought" as const,
      title: "Drought",
      subtitle: "Water stress detected",
      icon: AlertTriangle,
      bg: "bg-[#141A16]",
      border: "border-[#202922]",
      activeBorder: "ring-2 ring-amber-500 border-amber-500",
      badgeBg: "bg-amber-500/20 text-amber-300",
      description: `Moisture deficit for ${selectedCrop?.name || "crop"}. Immediate water conservation and micro-irrigation required.`,
      indicators: [
        `Soil Moisture: < ${selectedCrop?.soil?.moisture?.min || 35}%`,
        "Rainfall: < 5mm",
        `Temp Spike: > ${selectedCrop?.temperature?.max || 30}°C`,
      ],
      aiMethods: ["Drip Irrigation", "Mulching"],
    },
    {
      id: "Flood" as const,
      title: "Flood",
      subtitle: "Water excess detected",
      icon: CloudRain,
      bg: "bg-[#141A16]",
      border: "border-[#202922]",
      activeBorder: "ring-2 ring-blue-500 border-blue-500",
      badgeBg: "bg-blue-500/20 text-blue-300",
      description: `Excess saturation above ${selectedCrop?.name || "crop"} limit (${selectedCrop?.soil?.moisture?.max || 65}%). Surface drainage required immediately.`,
      indicators: [
        `Soil Moisture: > ${selectedCrop?.soil?.moisture?.max || 65}%`,
        "Rainfall: > 35mm",
        "Waterlogging Risk",
      ],
      aiMethods: ["Surface Drainage", "Pump De-watering"],
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4 text-[#F0FDF4] font-sans">
      {/* Page Title & Crop Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A16] border border-[#202922] shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Crop Advisory Engine (ICAR-PAU Rules)
          </h1>
          <p className="text-xs sm:text-sm text-[#8E9B91] font-mono mt-1">
            Target Crop: <strong className="text-[#34D399]">{selectedCrop?.name || "Wheat"}</strong> ({selectedCrop?.scientificName}). Deterministic rule evaluation.
          </p>
        </div>

        <CropSelector />
      </div>

      {/* Dynamic Agronomic Evaluation Summary Card */}
      {loading ? (
        <div className="p-6 rounded-2xl bg-[#141A16] border border-[#202922] text-center font-mono text-xs text-[#8E9B91] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#34D399]" />
          <span>Evaluating ICAR-PAU rules for {selectedCrop?.name}...</span>
        </div>
      ) : agronomyData ? (
        <div className="p-6 rounded-2xl bg-[#141A16] border border-[#202922] shadow-lg space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#202922] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#34D399]" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Agronomic Decision: {agronomyData.status} ({agronomyData.riskLevel} RISK)
              </h2>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded bg-[#34D399]/10 text-[#34D399] font-bold border border-[#34D399]/30">
              Source: {agronomyData.decisionSource}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
            <div className="p-4 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#34D399] block">Irrigation Action</span>
              <p className="text-white font-bold">{agronomyData.irrigationAction}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">Fertilizer Action</span>
              <p className="text-white font-bold">{agronomyData.fertilizerAction}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-sky-400 block">Pesticide Action</span>
              <p className="text-white font-bold">{agronomyData.pesticideAction}</p>
            </div>
          </div>

          {agronomyData.rulesTriggered && agronomyData.rulesTriggered.length > 0 && (
            <div className="pt-2 border-t border-[#202922] space-y-2">
              <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider block">Triggered Deterministic Rules ({agronomyData.rulesTriggered.length})</span>
              <div className="space-y-1">
                {agronomyData.rulesTriggered.map((rule: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-[#0F1411] border border-[#1F2922] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{rule.ruleId || `Rule #${i+1}`} ({rule.crop})</span>
                      <span className="text-[10px] text-[#8E9B91]">{rule.threshold}</span>
                    </div>
                    <span className="text-[10px] text-[#34D399] font-bold">
                      {typeof rule.source === "string" ? rule.source : rule.source?.organization || "PAU/ICAR"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* 3 Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        {states.map((st) => {
          const Icon = st.icon;
          const isSelected = activeFieldCondition === st.id;

          return (
            <div
              key={st.id}
              onClick={() => setActiveFieldCondition(st.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-sm flex flex-col justify-between space-y-6 ${st.bg} ${st.border} ${
                isSelected ? st.activeBorder : "hover:border-[#34D399]/40"
              }`}
            >
              <div className="space-y-4">
                {/* Icon & Title */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                    <Icon className="w-7 h-7 text-[#34D399]" />
                  </div>
                  {isSelected && (
                    <span className="px-3 py-1 rounded-full bg-[#34D399] text-[#08120B] font-mono text-xs font-extrabold flex items-center gap-1 shadow">
                      <CheckCircle className="w-3.5 h-3.5" /> ACTIVE
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{st.title}</h2>
                  <p className="text-xs font-mono text-[#8E9B91]">{st.subtitle}</p>
                </div>

                <p className="text-xs text-[#9EB1A3] leading-relaxed font-sans">{st.description}</p>

                {/* Field Indicators */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#6B7C6F] tracking-wider block">
                    {selectedCrop?.name} Indicators
                  </span>
                  <ul className="space-y-1 font-mono text-xs text-white">
                    {st.indicators.map((ind, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Methods */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#6B7C6F] tracking-wider block">
                    Targeted Mitigation Strategies
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    {st.aiMethods.map((mth: string, idx: number) => (
                      <span key={idx} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.badgeBg}`}>
                        {mth}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lock State Action Button */}
      <div className="flex justify-center pt-4 font-mono">
        <button className="px-8 py-3.5 rounded-2xl bg-[#34D399] text-[#08120B] font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-[#34D399]/10 hover:bg-[#2DD4BF] transition-all">
          <Sparkles className="w-4 h-4 fill-current" /> Active Condition Locked: {activeFieldCondition} for {selectedCrop?.name}
        </button>
      </div>
    </div>
  );
};
