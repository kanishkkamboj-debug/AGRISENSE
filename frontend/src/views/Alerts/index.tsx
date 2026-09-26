import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, PlusCircle, Filter, RefreshCw, AlertTriangle } from "lucide-react";
import { fetchAlerts, resolveAlert, createActionFromAlert } from "../../services/api";

export const AlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    const data = await fetchAlerts("FIELD-PUNJAB-01", filterStatus, filterSeverity);
    setAlerts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAlerts();
  }, [filterStatus, filterSeverity]);

  const handleResolve = async (id: string) => {
    const ok = await resolveAlert(id);
    if (ok) {
      setActionMessage("Alert marked as resolved.");
      loadAlerts();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleCreateAction = async (id: string) => {
    const ok = await createActionFromAlert(id);
    if (ok) {
      setActionMessage("Action created from alert and assigned to Action Queue.");
      loadAlerts();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 text-[#F0FDF4] font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141A16] border border-[#202922] shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" /> AgriSense Alert Center
          </h1>
          <p className="text-xs text-[#8E9B91] font-sans mt-1">
            Real-time environmental risk detection, device offline notifications, and correlated stress alerts
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="px-4 py-2 rounded-xl bg-[#0F1411] border border-[#1F2922] text-[#8E9B91] hover:text-white flex items-center gap-2 self-start sm:self-auto font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Alerts
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-[#14261B] border border-[#23422F] text-[#34D399] font-bold">
          ✓ {actionMessage}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#141A16] border border-[#202922]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#6B7C6F]" />
          <span className="font-bold text-white uppercase text-[10px]">Filter Status:</span>
          {["ALL", "ACTIVE", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                filterStatus === st
                  ? "bg-[#34D399] text-[#08120B] border-[#34D399]"
                  : "bg-[#0F1411] text-[#8E9B91] border-[#1F2922] hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-white uppercase text-[10px]">Severity:</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                filterSeverity === sev
                  ? "bg-amber-400 text-[#08120B] border-amber-400"
                  : "bg-[#0F1411] text-[#8E9B91] border-[#1F2922] hover:text-white"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#141A16] border border-[#202922] text-center text-[#8E9B91] space-y-2">
            <CheckCircle className="w-8 h-8 text-[#34D399] mx-auto" />
            <p className="text-sm font-bold text-white">No Active Alerts</p>
            <p className="text-xs">All field parameters and IoT device heartbeats are currently within normal thresholds.</p>
          </div>
        ) : (
          alerts.map((al) => {
            const isCritical = al.severity === "CRITICAL";
            const isHigh = al.severity === "HIGH";
            const isResolved = al.status === "RESOLVED";

            return (
              <div
                key={al._id || al.timestamp}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isResolved
                    ? "bg-[#141A16]/50 border-[#1E2821] opacity-75"
                    : isCritical
                    ? "bg-[#2B1A1E] border-[#482027]"
                    : isHigh
                    ? "bg-[#2E2618] border-[#493B20]"
                    : "bg-[#141A16] border-[#202922]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202922]/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        isCritical
                          ? "bg-red-500/20 text-red-400 border border-red-500/40"
                          : isHigh
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      }`}
                    >
                      {al.severity}
                    </span>
                    <h3 className="text-sm font-bold text-white">{al.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-[#8E9B91]">
                    <span>{new Date(al.timestamp).toLocaleString()}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        isResolved ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
                      }`}
                    >
                      {al.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#D1DCD3] font-sans leading-relaxed">{al.description}</p>

                {/* Evidence Chips */}
                {al.evidence && al.evidence.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                    <span className="text-[#6B7C6F] font-bold">Evidence:</span>
                    {al.evidence.map((ev: any, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-[#0F1411] border border-[#1F2922] text-[#9EB1A3]">
                        {ev.parameter || "param"}: <strong className="text-white">{String(ev.value ?? "N/A")}</strong> {ev.unit || ""}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {!isResolved && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handleResolve(al._id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#34D399] text-[#08120B] font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#2DD4BF]"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Resolve Alert
                    </button>

                    <button
                      onClick={() => handleCreateAction(al._id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0F1411] border border-[#1F2922] text-white hover:bg-[#18211B] text-xs flex items-center gap-1.5 font-bold"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#34D399]" /> Create Action Task
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
