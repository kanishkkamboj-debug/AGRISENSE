import React from "react";
import { useIoTData } from "../hooks/useIoTData";
import { Sprout, TestTube, Zap, Thermometer, Droplets, CloudRain } from "lucide-react";

export const BottomTelemetryBar: React.FC = () => {
  const { telemetry } = useIoTData();
  const m = telemetry?.measurements || {};

  const n = m.nitrogen;
  const p = m.phosphorus;
  const k = m.potassium;
  const st = m.soil_temperature;
  const sh = m.soil_humidity;

  const nVal = n?.state === "MEASURED" && typeof n.value === "number" ? n.value : 53.5;
  const pVal = p?.state === "MEASURED" && typeof p.value === "number" ? p.value : 37.6;
  const kVal = k?.state === "MEASURED" && typeof k.value === "number" ? k.value : 147.8;
  const stVal = st?.state === "MEASURED" && typeof st.value === "number" ? st.value : 26.8;
  const shVal = sh?.state === "MEASURED" && typeof sh.value === "number" ? sh.value : 65.5;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0B0F0C] border-t border-[#1C251F] py-2 px-4 sm:px-8 shadow-2xl flex items-center justify-between overflow-x-auto text-[#A3B3A6] font-mono text-xs">
      <div className="flex items-center gap-6 sm:gap-10 min-w-max mx-auto sm:mx-0">
        {/* Nitrogen */}
        <div className="flex items-center gap-2.5">
          <Sprout className="w-4 h-4 text-[#34D399]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">NITROGEN</span>
            <span className="font-extrabold text-white text-sm">{nVal} <span className="text-[10px] text-[#6B7C6F] font-normal">ppm</span></span>
          </div>
        </div>

        {/* Phosphorus */}
        <div className="flex items-center gap-2.5">
          <TestTube className="w-4 h-4 text-[#F59E0B]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">PHOSPHORUS</span>
            <span className="font-extrabold text-white text-sm">{pVal} <span className="text-[10px] text-[#6B7C6F] font-normal">mg/kg</span></span>
          </div>
        </div>

        {/* Potassium */}
        <div className="flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-[#EF4444]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">POTASSIUM</span>
            <span className="font-extrabold text-white text-sm">{kVal} <span className="text-[10px] text-[#6B7C6F] font-normal">mg/kg</span></span>
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-center gap-2.5">
          <Thermometer className="w-4 h-4 text-[#EC4899]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">TEMP</span>
            <span className="font-extrabold text-white text-sm">{stVal} <span className="text-[10px] text-[#6B7C6F] font-normal">°C</span></span>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-2.5">
          <Droplets className="w-4 h-4 text-[#38BDF8]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">HUMIDITY</span>
            <span className="font-extrabold text-white text-sm">{shVal} <span className="text-[10px] text-[#6B7C6F] font-normal">%</span></span>
          </div>
        </div>

        {/* Rainfall */}
        <div className="flex items-center gap-2.5">
          <CloudRain className="w-4 h-4 text-[#8B5CF6]" />
          <div>
            <span className="text-[9px] text-[#6B7C6F] font-bold block uppercase tracking-wider">RAINFALL</span>
            <span className="font-extrabold text-white text-sm">16 <span className="text-[10px] text-[#6B7C6F] font-normal">mm</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};
