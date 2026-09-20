import React, { useEffect, useState } from "react";
import { fetchCrops } from "../../services/api";
import { CropProfile } from "../../../../shared/types/agriculture";
import { Sprout, Search, Thermometer, Droplets, TestTube, AlertTriangle } from "lucide-react";

export const CropsView: React.FC = () => {
  const [crops, setCrops] = useState<CropProfile[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropProfile | null>(null);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    async function load() {
      const data = await fetchCrops();
      setCrops(data);
      if (data.length > 0) setSelectedCrop(data[0]);
    }
    load();
  }, []);

  const filteredCrops = crops.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.scientificName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-400" /> 20 Crop Intelligence Profiles & Stage Manager
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Crop-Specific Soil, Moisture, Temperature, NPK & Growth Stage Requirements
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search crops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 w-64"
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crop Selector List */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl max-h-[600px] overflow-y-auto space-y-2">
          {filteredCrops.map((crop) => (
            <div
              key={crop.id}
              onClick={() => setSelectedCrop(crop)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                selectedCrop?.id === crop.id
                  ? "bg-emerald-950/40 border-emerald-500 text-white"
                  : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{crop.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
                  {crop.category}
                </span>
              </div>
              <p className="text-xs italic text-slate-500 font-serif mt-0.5">{crop.scientificName}</p>
            </div>
          ))}
        </div>

        {/* Detailed Selected Crop Profile */}
        {selectedCrop && (
          <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase">{selectedCrop.category}</span>
                <h2 className="text-2xl font-extrabold text-white">{selectedCrop.name}</h2>
                <p className="text-xs italic text-slate-400 font-serif">{selectedCrop.scientificName}</p>
              </div>
              {selectedCrop.varieties && (
                <div className="text-right font-mono text-xs text-slate-400">
                  <span className="text-slate-500 block">Varieties:</span>
                  {selectedCrop.varieties.join(", ")}
                </div>
              )}
            </div>

            {/* Parameter Threshold Cards */}
            <div className="grid grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-bold flex items-center gap-1.5 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" /> Soil Moisture
                </span>
                <span className="text-lg font-bold text-white">
                  {selectedCrop.soil.moisture.min}% - {selectedCrop.soil.moisture.max}%
                </span>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-bold flex items-center gap-1.5 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Temperature
                </span>
                <span className="text-lg font-bold text-white">
                  {selectedCrop.temperature.min}°C - {selectedCrop.temperature.max}°C
                </span>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-bold flex items-center gap-1.5 mb-1">
                  <TestTube className="w-3.5 h-3.5 text-emerald-400" /> Preferred pH
                </span>
                <span className="text-lg font-bold text-white">
                  {selectedCrop.soil.preferredPH.min} - {selectedCrop.soil.preferredPH.max}
                </span>
              </div>
            </div>

            {/* Growth Stages Timeline */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-3 font-mono">GROWTH STAGES & WATER REQUIREMENTS</h3>
              <div className="space-y-3 font-mono text-xs">
                {selectedCrop.growthStages.map((stg) => (
                  <div key={stg.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{stg.name}</span>
                      <p className="text-slate-400 text-xs mt-0.5">Duration: {stg.durationDays} days</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sky-400 font-bold">{stg.waterRequirementMmDay} mm/day</span>
                      <p className="text-slate-500 text-[11px]">Drought Risk: {stg.stressSensitivities.drought}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disease & Pest Risks */}
            <div className="grid grid-cols-2 gap-4 font-mono text-xs pt-2">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold block mb-1">Pest Risks:</span>
                <p className="text-slate-300">{selectedCrop.pestRisks?.join(", ") || "None recorded"}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold block mb-1">Disease Risks:</span>
                <p className="text-slate-300">{selectedCrop.diseaseRisks?.join(", ") || "None recorded"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
