import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useHealthStatus } from "../../hooks/useHealthStatus";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { status: healthStatus, check: checkHealth } = useHealthStatus();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkHealth();
    // Dispatch a custom event so pages can react
    window.dispatchEvent(new CustomEvent("urbanpulse:refresh"));
    setTimeout(() => setRefreshing(false), 600);
  }, [checkHealth]);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className={`app-main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Header
          title="UrbanPulse AI"
          description="Urban Incident Fusion & Causal Intelligence"
          healthStatus={healthStatus}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onMobileMenuToggle={() => setMobileOpen((o) => !o)}
        />
        <div className="app-content">
          <Outlet context={{ healthStatus, refreshing }} />
        </div>
      </main>
    </div>
  );
}
