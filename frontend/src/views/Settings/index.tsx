import React, { useState } from "react";
import { Settings, Save, CheckCircle, Database } from "lucide-react";

export const SettingsView: React.FC = () => {
  const [projectName, setProjectName] = useState("AgriSense IoT Platform");
  const [farmName, setFarmName] = useState("Punjab Experimental Plot 01");
  const [defaultCrop, setDefaultCrop] = useState("wheat");
  const [units, setUnits] = useState("METRIC");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-400" /> Platform & Application Settings
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Project Profile, Display Preferences & Data Management (No User Accounts Required)
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50"
        >
          {saved ? <CheckCircle className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          {saved ? "Settings Saved!" : "Save Application Settings"}
        </button>
      </div>

      {/* Settings Form */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6 max-w-3xl">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Project Profile Configuration</h3>

        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-slate-400 font-bold block mb-1">Project Name:</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-bold block mb-1">Farm / Field Display Name:</label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Default Crop Selection:</label>
              <select
                value={defaultCrop}
                onChange={(e) => setDefaultCrop(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="wheat">Wheat (Triticum aestivum)</option>
                <option value="rice">Rice / Paddy (Oryza sativa)</option>
                <option value="maize">Maize / Corn (Zea mays)</option>
                <option value="cotton">Cotton (Bt Cotton)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Measurement Units:</label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="METRIC">Metric (°C, mm, Hectares)</option>
                <option value="IMPERIAL">Imperial (°F, inches, Acres)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
