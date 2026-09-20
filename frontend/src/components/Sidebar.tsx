import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Sprout,
  Activity,
  BarChart3,
  FileText,
  Settings,
  RefreshCw,
} from "lucide-react";
import { useIoTData } from "../hooks/useIoTData";

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const { activeFieldCondition, sseConnected } = useIoTData();

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Map View", path: "/gis", icon: Map },
    { label: "Crop Selection", path: "/advisory", icon: Sprout },
    { label: "Soil/Weather Data", path: "/crops", icon: Activity },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Reports", path: "/reports", icon: FileText },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed lg:static top-0 left-0 z-40 h-full w-64 bg-[#121814] border-r border-[#1E2821] text-white flex flex-col justify-between transition-transform duration-300 pb-16 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="p-5 space-y-6">
        {/* Header */}
        <div className="border-b border-[#1E2821] pb-4">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#6B7C6F] block">
            SYSTEM OVERVIEW
          </span>
          <h2 className="text-sm font-black text-white tracking-tight">Archival Data Node</h2>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 font-mono text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#34D399] text-[#08120B] font-extrabold shadow-lg shadow-[#34D399]/10"
                    : "text-[#9EB1A3] hover:text-white hover:bg-[#1A231C]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#08120B]" : "text-[#6B7C6F]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Active Mode Card */}
      <div className="p-4 space-y-3 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-[#18211B] border border-[#26352B] space-y-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B7C6F] block">ACTIVE MODE</span>
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#34D399]" />
            <strong className="text-sm font-bold text-[#34D399]">{activeFieldCondition}</strong>
          </div>

          <Link
            to="/advisory"
            className="mt-2 w-full py-1.5 px-3 rounded-xl bg-[#0F1511] border border-[#28372D] text-[#A3B3A6] hover:text-white text-[11px] font-bold text-center block shadow-inner transition-all hover:bg-[#18221B]"
          >
            🔄 Change State
          </Link>
        </div>

        {/* Live IoT Feed Pill */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#14261B] border border-[#23422F] text-[#34D399] text-[11px] font-bold">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping"></span>
            ● Live IoT Feed
          </span>
          <span className="text-[10px] font-mono text-[#6B7C6F]">{sseConnected ? "SSE" : "REST"}</span>
        </div>
      </div>
    </aside>
  );
};
