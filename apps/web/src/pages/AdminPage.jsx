import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import {
  Building2,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Megaphone,
  Video,
  BarChart3,
  User,
  Settings,
  UserCircle,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  ListFilter
} from "lucide-react";
import { adminService } from "../services/api";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      adminService.getCompanies(),
      adminService.getUsers()
    ])
      .then(([companyData, userData]) => {
        setCompanies(companyData.companies || companyData || []);
        setUsers(userData.users || userData || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed left-0 top-0 h-full w-[220px] bg-surface-container-lowest border-r border-outline-variant flex flex-col py-md px-sm z-50">
        <div className="mb-xl px-sm">
          <img
            alt="ValuHire Logo"
            className="h-10 w-auto mb-xs"
            src="https://lh3.googleusercontent.com/aida/ADBb0uiyvMoXItf1fpE9azuWp8utjz8-9RmH3U62X5R8-Pe6TJS9ujFKQhshSel309LNBb89qmKkwZgKYbiDS8WrPFuXuOcAqT-KmQ-LKiRGzjptchEV7uBbRdrx2nGTNawu6mbzjb9Jo6AlDcPHG1eVHshYObua9wi9Cn749MqZT9okkwTvqCOM8dmXhX7SvmegpukvFi4Uc05TS74-HZJBmhP_bhptzFm272ryY4zGRrfFXot4xxXYIoPmDho"
          />
          <h1 className="text-headline-md text-primary font-bold">ValuHire</h1>
          <p className="text-label-sm text-on-surface-variant">Admin Portal</p>
        </div>

        <nav className="flex-1 space-y-1">
          <a
            className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded"
            href="#"
          >
            <Dashboard size={20} />
            <span className="text-label-md">Dashboard</span>
          </a>
          <a
            className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded"
            href="#"
          >
            <Building2 size={20} />
            <span className="text-label-md">Companies</span>
          </a>
          <a
            className="flex items-center gap-sm px-sm py-xs text-primary font-bold bg-primary-fixed/20 cursor-pointer rounded"
            href="#"
          >
            <ShieldCheck size={20} />
            <span className="text-label-md">Moderation</span>
          </a>
        </nav>

        <div className="mt-auto pt-md border-t border-outline-variant/30 space-y-1">
          <div className="mt-md flex items-center gap-sm px-sm pt-sm border-t border-outline-variant/20">
            <div className="w-8 h-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || "AD"}
            </div>
            <div className="flex flex-col">
              <span className="text-label-md text-on-surface">{user?.name || "Admin"}</span>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
                {user?.role || "Administrator"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-[220px] min-h-screen">
        <header className="fixed top-0 right-0 w-[calc(100%-220px)] bg-surface h-16 px-lg flex justify-between items-center z-40 border-b border-outline-variant">
          <div className="flex flex-col">
            <span className="text-label-sm text-on-surface-variant/80">V1 MVP</span>
            <h2 className="text-headline-md text-primary">Admin Moderation</h2>
          </div>
          <div className="flex items-center gap-md">
            <button className="flex items-center gap-xs px-md py-xs border border-outline text-on-surface-variant text-label-md rounded hover:bg-surface-container-high transition-all">
              <ListFilter size={18} />
              Filter
            </button>
          </div>
        </header>

        <div className="mt-16 p-lg space-y-6">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low/30">
              <div className="flex items-center gap-sm">
                <Building2 className="text-primary" size={20} />
                <h3 className="text-title-lg text-on-surface">Company Approvals</h3>
              </div>
              <span className="text-label-sm text-on-surface-variant">3 companies</span>
            </div>
            <div className="divide-y divide-outline-variant/30">
              {companies.map((company, index) => (
                <div key={company.name} className="px-lg py-md flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        company.status === "approved"
                          ? "bg-primary-fixed"
                          : company.status === "pending"
                          ? "bg-tertiary-fixed"
                          : "bg-error-container"
                      }`}
                    >
                      {company.status === "approved" ? (
                        <CheckCircle className="text-primary" size={20} />
                      ) : company.status === "pending" ? (
                        <Clock className="text-tertiary" size={20} />
                      ) : (
                        <XCircle className="text-error" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-title-md text-on-surface">{company.name}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {company.recruiters} recruiters • {company.campaigns} campaigns
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-md">
                    <span
                      className={`px-md py-xs rounded-full text-label-md ${
                        company.status === "approved"
                          ? "bg-primary-fixed text-primary"
                          : company.status === "pending"
                          ? "bg-tertiary-fixed text-tertiary"
                          : "bg-error-container text-error"
                      }`}
                    >
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </span>
                    {company.status === "pending" && (
                      <div className="flex gap-sm">
                        <button className="px-md py-xs bg-primary text-on-primary rounded text-label-sm hover:opacity-90">
                          Approve
                        </button>
                        <button className="px-md py-xs border border-error text-error rounded text-label-sm hover:bg-error-container">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low/30">
              <div className="flex items-center gap-sm">
                <User className="text-primary" size={20} />
                <h3 className="text-title-lg text-on-surface">User Moderation</h3>
              </div>
              <span className="text-label-sm text-on-surface-variant">3 users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50 border-b border-outline-variant">
                  <tr>
                    <th className="px-lg py-sm text-label-md text-on-surface-variant">User</th>
                    <th className="px-lg py-sm text-label-md text-on-surface-variant">Role</th>
                    <th className="px-lg py-sm text-label-md text-on-surface-variant">Company</th>
                    <th className="px-lg py-sm text-label-md text-on-surface-variant">Status</th>
                    <th className="px-lg py-sm text-label-md text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {users.map((u) => (
                    <tr key={u.name} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-md">
                          <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-label-md text-on-surface-variant">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-body-md text-on-surface">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-lg py-md text-body-md text-on-surface-variant">{u.role}</td>
                      <td className="px-lg py-md text-body-md text-on-surface-variant">{u.company}</td>
                      <td className="px-lg py-md">
                        <span
                          className={`px-md py-xs rounded-full text-label-md ${
                            u.status === "active"
                              ? "bg-primary-fixed text-primary"
                              : "bg-tertiary-fixed text-tertiary"
                          }`}
                        >
                          {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-lg py-md text-right">
                        {u.role !== "Admin" && (
                          <button className="px-md py-xs border border-error text-error rounded text-label-sm hover:bg-error-container">
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="bg-surface-container-highest/30 border border-primary/20 p-md rounded flex gap-md items-start">
            <div className="p-sm bg-primary/10 rounded-full">
              <ShieldCheck className="text-primary" size={20} />
            </div>
            <div>
              <h5 className="text-title-md text-on-surface">Moderation Guidelines</h5>
              <p className="text-body-sm text-on-surface-variant mt-xs">
                Pending companies require review of business documentation before approval. Users from banned
                companies are automatically restricted from platform access. All moderation actions are
                logged for audit compliance.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}