import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IoTProvider } from "./context/IoTContext";
import { Layout } from "./components/Layout";
import { DashboardView } from "./views/Dashboard";
import { AdvisoryView } from "./views/Advisory";
import { GISView } from "./views/GIS";
import { CropsView } from "./views/Crops";
import { AnalyticsView } from "./views/Analytics";
import { ReportsView } from "./views/Reports";
import { SettingsView } from "./views/Settings";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <IoTProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/advisory" element={<AdvisoryView />} />
            <Route path="/gis" element={<GISView />} />
            <Route path="/crops" element={<CropsView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </Layout>
      </IoTProvider>
    </BrowserRouter>
  );
};
export default App;
