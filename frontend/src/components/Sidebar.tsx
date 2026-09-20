import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldAlert,
  Map,
  Sprout,
  BarChart3,
  FileText,
  Settings,
  Cpu,
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
} from "lucide-react";
import { useIoTData } from "../hooks/useIoTData";

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const { freshnessState, isConnected, sseConnected, packetCount, telemetry } = useIoTData();

  const navItems = [
    { label: "Overview", path: "/", icon: LayoutDashboard },
    { label: "Daily Action Plan", path: "/advisory", icon: ShieldAlert, badge: "AI Ready" },
    { label: "GIS Farm Map", path: "/gis", icon: Map },
    { label: "Crop Intelligence", path: "/crops", icon: Sprout },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Reports", path: "/reports", icon: FileText },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  const renderFreshnessBadge = () => {
    switch (freshnessState) {
      case "LIVE":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>● LIVE</span>
          </div>
        );
      case "RECENT":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 font-mono text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>RECENT</span>
          </div>
        );
      case "STALE":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-400 font-mono text-[11px] font-bold">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>STALE DATA</span>
          </div>
        );
      case "OFFLINE":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-400 font-mono text-[11px] font-bold">
            <WifiOff className="w-3 h-3 text-rose-400" />
            <span>○ OFFLINE</span>
          </div>
        );
      case "NO_DATA":
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-mono text-[11px] font-medium">
            <Radio className="w-3 h-3 text-slate-400 animate-pulse" />
            <span>NO DATA</span>
          </div>
        );
    }
  };

  return (
    <aside
      className={`fixed lg:static top-0 left-0 z-40 h-full w-64 bg-[#0A140D] border-r border-[#1B2F21] text-slate-200 flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="p-5 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-[#1B2F21] pb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/30">
            <Cpu className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">AGRISENSE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                IoT
              </span>
            </div>
            <p className="text-[10px] text-emerald-500/80 font-mono tracking-wider uppercase font-semibold">
              Farm Command Center
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-3 mb-2 font-bold">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#142B1A] text-emerald-400 border border-emerald-600/40 shadow-sm shadow-emerald-950/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#0E1E13]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Device Health & Stream Status Footer */}
      <div className="p-4 border-t border-[#1B2F21] bg-[#070F09] space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Device Health</span>
          {renderFreshnessBadge()}
        </div>

        <div className="bg-[#0D1C11] p-3 rounded-xl border border-[#18331F] space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] text-slate-400">Gateway:</span>
            <strong className="text-emerald-300 font-bold">{telemetry?.deviceId || "PI5-FIELD-001"}</strong>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] text-slate-400">Stream:</span>
            <span className="text-xs text-sky-400 font-semibold flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse text-sky-400" />
              {sseConnected ? "SSE LIVE" : "Polling"}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] text-slate-400">Packets Ingested:</span>
            <span className="text-slate-200 font-bold">{packetCount} pkts</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] text-slate-400">Modbus Bus:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> RS485 PASS
            </span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 text-center">
          AgriSense IoT v1.0.0 — Punjab Field 01
        </div>
      </div>
    </aside>
  );
};
