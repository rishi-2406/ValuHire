import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Gavel,
  CheckCircle,
  Download
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import { MetricCard } from "../components/AdminPage/MetricCard";
import { PendingCompaniesTable } from "../components/AdminPage/PendingCompaniesTable";
import { UserModerationQueue } from "../components/AdminPage/UserModerationQueue";
import { useAdminData } from "../hooks/useAdminData";

const COMPANY_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" }
];

export default function AdminPage() {
  const { user } = useAuth();
  const toast = useToast();
  
  const {
    companies,
    users,
    loading,
    companyFilter, setCompanyFilter,
    userSearch, setUserSearch,
    busyId,
    filteredCompanies, filteredUsers,
    pendingCount, approvedCount, bannedCount,
    handleApprove, handleReject, handleBan
  } = useAdminData(toast);

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role="admin" />
      <main className="workspace">
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

        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 w-full overflow-y-auto">
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
              <PendingCompaniesTable 
                companyFilter={companyFilter}
                setCompanyFilter={setCompanyFilter}
                COMPANY_FILTERS={COMPANY_FILTERS}
                loading={loading}
                filteredCompanies={filteredCompanies}
                handleReject={handleReject}
                handleApprove={handleApprove}
                busyId={busyId}
              />

              {/* User Moderation Queue */}
              <UserModerationQueue 
                userSearch={userSearch}
                setUserSearch={setUserSearch}
                loading={loading}
                filteredUsers={filteredUsers}
                handleBan={handleBan}
                busyId={busyId}
              />
            </div>
          </div>
      </main>
    </div>
  );
}
