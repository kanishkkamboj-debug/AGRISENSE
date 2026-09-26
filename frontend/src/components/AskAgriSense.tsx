import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, AlertCircle, Bot, User } from "lucide-react";
import { askAgriSense } from "../services/api";
import { useIoTData } from "../hooks/useIoTData";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  isAiGenerated?: boolean;
  timestamp: string;
}

export const AskAgriSense: React.FC = () => {
  const { deviceStatus } = useIoTData();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Hello! I am Ask AgriSense, your precision agricultural assistant. Ask me anything about your field status, soil moisture, crop stage, irrigation timing, or missing sensor data.",
      isAiGenerated: true,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await askAgriSense(userMsg.text, "FIELD-PUNJAB-01");
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: res.answer,
        isAiGenerated: res.isAiGenerated,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "Unable to complete request. Backend agricultural engine unavailable.",
          isAiGenerated: false,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Why is my soil condition changing?",
    "Should I irrigate now?",
    "Why is NPK unavailable?",
    "What data is missing from my field?",
  ];

  return (
    <div className="bg-[#141A16] border border-[#202922] rounded-2xl p-6 shadow-sm space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-[#202922] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Ask AgriSense <span className="text-[10px] text-[#34D399] font-normal px-2 py-0.5 rounded bg-[#0F1411] border border-[#1F2922]">AI Chat</span>
            </h2>
            <p className="text-[10px] text-[#8E9B91] font-sans">
              Ground-truth agricultural Q&A using live IoT telemetry & crop models
            </p>
          </div>
        </div>

        {deviceStatus === "OFFLINE" && (
          <span className="text-[10px] text-red-400 bg-red-950/60 border border-red-800/60 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
            <AlertCircle className="w-3 h-3" /> OFFLINE MODE
          </span>
        )}
      </div>

      {/* Chat Messages Window */}
      <div className="h-64 overflow-y-auto space-y-3 p-3 rounded-xl bg-[#0F1411] border border-[#1F2922] text-xs">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            {m.sender === "ai" && (
              <div className="w-7 h-7 rounded-lg bg-[#1F2B22] border border-[#34D399]/30 text-[#34D399] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] p-3 rounded-xl border ${
                m.sender === "user"
                  ? "bg-[#34D399] text-[#08120B] font-semibold border-[#34D399]"
                  : "bg-[#18211B] text-[#E0E7E1] border-[#26352B]"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
              <span className={`text-[9px] block mt-1 text-right ${m.sender === "user" ? "text-[#08120B]/70" : "text-[#6B7C6F]"}`}>
                {m.timestamp} {m.isAiGenerated !== undefined && (m.isAiGenerated ? "• Gemini AI" : "• Rule Engine")}
              </span>
            </div>
            {m.sender === "user" && (
              <div className="w-7 h-7 rounded-lg bg-[#34D399] text-[#08120B] flex items-center justify-center shrink-0 font-black text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[#34D399] text-xs italic">
            <Sparkles className="w-4 h-4 animate-spin" /> AgriSense AI analyzing field context...
          </div>
        )}
      </div>

      {/* Sample Quick Prompts */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(q);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#0F1411] border border-[#1F2922] text-[#8E9B91] hover:text-white hover:bg-[#18211B] transition-all"
          >
            💬 "{q}"
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AgriSense about soil, irrigation, weather, or crop status..."
          className="flex-1 bg-[#0F1411] border border-[#1F2922] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#34D399]"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#34D399] text-[#08120B] font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#2DD4BF] disabled:opacity-50 shadow-md shadow-[#34D399]/10"
        >
          <Send className="w-3.5 h-3.5" /> Ask
        </button>
      </form>
    </div>
  );
};
