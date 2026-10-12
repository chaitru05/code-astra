import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  GitFork,
  Route,
  Radio,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
} from "lucide-react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Command Center" },
  { path: "/incidents", icon: Search, label: "Incident Explorer" },
  { path: "/evidence-graph", icon: GitFork, label: "Evidence Graph" },
  { path: "/journey-impact", icon: Route, label: "Journey Impact" },
  { path: "/event-feed", icon: Radio, label: "Event Feed" },
  { path: "/data-quality", icon: ShieldCheck, label: "Data Quality" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="drawer-overlay" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Zap size={18} />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <h1>UrbanPulse</h1>
              <span>AI Intelligence</span>
            </div>
          )}
          {mobileOpen && (
            <button className="icon-btn" onClick={onMobileClose} style={{ marginLeft: "auto" }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {!collapsed && <div className="sidebar-section-label">Navigation</div>}
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={onMobileClose}
                title={collapsed ? label : undefined}
              >
                <Icon className="sidebar-link-icon" size={20} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle — hidden on mobile */}
        <div className="sidebar-footer">
          <button className="sidebar-collapse-btn" onClick={onToggle}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
}
