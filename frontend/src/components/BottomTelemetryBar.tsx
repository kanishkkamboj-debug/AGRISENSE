import React from "react";
import { useIoTData } from "../hooks/useIoTData";
import { Sprout, TestTube, Zap, Thermometer, Droplets, CloudRain } from "lucide-react";

export const BottomTelemetryBar: React.FC = () => {
  const { telemetry, freshnessState, systemMode } = useIoTData();
  const isLive = systemMode === "SIMULATION" || freshnessState === "LIVE" || freshnessState === "RECENT";

  const m = isLive ? telemetry?.measurements || {} : {};

  const getMeasText = (paramKey: string, unit: string) => {
    const meas = (m as any)[paramKey];
    if (isLive && meas && typeof meas.value === "number") {
      return (
        <span className="font-extrabold text-white text-sm">
          {meas.value} <span className="text-[10px] text-[#6B7C6F] font-normal">{unit}</span>
        </span>
      );
    }
    return <span className="font-bold text-[#8E9B91] text-xs">UNAVAILABLE</span>;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0B0F0C] border-t border-[#1C251F] py-2.5 px-4 sm:px-8 shadow-2xl flex items-center justify-between overflow-x-auto text-[#A3B3A6] font-mono text-xs">
      <div className="flex items-center gap-6 sm:gap-10 min-w-max mx-auto sm:mx-0">
        {/* Nitrogen */}
        <div className="flex items-center gap-2.5">
          <Sprout className="w-4 h-4 text-[#34D399]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">NITROGEN</span>
            {getMeasText("nitrogen", "ppm")}
          </div>
        </div>

        {/* Phosphorus */}
        <div className="flex items-center gap-2.5">
          <TestTube className="w-4 h-4 text-[#F59E0B]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">PHOSPHORUS</span>
            {getMeasText("phosphorus", "mg/kg")}
          </div>
        </div>

        {/* Potassium */}
        <div className="flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-[#EF4444]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">POTASSIUM</span>
            {getMeasText("potassium", "mg/kg")}
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-center gap-2.5">
          <Thermometer className="w-4 h-4 text-[#EC4899]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">TEMP</span>
            {getMeasText("soil_temperature", "°C")}
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-2.5">
          <Droplets className="w-4 h-4 text-[#38BDF8]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">HUMIDITY</span>
            {getMeasText("ambient_humidity", "%")}
          </div>
        </div>

        {/* Rainfall */}
        <div className="flex items-center gap-2.5">
          <CloudRain className="w-4 h-4 text-[#8B5CF6]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">RAINFALL</span>
            {getMeasText("rainfall", "mm")}
          </div>
        </div>
      </div>
    </div>
  );
};
