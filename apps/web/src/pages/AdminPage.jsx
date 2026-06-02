import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ListFilter,
  Users,
  Shield,
  Download,
  ChevronRight
} from "lucide-react";
import { adminService } from "../services/api";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import { SkeletonTable } from "../components/Skeleton";

const COMPANY_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" }
];

export default function AdminPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    Promise.all([
      adminService.getCompanies().catch((err) => { setError(err.message); return { companies: [] }; }),
      adminService.getUsers().catch(() => ({ users: [] }))
    ])
      .then(([companyData, userData]) => {
        setCompanies(companyData.companies || companyData || []);
        setUsers(userData.users || userData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCompanies = companies.filter((c) => companyFilter === "all" || c.status === companyFilter);
  const filteredUsers = users.filter((u) => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()));

  const pendingCount = companies.filter((c) => c.status === "pending").length;
  const approvedCount = companies.filter((c) => c.status === "approved").length;
  const rejectedCount = companies.filter((c) => c.status === "rejected").length;
  const bannedCount = users.filter((u) => (u.status || "").toLowerCase() === "banned").length;

  const handleApprove = async (company) => {
    if (busyId) return;
    setBusyId(company.id);
    try {
      await adminService.updateCompanyStatus(company.id, "approved");
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, status: "approved" } : c)));
      toast.success(`${company.name} approved`, { title: "Company verified" });
    } catch (err) {
      toast.error(err.message || "Approval failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (company) => {
    if (busyId) return;
    setBusyId(company.id);
    try {
      await adminService.updateCompanyStatus(company.id, "rejected");
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, status: "rejected" } : c)));
      toast.warning(`${company.name} rejected`);
    } catch (err) {
      toast.error(err.message || "Rejection failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleBan = async (u) => {
    if (busyId) return;
    if (!window.confirm(`Ban ${u.name}?`)) return;
    setBusyId(u.id);
    try {
      await adminService.banUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: "banned" } : x)));
      toast.warning(`${u.name} banned`);
    } catch (err) {
      toast.error(err.message || "Ban failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar role="admin" />
      <main className="workspace">
        <TopBar
          eyebrow="Admin Console"
          title="Moderation"
          actions={
            <button type="button" className="secondary-button">
              <Download size={16} />
              <span>Export audit log</span>
            </button>
          }
        />

        <div className="stack">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Building2}
              label="Pending companies"
              value={pendingCount}
              variant="warning"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Approved companies"
              value={approvedCount}
              variant="success"
            />
            <MetricCard
              icon={XCircle}
              label="Rejected companies"
              value={rejectedCount}
              variant="error"
            />
            <MetricCard
              icon={Shield}
              label="Banned users"
              value={bannedCount}
              variant="error"
            />
          </section>

          <section id="companies" className="panel">
            <div className="panel-header flex-col md:flex-row items-stretch md:items-center gap-3">
              <div>
                <Building2 size={20} className="text-primary" />
                <h2>Company approvals</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                {COMPANY_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCompanyFilter(f.id)}
                    className={
                      "px-3 h-9 rounded-lg text-sm font-semibold border transition-colors inline-flex items-center gap-2 " +
                      (companyFilter === f.id
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-on-surface-variant border-outline hover:border-primary")
                    }
                  >
                    <span>{f.label}</span>
                  </button>
                ))}
                <span className="text-xs text-on-surface-variant ml-2">{filteredCompanies.length} result{filteredCompanies.length === 1 ? "" : "s"}</span>
              </div>
            </div>

            {loading ? (
              <SkeletonTable rows={4} />
            ) : error ? (
              <EmptyState
                icon={XCircle}
                variant="error"
                title="Could not load companies"
                description={error}
                primaryAction={{ label: "Retry", onClick: () => window.location.reload() }}
              />
            ) : filteredCompanies.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No companies to review"
                description="New company signups will appear here for moderation."
              />
            ) : (
              <div className="divide-y divide-outline">
                {filteredCompanies.map((company) => {
                  const status = (company.status || "pending").toLowerCase();
                  const Icon = status === "approved" ? CheckCircle2 : status === "rejected" ? XCircle : Clock;
                  return (
                    <div key={company.id || company.name} className="flex flex-wrap items-center justify-between gap-3 px-md py-4 hover:bg-surface-light transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={
                            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 " +
                            (status === "approved"
                              ? "bg-success-green/10 text-success-green"
                              : status === "rejected"
                              ? "bg-error-coral/10 text-error-coral"
                              : "bg-warning-amber/10 text-warning-amber")
                          }
                        >
                          <Icon size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-title-md text-on-surface truncate">{company.name}</p>
                          <p className="text-sm text-on-surface-variant inline-flex items-center gap-2">
                            <Users size={12} />
                            {company.recruiters ?? company._count?.recruiters ?? 0} recruiters
                            <span>•</span>
                            <Building2 size={12} />
                            {company.campaigns ?? company._count?.campaigns ?? 0} campaigns
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={
                            "status-chip " +
                            (status === "approved" ? "success" : status === "rejected" ? "error" : "warning")
                          }
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        {status === "pending" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReject(company)}
                              disabled={busyId === company.id}
                              className="secondary-button text-sm"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprove(company)}
                              disabled={busyId === company.id}
                              className="primary-button text-sm"
                            >
                              <CheckCircle2 size={14} />
                              <span>{busyId === company.id ? "..." : "Approve"}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="tertiary-button text-sm"
                            onClick={() => toast.info("Audit log coming soon")}
                          >
                            View audit
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section id="users" className="panel">
            <div className="panel-header flex-col md:flex-row items-stretch md:items-center gap-3">
              <div>
                <Users size={20} className="text-primary" />
                <h2>User moderation</h2>
              </div>
              <div className="flex items-center gap-2 px-3 h-10 bg-white border border-outline rounded-lg w-full md:w-72 ml-auto">
                <Search size={16} className="text-on-surface-variant" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users…"
                  className="flex-1 bg-transparent outline-none text-sm"
                  aria-label="Search users"
                />
              </div>
            </div>

            {loading ? (
              <SkeletonTable rows={5} />
            ) : filteredUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No users found"
                description={userSearch ? `No users match "${userSearch}".` : "Users will appear here once they sign up."}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline">
                      <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider">User</th>
                      <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider">Role</th>
                      <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider">Company</th>
                      <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                      <th className="px-md py-3 text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const role = (u.role || "CANDIDATE").toLowerCase();
                      const status = (u.status || "active").toLowerCase();
                      return (
                        <tr key={u.id || u.name} className="border-b border-outline hover:bg-surface-light transition-colors">
                          <td className="px-md py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {u.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <span className="text-sm font-semibold text-on-surface truncate">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-md py-3">
                            <span className="text-sm text-on-surface-variant capitalize">{u.role || "Candidate"}</span>
                          </td>
                          <td className="px-md py-3 text-sm text-on-surface-variant">{u.company || "—"}</td>
                          <td className="px-md py-3">
                            <span className={"status-chip " + (status === "banned" ? "error" : "success")}>
                              {status === "banned" ? "Banned" : "Active"}
                            </span>
                          </td>
                          <td className="px-md py-3 text-right">
                            {role !== "admin" ? (
                              <button
                                type="button"
                                onClick={() => handleBan(u)}
                                disabled={busyId === u.id || status === "banned"}
                                className="secondary-button text-sm"
                                style={status === "banned" ? { opacity: 0.5 } : undefined}
                              >
                                {status === "banned" ? "Banned" : busyId === u.id ? "..." : "Ban user"}
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3 items-start">
            <div className="p-2 bg-primary text-white rounded-full flex-shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h5 className="text-title-md text-on-surface">Moderation guidelines</h5>
              <p className="text-sm text-on-surface-variant mt-1">
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

function MetricCard({ icon: Icon, label, value, variant = "primary" }) {
  const variantClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success-green/10 text-success-green",
    warning: "bg-warning-amber/10 text-warning-amber",
    error: "bg-error-coral/10 text-error-coral"
  }[variant] || "bg-primary/10 text-primary";
  return (
    <div className="metric-card">
      <div className={"metric-icon-wrapper " + variantClasses}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
