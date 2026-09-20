import React from "react";
import { FileText, Download, CheckCircle, Database } from "lucide-react";

export const ReportsView: React.FC = () => {
  const handleDownloadCsv = () => {
    window.open("/api/v1/public/reports/export-csv?fieldId=FIELD-PUNJAB-01", "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" /> Agronomic Reports & Stored Data Exporter
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            CSV Export Generated Directly From Stored Database Telemetry (Zero Synthetic Data)
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50"
        >
          <Download className="w-4 h-4" /> Download Telemetry CSV Report
        </button>
      </div>

      {/* Report Summary Card */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-white">Report Summary Specification</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-500 font-bold block mb-1">INCLUDED PARAMETERS</span>
            <p className="text-slate-300">• Field ID: FIELD-PUNJAB-01</p>
            <p className="text-slate-300">• Crop: Wheat (Triticum aestivum)</p>
            <p className="text-slate-300">• Soil Moisture, Temperature, Humidity, pH</p>
            <p className="text-slate-300">• NPK Status ("No sensor data" if unequipped)</p>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-500 font-bold block mb-1">DATA AUDITABILITY & INTEGRITY</span>
            <p className="text-slate-300">• Data Quality Flags: VALID / STALE / MISSING</p>
            <p className="text-slate-300">• ISO Timestamps & Ingestion ACK IDs</p>
            <p className="text-slate-300">• Data Mode: REAL / MOCK explicitly tagged</p>
          </div>
        </div>
      </div>
    </div>
  );
};
