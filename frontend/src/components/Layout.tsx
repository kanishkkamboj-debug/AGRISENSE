import React, { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X, Cpu, MapPin, Radio, Bell } from "lucide-react";
import { useIoTData } from "../hooks/useIoTData";

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { freshnessState, isConnected, dataAgeSeconds } = useIoTData();

  return (
    <div className="min-h-screen flex bg-[#060D08] text-slate-100 font-sans antialiased">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
        ></div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A120C]">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-[#08100A]/90 backdrop-blur-md border-b border-[#172B1C] px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-[#0E1E13] text-slate-300 hover:text-white border border-[#1C3622]"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">Field 01 — Punjab Plot</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline font-mono">30.901° N, 75.857° E</span>
            </div>
          </div>

          {/* Quick Header Actions & Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D1B11] border border-[#18331F] font-mono text-xs">
              <span className="text-slate-400">Data Age:</span>
              <strong className="text-emerald-400">{dataAgeSeconds}s</strong>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1B11] border border-[#18331F] font-mono text-xs">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`}></span>
              <span className="text-slate-200 font-bold uppercase">{freshnessState}</span>
            </div>
          </div>
        </header>

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#172B1C] py-4 text-center text-xs text-slate-500 font-mono bg-[#070E08]">
          AgriSense IoT Platform v1.0.0 — Zero Fabrication Policy | Evidence → Decision → Action → Verification
        </footer>
      </div>
    </div>
  );
};
