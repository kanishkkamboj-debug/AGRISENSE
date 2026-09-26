import React from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { Sprout, AlertTriangle, CloudRain, CheckCircle, Sparkles } from "lucide-react";

export const AdvisoryView: React.FC = () => {
  const { activeFieldCondition, setActiveFieldCondition, selectedCrop } = useIoTData();

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
      description:
        "Field is in a healthy, productive state. Focus on maximizing yield through smart crop selection and balanced nutrient management.",
      indicators: [
        "Soil Moisture: 40–60%",
        "Rainfall: 10–30mm",
        "pH: 6.0–7.0",
      ],
      aiMethods: ["Crop Rotation", "Multi-Cropping", "Optimized Fertilizer Use"],
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
      description:
        "Critical moisture deficit. Immediate water conservation strategies and drought-tolerant crop varieties are required.",
      indicators: [
        "Soil Moisture: < 30%",
        "Rainfall: < 5mm",
        "Temperature: > 30°C",
      ],
      aiMethods: ["Drip Irrigation", "Drought-Resistant Crops"],
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
      description:
        "Excess water is causing or risking waterlogging. Drainage action and flood-tolerant varieties must be deployed immediately.",
      indicators: [
        "Soil Moisture: > 80%",
        "Rainfall: > 45mm",
        "Waterlogging risk",
      ],
      aiMethods: ["Raised Beds", "Drainage Channels"],
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4 text-[#F0FDF4] font-sans">
      {/* Page Title & Subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Select Field Condition Mode
        </h1>
        <p className="text-xs sm:text-sm text-[#8E9B91] font-mono max-w-2xl mx-auto">
          Choose the active field environmental state for target crop: <strong className="text-[#34D399]">{selectedCrop?.name || "Wheat"}</strong>. The AI advisory engine will adjust recommendations accordingly.
        </p>
      </div>

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
                    Field Indicators
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
                    {st.aiMethods.map((mth, idx) => (
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
          <Sparkles className="w-4 h-4 fill-current" /> Active Condition Locked: {activeFieldCondition}
        </button>
      </div>
    </div>
  );
};
