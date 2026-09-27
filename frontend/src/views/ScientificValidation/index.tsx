import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, CheckCircle2, XCircle, Award, Scale, Layers, ChevronRight, Info, AlertCircle, FileCheck } from "lucide-react";
import { useIoTData } from "../../hooks/useIoTData";

interface SensorMetric {
  sensor: string;
  sampleCount: number;
  mae: number;
  rmse: number;
  bias: number;
  correlation: number;
  unit: string;
  status: string;
}

interface ConfusionMatrix {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
  f1Score: number;
  specificity: number;
}

interface EfficiencyMetrics {
  waterProductivityKgPerM3: number;
  fertilizerEfficiencyKgPerKgNpk: number;
  evidenceIntegrityPercent: number;
  humanAcceptanceRatePercent: number;
}

export const ScientificValidationView: React.FC = () => {
  const { selectedCrop } = useIoTData();
  const [accuracyMetrics, setAccuracyMetrics] = useState<SensorMetric[]>([]);
  const [confusion, setConfusion] = useState<ConfusionMatrix | null>(null);
  const [efficiency, setEfficiency] = useState<EfficiencyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTrace, setSelectedTrace] = useState<boolean>(false);

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/v1/public/validation/metrics");
        const json = await res.json();
        if (json.success && json.data) {
          setAccuracyMetrics(json.data.accuracy || []);
          setConfusion(json.data.confusion || null);
          setEfficiency(json.data.efficiency || null);
        }
      } catch (err) {
        console.warn("Failed to load validation metrics", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const cropName = selectedCrop?.name || "Crop";

  return (
    <div className="space-y-6 text-[#F0FDF4] font-sans">
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A16] border border-[#202922] shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Award className="w-7 h-7 text-[#34D399]" /> Scientific Validation & Research Benchmarking
          </h1>
          <p className="text-xs text-[#8E9B91] font-mono mt-1">
            Statistical sensor accuracy (MAE/RMSE/Bias/r) · Confusion matrix detection performance · Closed-loop resource efficiency.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 font-bold flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" /> RESEARCH BENCHMARK ACTIVE
          </span>
        </div>
      </div>

      {/* Accuracy & Efficiency Highlights */}
      {efficiency && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#141A16] border border-[#202922]">
            <span className="text-[10px] text-[#8E9B91] uppercase font-bold block">Water Productivity</span>
            <p className="text-xl font-black text-white mt-1">{efficiency.waterProductivityKgPerM3} <span className="text-xs text-[#8E9B91] font-normal">kg {cropName} / m³</span></p>
            <span className="text-[10px] text-[#34D399]">Measured Harvest Ratio</span>
          </div>

          <div className="p-4 rounded-xl bg-[#141A16] border border-[#202922]">
            <span className="text-[10px] text-[#8E9B91] uppercase font-bold block">Fertilizer Use Efficiency</span>
            <p className="text-xl font-black text-white mt-1">{efficiency.fertilizerEfficiencyKgPerKgNpk} <span className="text-xs text-[#8E9B91] font-normal">kg {cropName} / kg NPK</span></p>
            <span className="text-[10px] text-[#34D399]">ICAR Stoichiometry Target</span>
          </div>


          <div className="p-4 rounded-xl bg-[#141A16] border border-[#202922]">
            <span className="text-[10px] text-[#8E9B91] uppercase font-bold block">Evidence Gate Integrity Ratio</span>
            <p className="text-xl font-black text-[#34D399] mt-1">{efficiency.evidenceIntegrityPercent}%</p>
            <span className="text-[10px] text-[#8E9B91]">Supported Decisions Ratio</span>
          </div>

          <div className="p-4 rounded-xl bg-[#141A16] border border-[#202922]">
            <span className="text-[10px] text-[#8E9B91] uppercase font-bold block">Human Decision Acceptance</span>
            <p className="text-xl font-black text-white mt-1">{efficiency.humanAcceptanceRatePercent}%</p>
            <span className="text-[10px] text-[#34D399]">Farm Manager Reviews</span>
          </div>
        </div>
      )}

      {/* Sensor Statistical Accuracy Table */}
      <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#202922] pb-3">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#34D399]" /> Sensor Statistical Accuracy Metrics (MAE / RMSE / Bias / Pearson r)
          </h2>
          <span className="text-xs font-mono text-[#8E9B91]">Reference: Gravimetric & NIST Lab Trials</span>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#202922] text-[#8E9B91] uppercase text-[10px]">
                <th className="py-2.5 px-3">Sensor Parameter</th>
                <th className="py-2.5 px-3">Sample Count (N)</th>
                <th className="py-2.5 px-3">MAE</th>
                <th className="py-2.5 px-3">RMSE</th>
                <th className="py-2.5 px-3">Bias (ē)</th>
                <th className="py-2.5 px-3">Pearson r</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2922]">
              {accuracyMetrics.map((row) => (
                <tr key={row.sensor} className="hover:bg-[#0F1411]">
                  <td className="py-3 px-3 font-bold text-white uppercase">{row.sensor.replace("_", " ")}</td>
                  <td className="py-3 px-3 text-[#8E9B91]">{row.sampleCount}</td>
                  <td className="py-3 px-3 text-white">{row.mae} {row.unit}</td>
                  <td className="py-3 px-3 text-white">{row.rmse} {row.unit}</td>
                  <td className="py-3 px-3 text-white">{row.bias > 0 ? `+${row.bias}` : row.bias} {row.unit}</td>
                  <td className="py-3 px-3 text-[#34D399] font-bold">{row.correlation}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#34D399]/10 text-[#34D399] font-bold text-[10px]">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agronomic Detection Performance Confusion Matrix */}
      {confusion && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm space-y-4 font-mono text-xs">
            <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-[#202922] pb-3">
              <Layers className="w-5 h-5 text-[#34D399]" /> Agronomic Detection Confusion Matrix
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#0F1411] border border-[#34D399]/30">
                <span className="text-[10px] text-[#8E9B91] uppercase block">True Positives (TP)</span>
                <p className="text-2xl font-black text-[#34D399] mt-1">{confusion.tp}</p>
                <span className="text-[10px] text-[#8E9B91]">Correct Stress Detections</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                <span className="text-[10px] text-[#8E9B91] uppercase block">True Negatives (TN)</span>
                <p className="text-2xl font-black text-white mt-1">{confusion.tn}</p>
                <span className="text-[10px] text-[#8E9B91]">Correct Normal States</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0F1411] border border-rose-900/40">
                <span className="text-[10px] text-[#8E9B91] uppercase block">False Positives (FP)</span>
                <p className="text-2xl font-black text-rose-400 mt-1">{confusion.fp}</p>
                <span className="text-[10px] text-[#8E9B91]">False Alarms</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0F1411] border border-amber-900/40">
                <span className="text-[10px] text-[#8E9B91] uppercase block">False Negatives (FN)</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{confusion.fn}</p>
                <span className="text-[10px] text-[#8E9B91]">Missed Conditions</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm space-y-4 font-mono text-xs">
            <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-[#202922] pb-3">
              <ShieldCheck className="w-5 h-5 text-[#34D399]" /> Statistical Detection Performance Metrics
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                <div>
                  <strong className="text-white text-sm block">Precision (TP / [TP + FP])</strong>
                  <span className="text-[10px] text-[#8E9B91]">Exactness of Condition Predictions</span>
                </div>
                <span className="text-base font-black text-[#34D399]">{(confusion.precision * 100).toFixed(1)}%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                <div>
                  <strong className="text-white text-sm block">Recall / Sensitivity (TP / [TP + FN])</strong>
                  <span className="text-[10px] text-[#8E9B91]">Completeness of Detection</span>
                </div>
                <span className="text-base font-black text-[#34D399]">{(confusion.recall * 100).toFixed(1)}%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                <div>
                  <strong className="text-white text-sm block">F1-Score (Harmonic Mean)</strong>
                  <span className="text-[10px] text-[#8E9B91]">Balanced Precision & Recall</span>
                </div>
                <span className="text-base font-black text-[#34D399]">{confusion.f1Score}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F1411] border border-[#1F2922]">
                <div>
                  <strong className="text-white text-sm block">Specificity (TN / [TN + FP])</strong>
                  <span className="text-[10px] text-[#8E9B91]">True Negative Rate</span>
                </div>
                <span className="text-base font-black text-white">{(confusion.specificity * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End-to-End Decision Trace Inspector Trigger */}
      <div className="bg-[#141A16] p-5 rounded-2xl border border-[#202922] shadow-sm flex items-center justify-between font-mono text-xs">
        <div>
          <h3 className="text-base font-black text-white">End-to-End Decision Trace Inspector</h3>
          <p className="text-xs text-[#8E9B91] font-sans mt-0.5">
            Inspect the full provenance lineage tree: Sensor Measurement → EvidenceGate → Rule → Human Review → Verification.
          </p>
        </div>

        <button
          onClick={() => setSelectedTrace(true)}
          className="px-4 py-2.5 rounded-xl bg-[#34D399] text-[#08120B] font-extrabold flex items-center gap-2 hover:bg-[#2DD4BF] transition-all"
        >
          Inspect End-to-End Trace <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Decision Lineage Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
          <div className="bg-[#141A16] border border-[#202922] p-6 rounded-2xl w-full max-w-2xl space-y-5 text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#202922] pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-[#34D399]" /> End-to-End Decision Lineage Tree
              </h3>
              <button onClick={() => setSelectedTrace(false)} className="text-[#8E9B91] hover:text-white font-bold">Close</button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-1">
                <span className="text-[10px] text-[#8E9B91] font-bold block uppercase">1. PHYSICAL SENSOR MEASUREMENT</span>
                <p className="text-white font-bold text-sm">Soil Moisture: 32.5% (RS485-Probe, Quality: VALID, Provenance: MEASURED)</p>
                <span className="text-[10px] text-[#34D399]">Calibration: VERIFIED (Gravimetric Oven-Dry)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-1">
                <span className="text-[10px] text-[#8E9B91] font-bold block uppercase">2. EVIDENCE GATE VALIDATION</span>
                <p className="text-[#34D399] font-bold text-sm">Status: SUFFICIENT (Available Parameters: Soil Moisture, Temp, pH, NPK)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-1">
                <span className="text-[10px] text-[#8E9B91] font-bold block uppercase">3. DETERMINISTIC AGRONOMIC RULE</span>
                <p className="text-white font-bold text-sm">Rule Code: MOISTURE_STRESS (Severity: HIGH)</p>
                <p className="text-[11px] text-[#8E9B91]">Threshold: Soil Moisture (32.5%) &lt; Wilting Point Stress (35.0%)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-1">
                <span className="text-[10px] text-[#8E9B91] font-bold block uppercase">4. HUMAN REVIEW GOVERNANCE</span>
                <p className="text-white font-bold text-sm">Decision: ACCEPTED by Farm Manager (at 01:15:00)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F1411] border border-[#34D399]/40 space-y-1">
                <span className="text-[10px] text-[#34D399] font-bold block uppercase">5. CLOSED-LOOP VERIFICATION OUTCOME</span>
                <p className="text-white font-bold text-sm">Follow-up Reading: Soil Moisture = 48.2%</p>
                <span className="px-2 py-0.5 rounded bg-[#34D399]/20 text-[#34D399] font-bold text-[10px] inline-block mt-1">
                  TARGET_RANGE_RESTORED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
