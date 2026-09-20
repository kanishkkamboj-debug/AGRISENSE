import React from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { Sprout, AlertTriangle, CloudRain, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";

export const AdvisoryView: React.FC = () => {
  const { activeFieldCondition, setActiveFieldCondition } = useIoTData();

  const states = [
    {
      id: "Normal" as const,
      title: "Normal",
      subtitle: "Optimal soil conditions",
      icon: Sprout,
      bg: "bg-[#EAF7EE]",
      border: "border-emerald-300",
      activeBorder: "ring-4 ring-emerald-600/40 border-emerald-600",
      badgeBg: "bg-emerald-100 text-emerald-800",
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
      bg: "bg-[#FEF6E6]",
      border: "border-amber-300",
      activeBorder: "ring-4 ring-amber-600/40 border-amber-600",
      badgeBg: "bg-amber-100 text-amber-900",
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
      bg: "bg-[#EBF3FE]",
      border: "border-blue-300",
      activeBorder: "ring-4 ring-blue-600/40 border-blue-600",
      badgeBg: "bg-blue-100 text-blue-900",
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
    <div className="space-y-8 max-w-6xl mx-auto py-4 text-slate-800 font-sans">
      {/* Page Title & Subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
          Select Field Condition
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-mono max-w-2xl mx-auto">
          Choose the current state of your field. The AI engine will lock into this mode and generate targeted recommendations.
        </p>
      </div>

      {/* 3 Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {states.map((st) => {
          const Icon = st.icon;
          const isSelected = activeFieldCondition === st.id;

          return (
            <div
              key={st.id}
              onClick={() => setActiveFieldCondition(st.id)}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer shadow-sm flex flex-col justify-between space-y-6 ${st.bg} ${st.border} ${
                isSelected ? st.activeBorder : "hover:scale-[1.01] hover:shadow-md"
              }`}
            >
              <div className="space-y-4">
                {/* Icon & Title */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-white shadow-sm">
                    <Icon className="w-8 h-8 text-slate-800" />
                  </div>
                  {isSelected && (
                    <span className="px-3 py-1 rounded-full bg-[#1B4332] text-white font-mono text-xs font-bold flex items-center gap-1 shadow">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> LOCKED
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{st.title}</h2>
                  <p className="text-xs font-mono text-slate-500">{st.subtitle}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{st.description}</p>

                {/* Field Indicators */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                    Field Indicators
                  </span>
                  <ul className="space-y-1 font-mono text-xs text-slate-700">
                    {st.indicators.map((ind, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Methods */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                    AI Methods
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
      <div className="flex justify-center pt-4">
        <button className="px-8 py-3.5 rounded-2xl bg-[#1B4332] text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-[#143326] transition-all font-mono">
          <Sparkles className="w-4 h-4 text-emerald-400" /> Active Mode Locked: {activeFieldCondition}
        </button>
      </div>
    </div>
  );
};
