import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Briefcase,
  Users,
  HelpCircle,
  Search,
  Bell
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

const NAV_ITEMS = {
  recruiter: [
    { to: "/recruiter", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/campaigns", label: "Campaigns", icon: Briefcase },
    { to: "/interviews", label: "Interviews", icon: Video },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings }
  ],
  candidate: [
    { to: "/candidate", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/applications", label: "My Applications", icon: Briefcase },
    { to: "/campaigns", label: "Browse Campaigns", icon: Search },
    { to: "/interviews", label: "Interviews", icon: Video },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings }
  ],
  admin: [
    { to: "/admin", label: "Console", icon: Shield, end: true },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings }
  ]
};

export default function Sidebar({ role = "recruiter" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // API returns roles in uppercase ("CANDIDATE", "RECRUITER", "ADMIN") — normalize for nav lookup
  const roleKey = (role || "recruiter").toLowerCase();
  const items = NAV_ITEMS[roleKey] || NAV_ITEMS.recruiter;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const isActive = (item) => {
    if (item.end) {
      return location.pathname === item.to.split("#")[0];
    }
    if (item.to.includes("#")) {
      return location.pathname === item.to.split("#")[0];
    }
    return location.pathname === item.to;
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">V</div>
        <div>
          <strong>ValuHire</strong>
          <span>{role === "admin" ? "Admin Console" : "Talent Intelligence"}</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="Primary">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive: navActive }) =>
                "nav-item" + (navActive || isActive(item) ? " active" : "")
              }
            >
              <Icon size={18} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 mb-2">
        <NavLink to="/help" className="nav-item">
          <HelpCircle size={18} />
          <span>Help & Docs</span>
        </NavLink>
      </div>

      <div className="sidebar-user">
        <div className="user-info">
          <span className="user-name">{user?.name || user?.email || "Guest"}</span>
          <span className="user-role">{roleKey}</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell user={user} />
          <button
            type="button"
            onClick={handleLogout}
            className="icon-button"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
