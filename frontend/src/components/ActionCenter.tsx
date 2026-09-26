import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Clock, Camera, FileText, CheckCircle2 } from "lucide-react";
import { fetchActions, updateActionStatus, fetchObservations, saveObservation } from "../services/api";

export const ActionCenter: React.FC = () => {
  const [actions, setActions] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ACTIONS" | "OBSERVATIONS">("ACTIONS");
  const [newObsNotes, setNewObsNotes] = useState("");
  const [newObsCategory, setNewObsCategory] = useState("SOIL");
  const [newObsPhoto, setNewObsPhoto] = useState("");

  const loadData = async () => {
    const act = await fetchActions("FIELD-PUNJAB-01");
    const obs = await fetchObservations("FIELD-PUNJAB-01");
    setActions(act);
    setObservations(obs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteAction = async (id: string) => {
    await updateActionStatus(id, "COMPLETED");
    loadData();
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObsNotes.trim()) return;

    await saveObservation({
      fieldId: "FIELD-PUNJAB-01",
      category: newObsCategory,
      notes: newObsNotes,
      photoUrl: newObsPhoto || null,
      observerName: "Farmer Observation",
    });

    setNewObsNotes("");
    setNewObsPhoto("");
    loadData();
  };

  return (
    <div className="bg-[#141A16] border border-[#202922] rounded-2xl p-6 shadow-sm space-y-5 font-mono text-xs text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202922] pb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#34D399]" /> Action Queue & Manual Observations
          </h2>
          <p className="text-[10px] text-[#8E9B91] font-sans">
            Actionable farmer task list and manual field observations with photo evidence support
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("ACTIONS")}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold ${
              activeTab === "ACTIONS" ? "bg-[#34D399] text-[#08120B] border-[#34D399]" : "bg-[#0F1411] text-[#8E9B91] border-[#1F2922]"
            }`}
          >
            Actions Queue ({actions.length})
          </button>
          <button
            onClick={() => setActiveTab("OBSERVATIONS")}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold ${
              activeTab === "OBSERVATIONS" ? "bg-[#34D399] text-[#08120B] border-[#34D399]" : "bg-[#0F1411] text-[#8E9B91] border-[#1F2922]"
            }`}
          >
            Field Observations ({observations.length})
          </button>
        </div>
      </div>

      {activeTab === "ACTIONS" ? (
        <div className="space-y-3">
          {actions.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#0F1411] border border-[#1F2922] text-center text-[#8E9B91]">
              No active tasks in queue. All field actions complete!
            </div>
          ) : (
            actions.map((act) => {
              const isCompleted = act.status === "COMPLETED";

              return (
                <div
                  key={act._id || act.createdAt}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCompleted ? "bg-[#0F1411] border-[#1F2922] opacity-60" : "bg-[#18211B] border-[#26352B]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          act.priority === "URGENT" ? "bg-red-950 text-red-400" : "bg-amber-950 text-amber-400"
                        }`}
                      >
                        {act.priority}
                      </span>
                      <strong className="text-white text-xs">{act.title}</strong>
                    </div>

                    <p className="text-[11px] text-[#9EB1A3]">{act.why}</p>

                    <div className="flex flex-wrap gap-3 text-[10px] text-[#6B7C6F] pt-1">
                      <span>Deadline: {act.when}</span>
                      <span>Target: {act.where}</span>
                      <span>Verification: {act.verificationMethod}</span>
                    </div>
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => handleCompleteAction(act._id)}
                      className="px-3 py-1.5 rounded-xl bg-[#34D399] text-[#08120B] font-extrabold text-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto hover:bg-[#2DD4BF]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete Task
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Add Manual Observation Form */}
          <form onSubmit={handleAddObservation} className="p-4 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#34D399]" /> Record Farmer Observation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={newObsCategory}
                onChange={(e) => setNewObsCategory(e.target.value)}
                className="bg-[#141A16] border border-[#202922] rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="SOIL">Soil / Moisture</option>
                <option value="PEST">Pest Observed</option>
                <option value="DISEASE">Disease Symptom</option>
                <option value="IRRIGATION">Irrigation Event</option>
                <option value="FERTILIZER">Fertilizer Applied</option>
                <option value="GENERAL">General Scout</option>
              </select>

              <input
                type="text"
                placeholder="Observation notes (e.g. leaf yellowing on west plot)..."
                value={newObsNotes}
                onChange={(e) => setNewObsNotes(e.target.value)}
                className="sm:col-span-2 bg-[#141A16] border border-[#202922] rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-between items-center">
              <input
                type="text"
                placeholder="Optional photo URL or note..."
                value={newObsPhoto}
                onChange={(e) => setNewObsPhoto(e.target.value)}
                className="bg-[#141A16] border border-[#202922] rounded-lg px-3 py-1.5 text-xs text-white w-2/3"
              />

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#34D399] text-[#08120B] font-extrabold text-xs flex items-center gap-1 hover:bg-[#2DD4BF]"
              >
                <Camera className="w-3.5 h-3.5" /> Save Observation
              </button>
            </div>
          </form>

          {/* Observations List */}
          <div className="space-y-2">
            {observations.map((obs) => (
              <div key={obs._id || obs.timestamp} className="p-3.5 rounded-xl bg-[#0F1411] border border-[#1F2922] space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="font-bold text-[#34D399] uppercase">{obs.category}</span>
                  <span className="text-[#6B7C6F]">{new Date(obs.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-xs text-white">{obs.notes}</p>
                {obs.photoUrl && (
                  <span className="text-[10px] text-amber-400 font-bold block">📷 Photo attached: {obs.photoUrl}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
