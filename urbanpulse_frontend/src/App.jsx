import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import CommandCenter from "./pages/CommandCenter";
import IncidentExplorer from "./pages/IncidentExplorer";
import EvidenceGraph from "./pages/EvidenceGraph";
import JourneyImpact from "./pages/JourneyImpact";
import EventFeed from "./pages/EventFeed";
import DataQuality from "./pages/DataQuality";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<CommandCenter />} />
        <Route path="incidents" element={<IncidentExplorer />} />
        <Route path="evidence-graph" element={<EvidenceGraph />} />
        <Route path="journey-impact" element={<JourneyImpact />} />
        <Route path="event-feed" element={<EventFeed />} />
        <Route path="data-quality" element={<DataQuality />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
