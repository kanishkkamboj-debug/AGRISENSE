import React, { ReactNode } from "react";
import { Navbar } from "./Navbar";

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500 font-mono">
        AgriSense IoT Platform v1.0.0 — Evidence $\rightarrow$ Decision $\rightarrow$ Action $\rightarrow$ Verification
      </footer>
    </div>
  );
};
