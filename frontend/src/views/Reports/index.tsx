import React from "react";
import { useIoTData } from "../../hooks/useIoTData";
import { Download, FileText, CheckCircle } from "lucide-react";

export const ReportsView: React.FC = () => {
  const { packetCount } = useIoTData();

  // Simulated timestamped SHI data points for line graph
  const dataPoints = [92, 93, 94.5, 91.2, 93.8, 95.1, 89.5, 92.4, 94.8, 94.1];
  const timestamps = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  const maxVal = 100;
  const minVal = 0;

  const svgPath = dataPoints
    .map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * 600;
      const y = 150 - ((val - minVal) / (maxVal - minVal)) * 120;
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-6 text-[#F0FDF4] font-sans">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Session Reports</h1>
          <p className="text-xs text-[#8E9B91] font-mono mt-1">View historical SHI trends and parameter breakdowns.</p>
        </div>

        <button className="px-5 py-2.5 rounded-xl bg-[#34D399] text-[#08120B] font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#34D399]/10 hover:bg-[#2DD4BF] transition-all font-mono">
          <Download className="w-4 h-4 stroke-[2.5]" /> Export Report
        </button>
      </div>

      {/* 4 Stat Cards (Matches Image 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-1">
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">AVERAGE SHI</span>
          <span className="text-3xl font-black text-[#34D399] block">94.1</span>
        </div>

        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-1">
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">PEAK TEMP</span>
          <span className="text-3xl font-black text-white block">26.8°C</span>
        </div>

        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-1">
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">TOTAL READINGS</span>
          <span className="text-3xl font-black text-white block">{packetCount > 0 ? packetCount : 12}</span>
        </div>

        <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-1">
          <span className="text-[10px] text-[#6B7C6F] font-bold uppercase tracking-wider block">ACTIVE ALERTS</span>
          <span className="text-3xl font-black text-white block">0</span>
        </div>
      </div>

      {/* SHI History Graph Container (Matches Image 4) */}
      <div className="bg-[#141A16] p-6 rounded-2xl border border-[#202922] shadow-sm space-y-6 font-mono">
        <div>
          <h3 className="text-sm font-bold text-white font-sans">SHI History</h3>
        </div>

        <div className="relative h-64 w-full bg-[#0E1310] rounded-xl border border-[#1B241D] p-6 flex flex-col justify-between overflow-hidden">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
            {/* Dotted Healthy Threshold Line at Y=60 */}
            <line x1="0" y1="72" x2="600" y2="72" stroke="#34D399" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.6" />
            <text x="300" y="65" fill="#34D399" fontSize="10" fontFamily="monospace" textAnchor="middle">Healthy Threshold</text>

            {/* Dotted Lower Warning Line at Y=40 */}
            <line x1="0" y1="108" x2="600" y2="108" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth="1" opacity="0.4" />

            {/* Smooth Neon Green SHI Line */}
            <path d={svgPath} fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {dataPoints.map((val, idx) => {
              const x = (idx / (dataPoints.length - 1)) * 600;
              const y = 150 - ((val - minVal) / (maxVal - minVal)) * 120;
              return <circle key={idx} cx={x} cy={y} r="4" fill="#34D399" stroke="#0E1310" strokeWidth="2" />;
            })}
          </svg>

          {/* X-Axis Timestamps */}
          <div className="flex justify-between text-[10px] text-[#6B7C6F] pt-4 border-t border-[#1A231C]">
            {timestamps.map((ts, i) => (
              <span key={i}>{ts}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
