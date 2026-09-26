import React, { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { BottomTelemetryBar } from "./BottomTelemetryBar";
import { Menu, X, Download, Bell, Settings, Cpu, ShieldCheck } from "lucide-react";
import { useIoTData } from "../hooks/useIoTData";
import { analyzeTelemetryAgainstCrop } from "../utils/agronomy";
import { Link, useLocation } from "react-router-dom";

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { activeFieldCondition, systemMode, setSystemMode, telemetry, freshnessState, selectedCrop, dataAgeSeconds } = useIoTData();

  const analysis = analyzeTelemetryAgainstCrop(telemetry, selectedCrop, undefined, systemMode);
  const isLive = systemMode === "SIMULATION" || freshnessState === "LIVE" || freshnessState === "RECENT";

  const getBadgeStyle = () => {
    if (systemMode === "SIMULATION") {
      return "bg-amber-950/60 text-amber-400 border-amber-800/60 hover:bg-amber-900/60";
    }
    if (freshnessState === "LIVE" || freshnessState === "RECENT") {
      return "bg-[#14261B] text-[#34D399] border-[#24452F] hover:bg-[#1C3627]";
    }
    if (freshnessState === "STALE") {
      return "bg-amber-950/80 text-amber-300 border-amber-800 hover:bg-amber-900";
    }
    return "bg-red-950/80 text-red-300 border-red-800 hover:bg-red-900";
  };

  const getBadgeLabel = () => {
    if (systemMode === "SIMULATION") return "🧪 SIMULATION MODE";
    if (freshnessState === "LIVE" || freshnessState === "RECENT") return `🌐 REAL IoT MODE (Live Sensors • ${dataAgeSeconds}s ago)`;
    if (freshnessState === "STALE") return `⚠️ REAL IoT MODE (Telemetry Stale • ${dataAgeSeconds}s ago)`;
    if (freshnessState === "OFFLINE") return `🔴 REAL IoT MODE (Device Offline • ${dataAgeSeconds}s ago)`;
    return "⚪ REAL IoT MODE (Waiting for Hardware)";
  };

  return (
    <div className="min-h-screen flex bg-[#0F1411] text-[#F0FDF4] font-sans antialiased selection:bg-[#34D399] selection:text-slate-950 pb-16">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
        ></div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0F1411]">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-[#121814]/90 backdrop-blur-md border-b border-[#1E2821] px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-[#18211B] text-[#9EB1A3] hover:text-white border border-[#26352B]"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-1 text-lg font-extrabold tracking-tight text-white">
              Agri-<span className="text-[#34D399] font-black">GISIntelligence</span>
            </Link>

            {/* System Mode & Device Status Switcher Pill */}
            <button
              onClick={() => setSystemMode(systemMode === "REAL_IOT" ? "SIMULATION" : "REAL_IOT")}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-extrabold border transition-all shadow-sm ${getBadgeStyle()}`}
              title="Click to toggle system calculation mode"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{getBadgeLabel()}</span>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="hidden sm:block text-[#6B7C6F] font-semibold">
              SHI:{" "}
              <strong className={isLive && analysis.shiScore !== null ? "text-[#34D399]" : "text-slate-400"}>
                {isLive && analysis.shiScore !== null ? `${analysis.shiScore}` : "UNAVAILABLE"}
              </strong>{" "}
              · {isLive ? activeFieldCondition : "DEVICE OFFLINE"}
            </div>

            <Link
              to="/reports"
              className="px-4 py-2 rounded-xl bg-[#34D399] text-[#08120B] font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-[#34D399]/10 hover:bg-[#2DD4BF] transition-all"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" /> Export Data
            </Link>

            <div className="flex items-center gap-2 text-[#6B7C6F] border-l border-[#1E2821] pl-3">
              <Link to="/settings" className="p-1.5 rounded-lg hover:bg-[#18211B] hover:text-white">
                <Settings className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#18211B] border border-[#26352B] text-white font-sans text-xs font-bold">
                <span className="w-6 h-6 rounded-full bg-[#34D399] text-[#08120B] flex items-center justify-center text-[10px] font-black">KK</span>
                <span className="hidden sm:inline">Kanishk</span>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Persistent Bottom Telemetry Bar */}
      <BottomTelemetryBar />
    </div>
  );
};
