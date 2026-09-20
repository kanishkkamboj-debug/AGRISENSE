import React, { useEffect, useState } from "react";
import { fetchAdvisory } from "../../services/api";
import { AdvisoryResponse } from "../../../../shared/types/api";
import { AlertOctagon, AlertTriangle, CheckCircle, Clock, ShieldAlert, Sparkles, Database, FileText } from "lucide-react";

export const AdvisoryView: React.FC = () => {
  const [advisory, setAdvisory] = useState<AdvisoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"urgent" | "attention" | "routine">("urgent");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchAdvisory("FIELD-PUNJAB-01");
      setAdvisory(res);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-400" />
        Evaluating Multi-Analyzer Intelligence Engine & Agronomic Evidence...
      </div>
    );
  }

  const plan = advisory?.farmerActionPlan;
  const analysis = advisory?.analysisResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Daily Farm Action Plan ("What should I do now?")</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Field 01 — Crop: Wheat (Tillering Stage) | Knowledge Base: PAU / ICAR 2026.1
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Engine Confidence: <strong className="text-emerald-400">{analysis?.confidence || "HIGH"}</strong>
          </span>
        </div>
      </div>

      {/* Gemini AI Natural Language Explanation Banner */}
      {advisory?.naturalLanguageExplanation && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-950 to-emerald-950/60 p-6 rounded-2xl border border-emerald-800/60 shadow-xl">
          <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-mono font-bold">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>GEMINI NATURAL LANGUAGE ADVISORY EXPLAINER</span>
            {advisory.isAiAvailable && <span className="text-[10px] bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-300">AI ACTIVE</span>}
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">{advisory.naturalLanguageExplanation}</p>
        </div>
      )}

      {/* Priority Action Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab("urgent")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold ${
            activeTab === "urgent" ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : "text-slate-400 hover:bg-slate-900"
          }`}
        >
          <AlertOctagon className="w-4 h-4" /> 🔴 URGENT ({plan?.urgent.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("attention")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold ${
            activeTab === "attention" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-400 hover:bg-slate-900"
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> 🟠 ATTENTION ({plan?.attention.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("routine")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold ${
            activeTab === "routine" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "text-slate-400 hover:bg-slate-900"
          }`}
        >
          <CheckCircle className="w-4 h-4" /> 🟢 ROUTINE ({plan?.routine.length || 0})
        </button>
      </div>

      {/* Action Plan Content Display */}
      <div className="space-y-4">
        {activeTab === "urgent" && plan?.urgent.length === 0 && (
          <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center font-mono text-xs text-slate-500">
            ✓ No urgent actions required today. Field parameters are safe.
          </div>
        )}

        {(activeTab === "urgent" ? plan?.urgent : activeTab === "attention" ? plan?.attention : plan?.routine)?.map((rec) => (
          <div key={rec.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                  {rec.condition}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{rec.action.title}</h3>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                Priority: {rec.priority}
              </span>
            </div>

            {/* Action Steps */}
            <div>
              <h4 className="text-xs font-mono text-slate-400 font-bold uppercase mb-2">Step-by-Step Instructions:</h4>
              <ul className="space-y-2 text-sm text-slate-200">
                {rec.action.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 text-xs font-mono flex items-center justify-center border border-emerald-800 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DO NOT Warnings */}
            {rec.doNot && rec.doNot.length > 0 && (
              <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/40">
                <h4 className="text-xs font-mono text-rose-400 font-bold uppercase mb-2 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" /> THINGS TO AVOID (DO NOT):
                </h4>
                <ul className="list-disc list-inside text-xs text-rose-200 space-y-1 font-mono">
                  {rec.doNot.map((item, idx) => (
                    <li key={idx}>❌ {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Evidence Chain & Verification Window */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-mono text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-bold block mb-1 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> Evidence Chain:
                </span>
                {rec.evidence.map((ev, i) => (
                  <div key={i} className="text-slate-300">
                    • {ev.parameter}: <strong className="text-white">{ev.value} {ev.unit}</strong> (Source: {ev.source}, Quality: {ev.quality})
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-bold block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Re-check Timeline & Target:
                </span>
                <div className="text-slate-300">
                  • Reassess in: <strong className="text-emerald-400">{rec.timing?.reassessAfterMinutes || 360} minutes</strong>
                  <br />• Expected Outcome: {rec.expectedOutcome || "Optimal parameter restoration"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
