import React, { useState, useEffect } from "react";
import { fetchSettings, updateSettings } from "../../services/api";
import { useIoTData } from "../../hooks/useIoTData";
import { Settings, Save, CheckCircle, Database, ShieldCheck, Radio } from "lucide-react";

export const SettingsView: React.FC = () => {
  const { selectedCropId, setSelectedCropId, cropsList } = useIoTData();
  const [projectName, setProjectName] = useState("AgriSense AI Platform");
  const [farmName, setFarmName] = useState("Punjab Demonstration Field 01");
  const [defaultCrop, setDefaultCrop] = useState("wheat");
  const [units, setUnits] = useState("METRIC");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchSettings();
      if (data) {
        if (data.projectName) setProjectName(data.projectName);
        if (data.farmName) setFarmName(data.farmName);
        if (data.defaultCrop) setDefaultCrop(data.defaultCrop);
        if (data.units) setUnits(data.units);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const success = await updateSettings({
      projectName,
      farmName,
      defaultCrop,
      units,
    });
    setLoading(false);
    if (success) {
      if (defaultCrop && defaultCrop !== selectedCropId) {
        setSelectedCropId(defaultCrop);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 text-[#F0FDF4] font-sans">
      {/* Header */}
      <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 tracking-tight">
            <Settings className="w-7 h-7 text-[#34D399]" /> Platform & Application Settings
          </h1>
          <p className="text-xs text-[#8E9B91] font-mono mt-1">
            Persisted System Profile, Measurement Units & Sensor Node Configurations (Saved directly to MongoDB)
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-[#34D399] hover:bg-[#2DD4BF] text-[#08120B] font-extrabold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-[#34D399]/10 disabled:opacity-50"
        >
          {saved ? <CheckCircle className="w-4 h-4 text-[#08120B]" /> : <Save className="w-4 h-4" />}
          {saved ? "Settings Saved to DB!" : loading ? "Saving..." : "Save Application Settings"}
        </button>
      </div>

      {/* Settings Form */}
      <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-6 max-w-3xl">
        <h3 className="text-base font-bold text-white border-b border-[#202922] pb-3">Project Profile Configuration</h3>

        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-[#8E9B91] font-bold block mb-1">Project Name:</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-3 bg-[#0F1411] border border-[#1F2922] rounded-xl text-white focus:outline-none focus:border-[#34D399]"
            />
          </div>

          <div>
            <label className="text-[#8E9B91] font-bold block mb-1">Farm / Field Display Name:</label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full p-3 bg-[#0F1411] border border-[#1F2922] rounded-xl text-white focus:outline-none focus:border-[#34D399]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#8E9B91] font-bold block mb-1">Default Crop Selection:</label>
              <select
                value={defaultCrop}
                onChange={(e) => setDefaultCrop(e.target.value)}
                className="w-full p-3 bg-[#0F1411] border border-[#1F2922] rounded-xl text-white focus:outline-none focus:border-[#34D399]"
              >
                {cropsList.length > 0 ? (
                  cropsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.scientificName})
                    </option>
                  ))
                ) : (
                  <option value="wheat">Wheat (Triticum aestivum)</option>
                )}
              </select>
            </div>

            <div>
              <label className="text-[#8E9B91] font-bold block mb-1">Measurement Units:</label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full p-3 bg-[#0F1411] border border-[#1F2922] rounded-xl text-white focus:outline-none focus:border-[#34D399]"
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
