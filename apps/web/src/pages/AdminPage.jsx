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
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Gavel,
  CheckCircle,
  Eye,
  Ban
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
    <div className="flex min-h-screen bg-background font-sans antialiased text-on-background overflow-hidden">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar
          eyebrow="Admin Console"
          title="Dashboard"
          actions={
            <>
              <button type="button" className="hidden sm:flex bg-primary-container text-on-primary rounded items-center gap-2 py-2 px-4 shadow-sm hover:shadow-md transition-shadow active:scale-95 font-label-md text-label-md">
                Create Audit
              </button>
              <button type="button" className="hidden lg:flex border border-outline text-on-surface rounded items-center gap-2 py-2 px-4 hover:bg-surface-container-low transition-colors active:scale-95 font-label-md text-label-md">
                <Download size={16} />
                Export Data
              </button>
            </>
          }
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Page Header */}
            <div>
              <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold">Dashboard Overview</h1>
              <p className="text-body-md text-on-surface-variant mt-1">System status and pending actionable items requiring administrator attention.</p>
            </div>

            {/* Stats Row (Bento Style Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon={Clock}
                label="Pending Approvals"
                value={pendingCount}
                subtext="Requires immediate review"
                trendIcon={ShieldCheck}
                colorClass="text-tertiary"
              />
              <MetricCard
                icon={Gavel}
                label="Flagged Users"
                value={bannedCount}
                subtext="Action required"
                trendIcon={TrendingUp}
                colorClass="text-error"
              />
              <MetricCard
                icon={Building2}
                label="Approved Companies"
                value={approvedCount}
                subtext="Active in platform"
                trendIcon={TrendingUp}
                colorClass="text-primary"
              />
              <MetricCard
                icon={CheckCircle2}
                label="Total Resolved"
                value={companies.length + users.length}
                subtext="System actions"
                trendIcon={CheckCircle}
                colorClass="text-[#059669]"
              />
            </div>

            {/* Tables Section Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Pending Company Approvals */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm flex flex-col min-h-[400px]">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright rounded-t">
                  <h3 className="text-title-lg text-on-surface flex items-center gap-2 font-semibold">
                    <Building2 className="text-tertiary" size={24} />
                    Pending Company Approvals
                  </h3>
                  <div className="flex gap-2">
                    <select
                      value={companyFilter}
                      onChange={(e) => setCompanyFilter(e.target.value)}
                      className="text-sm border border-outline-variant rounded bg-transparent px-2 py-1 outline-none"
                    >
                      {COMPANY_FILTERS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold">Company Name</th>
                        <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold">Metrics</th>
                        <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold">Status</th>
                        <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                      {loading ? (
                        <tr><td colSpan={4} className="p-4 text-center text-on-surface-variant">Loading...</td></tr>
                      ) : filteredCompanies.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">No companies found</td></tr>
                      ) : (
                        filteredCompanies.map(company => {
                          const status = (company.status || "pending").toLowerCase();
                          return (
                            <tr key={company.id} className="hover:bg-surface-bright transition-colors group">
                              <td className="p-3 text-label-md font-medium">{company.name}</td>
                              <td className="p-3 text-on-surface-variant">
                                {company.recruiters || 0} recruiters, {company.campaigns || 0} campaigns
                              </td>
                              <td className="p-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-label-sm text-[10px] uppercase font-bold tracking-wider ${
                                  status === 'approved' ? 'bg-success-green/10 text-success-green' :
                                  status === 'rejected' ? 'bg-error-coral/10 text-error-coral' :
                                  'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                                }`}>
                                  {status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {status === "pending" ? (
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleReject(company)} disabled={busyId === company.id} className="text-error-coral hover:bg-error-coral/10 p-1 rounded transition-colors" title="Reject">
                                      <XCircle size={20} />
                                    </button>
                                    <button onClick={() => handleApprove(company)} disabled={busyId === company.id} className="text-[#059669] hover:bg-[#059669]/10 p-1 rounded transition-colors" title="Approve">
                                      <CheckCircle2 size={20} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button className="text-on-surface-variant hover:text-primary transition-colors" title="View Details">
                                      <Eye size={20} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 border-t border-outline-variant bg-surface-container-lowest text-center">
                  <a className="text-label-sm text-primary hover:underline" href="#">View All Companies</a>
                </div>
              </div>

              {/* User Moderation Queue */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm flex flex-col min-h-[400px]">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright rounded-t">
                  <h3 className="text-title-lg text-on-surface flex items-center gap-2 font-semibold">
                    <Shield className="text-error" size={24} />
                    User Moderation Queue
                  </h3>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Search size={14} className="text-outline" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="block w-full pl-8 pr-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold">User / Email</th>
                        <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold">Role</th>
                        <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold">Status</th>
                        <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                      {loading ? (
                         <tr><td colSpan={4} className="p-4 text-center text-on-surface-variant">Loading...</td></tr>
                      ) : filteredUsers.length === 0 ? (
                         <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">No users found</td></tr>
                      ) : (
                        filteredUsers.map(u => {
                           const role = (u.role || "CANDIDATE").toLowerCase();
                           const status = (u.status || "active").toLowerCase();
                           return (
                             <tr key={u.id} className="hover:bg-surface-bright transition-colors group">
                                <td className="p-3">
                                  <div className="text-label-md font-medium">{u.name}</div>
                                  <div className="text-on-surface-variant text-[12px]">{u.email || (u.name.toLowerCase().replace(/\s/g, '') + "@example.com")}</div>
                                </td>
                                <td className="p-3 text-on-surface-variant capitalize">{role}</td>
                                <td className="p-3">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-label-sm text-[10px] uppercase font-bold tracking-wider ${
                                    status === 'banned' ? 'bg-error-container text-on-error-container line-through decoration-error' : 'bg-success-green/10 text-success-green'
                                  }`}>
                                    {status}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {role !== "admin" && status !== "banned" && (
                                      <button onClick={() => handleBan(u)} disabled={busyId === u.id} className="text-error hover:bg-error-container p-1 rounded transition-colors" title="Suspend">
                                        <Ban size={20} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                             </tr>
                           );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 border-t border-outline-variant bg-surface-container-lowest text-center">
                  <a className="text-label-sm text-primary hover:underline" href="#">View All Users</a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtext, trendIcon: TrendIcon, colorClass }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
      <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={80} className={colorClass} />
      </div>
      <div className="relative z-10">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">{label}</p>
        <h2 className="text-display-lg text-on-surface font-bold">{value}</h2>
      </div>
      <div className={`mt-4 flex items-center relative z-10 ${colorClass}`}>
        <TrendIcon size={16} className="mr-1" />
        <span className="text-label-sm font-medium">{subtext}</span>
      </div>
    </div>
  );
}
