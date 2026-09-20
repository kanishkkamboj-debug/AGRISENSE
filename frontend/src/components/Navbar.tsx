import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Map, BarChart3, Sprout, FileText, Settings, ShieldAlert, Cpu } from "lucide-react";
import { useIoTData } from "../hooks/useIoTData";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { freshnessState, dataMode, isConnected } = useIoTData();

  const navItems = [
    { label: "Dashboard", path: "/", icon: Activity },
    { label: "Daily Action Plan", path: "/advisory", icon: ShieldAlert },
    { label: "GIS Farm Map", path: "/gis", icon: Map },
    { label: "Crops", path: "/crops", icon: Sprout },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Reports", path: "/reports", icon: FileText },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                AGRISENSE <span className="text-emerald-400 text-xs font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">IoT</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">Agricultural Intelligence Platform</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* System Telemetry Mode Badges */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {dataMode === "MOCK" && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                DEMO / MOCK DATA
              </span>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`}></span>
              <span className="text-slate-300 uppercase font-bold tracking-wider">{freshnessState}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
