import React from "react";
import { useIoTData } from "../hooks/useIoTData";
import { Sprout, ChevronDown, Check, Info } from "lucide-react";

export const CropSelector: React.FC = () => {
  const { cropsList, selectedCrop, selectedCropId, setSelectedCropId, selectedStageId, setSelectedStageId } = useIoTData();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  if (!cropsList || cropsList.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141A16] border border-[#202922] text-[#8E9B91] text-xs font-mono animate-pulse">
        <Sprout className="w-4 h-4 text-[#34D399]" />
        <span>Loading 20 Crop Knowledge Base...</span>
      </div>
    );
  }

  const activeStage = selectedCrop?.growthStages?.find((s) => s.id === selectedStageId) || selectedCrop?.growthStages?.[0];

  return (
    <div className="relative font-mono text-xs">
      <div className="flex flex-wrap items-center gap-2">
        {/* Main Crop Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#141A16] border border-[#202922] hover:border-[#34D399]/40 text-white font-bold transition-all shadow-sm group"
        >
          <div className="w-6 h-6 rounded-lg bg-[#34D399]/10 border border-[#34D399]/30 flex items-center justify-center text-[#34D399]">
            <Sprout className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-[#6B7C6F] uppercase font-bold block leading-none">CROP PROFILE</span>
            <span className="text-xs font-extrabold text-[#34D399] group-hover:text-white transition-colors">
              {selectedCrop ? selectedCrop.name : "Select Crop"}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#8E9B91] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Growth Stage Selector Pills */}
        {selectedCrop?.growthStages && selectedCrop.growthStages.length > 0 && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141A16] border border-[#202922] text-[11px]">
            {selectedCrop.growthStages.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStageId(st.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedStageId === st.id
                    ? "bg-[#34D399] text-[#08120B] shadow-sm shadow-[#34D399]/10"
                    : "text-[#8E9B91] hover:text-white hover:bg-[#1C251F]"
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown Modal Grid for 20 Crops */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-[480px] bg-[#141A16] border border-[#202922] rounded-2xl p-4 shadow-2xl z-50 space-y-3 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-[#202922]">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#34D399]" />
              <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Agronomic Knowledge Base ({cropsList.length} Crops)
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8E9B91]">Dynamic Requirements</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
            {cropsList.map((crop) => {
              const isSelected = crop.id === selectedCropId;
              return (
                <button
                  key={crop.id}
                  onClick={() => {
                    setSelectedCropId(crop.id);
                    if (crop.growthStages && crop.growthStages.length > 0) {
                      setSelectedStageId(crop.growthStages[0].id);
                    }
                    setIsOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all font-mono flex items-center justify-between ${
                    isSelected
                      ? "bg-[#34D399]/10 border-[#34D399] text-white shadow-sm"
                      : "bg-[#0F1411] border-[#1F2922] text-[#8E9B91] hover:border-[#34D399]/40 hover:text-white"
                  }`}
                >
                  <div className="truncate">
                    <span className="text-xs font-bold block truncate text-white">{crop.name}</span>
                    <span className="text-[9px] text-[#6B7C6F] block truncate italic">{crop.scientificName}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#34D399] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Active Crop Detail Summary Bar */}
          {selectedCrop && (
            <div className="p-3 rounded-xl bg-[#0F1411] border border-[#1F2922] font-mono text-[11px] space-y-1 text-[#8E9B91]">
              <div className="flex items-center justify-between text-white font-bold">
                <span>{selectedCrop.name} Specs ({selectedCrop.category})</span>
                <span className="text-[#34D399]">Opt Temp: {selectedCrop.temperature.optimal}°C</span>
              </div>
              <div className="flex justify-between text-[10px] pt-1">
                <span>Moisture: {selectedCrop.soil.moisture.min}–{selectedCrop.soil.moisture.max}%</span>
                <span>pH: {selectedCrop.soil.preferredPH.min}–{selectedCrop.soil.preferredPH.max}</span>
                <span>N-P-K: {selectedCrop.nutrients.n.optimal}-{selectedCrop.nutrients.p.optimal}-{selectedCrop.nutrients.k.optimal}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
