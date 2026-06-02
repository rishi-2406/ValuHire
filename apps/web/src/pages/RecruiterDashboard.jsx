import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Users,
  CheckCircle,
  Calendar,
  AlertTriangle,
  LogOut,
  Search,
  Bell,
  HelpCircle,
  Settings,
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  BarChart3,
  MoreHorizontal,
  ArrowRight,
  User
} from "lucide-react";
import { campaignService } from "../services/api";

export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    campaignService.getMyCampaigns()
      .then(data => setCampaigns(data.campaigns || data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const mockInterviews = [
    { name: "Alex Rivera", role: "Node.js Specialist Interview", time: "10:00 AM", action: "Join Call", primary: true },
    { name: "Jordan Smith", role: "System Design Review", time: "2:30 PM", action: "Prep Notes", primary: false }
  ];

  const totalCandidates = campaigns.reduce((sum, c) => sum + (c.applicantCount || c.applicants || 0), 0);
  const completedAssessments = campaigns.reduce((sum, c) => sum + (c.completedCount || 0), 0);

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col py-md">
        <div className="px-lg mb-xl">
          <img
            alt="ValuHire Logo"
            className="h-10 object-contain"
            src="https://lh3.googleusercontent.com/aida/ADBb0uiyvMoXItf1fpE9azuWp8utjz8-9RmH3U62X5R8-Pe6TJS9ujFKQhshSel309LNBb89qmKkwZgKYbiDS8WrPFuXuOcAqT-KmQ-LKiRGzjptchEV7uBbRdrx2nGTNawu6mbzjb9Jo6AlDcPHG1eVHshYObua9wi9Cn749MqZT9okkwTvqCOM8dmXhX7SvmegpukvFi4Uc05TS74-HZJBmhP_bhptzFm272ryY4zGRrfFXot4xxXYIoPmDho"
          />
          <p className="text-label-md text-on-surface-variant mt-xs">Recruiter Portal</p>
        </div>

        <nav className="flex-1 space-y-1">
          <a
            className="flex items-center px-lg py-md text-primary font-bold border-l-4 border-primary bg-surface-container-low"
            href="#"
          >
            <LayoutDashboard size={20} className="mr-md" />
            <span className="text-body-md">Dashboard</span>
          </a>
          <a
            className="flex items-center px-lg py-md text-on-surface-variant hover:text-primary hover:bg-surface-container"
            href="#"
          >
            <Briefcase size={20} className="mr-md" />
            <span className="text-body-md">Campaigns</span>
          </a>
          <a
            className="flex items-center px-lg py-md text-on-surface-variant hover:text-primary hover:bg-surface-container"
            href="#"
          >
            <CalendarCheck size={20} className="mr-md" />
            <span className="text-body-md">Interviews</span>
          </a>
          <a
            className="flex items-center px-lg py-md text-on-surface-variant hover:text-primary hover:bg-surface-container"
            href="#"
          >
            <BarChart3 size={20} className="mr-md" />
            <span className="text-body-md">Results</span>
          </a>
        </nav>

        <div className="mt-auto px-md space-y-md border-t border-outline-variant pt-md">
          <div className="flex items-center space-x-md px-md">
            <img
              alt={user?.name || "Sarah Chen"}
              className="h-10 w-10 rounded-full border border-outline-variant object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZCxVZwJ2dtB-lDGCAyYfwvuF-epldjgV6XH78YL6oQ434z1AeJEUtxudyeyN9hmLkE3jq-XBvdDTvHS-TLgO99PKdey5eFvNsi1OOaHDDmxYMRwgIum3jk8LCV6L-S5Pn4PccFeHnOmcnbnlj1TaBrEZ9ubIRgWlfYKYkYSV1leyZIxjGikAHoK0LW42I-x0HYeioeoKe7mlAT6fUvWKWBRrJwns8RHnhwxfJg407ANoFZ8Gzqq89vE89DWmFN8DWGOUbm2LCEDA"
            />
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-on-surface truncate">{user?.name || "Sarah Chen"}</p>
              <p className="text-label-sm text-on-surface-variant truncate">{user?.role || "Recruiter"}</p>
            </div>
            <button onClick={logout} className="text-on-surface-variant hover:text-error transition-colors">
              <LogOut size={20} />
            </button>
          </div>
          <div className="space-y-xs pb-md">
            <a
              className="flex items-center px-md py-sm text-on-surface-variant hover:bg-surface-container transition-all rounded-lg"
              href="#"
            >
              <Settings size={16} className="mr-sm" />
              <span className="text-label-md">Settings</span>
            </a>
            <a
              className="flex items-center px-md py-sm text-on-surface-variant hover:bg-surface-container transition-all rounded-lg"
              href="#"
            >
              <HelpCircle size={16} className="mr-sm" />
              <span className="text-label-md">Support</span>
            </a>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant flex justify-between items-center w-full px-lg py-md">
          <div className="flex flex-col">
            <span className="text-label-sm text-primary uppercase tracking-wider">V1 MVP</span>
            <h1 className="text-headline-lg text-on-surface">Recruiter Dashboard</h1>
          </div>
          <div className="flex items-center space-x-lg">
            <div className="relative w-64">
              <Search className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input
                className="w-full bg-surface-container-low border border-outline-variant rounded-full py-sm pl-10 pr-md text-body-sm focus:outline-none focus:border-primary transition-all"
                placeholder="Search candidates..."
                type="text"
              />
            </div>
            <div className="flex items-center space-x-md text-on-surface-variant">
              <button className="p-xs hover:bg-surface-container-high rounded-full transition-all relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full border-2 border-surface" />
              </button>
              <button className="p-xs hover:bg-surface-container-high rounded-full transition-all">
                <HelpCircle size={20} />
              </button>
            </div>
            <button className="bg-primary text-on-primary px-lg py-md rounded text-label-md hover:opacity-90 active:scale-95 transition-all">
              New Campaign
            </button>
          </div>
        </header>

        <div className="p-lg max-w-7xl mx-auto space-y-xl">
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard icon={Users} label="Active Candidates" value={loading ? "—" : String(totalCandidates)} />
            <MetricCard icon={CheckCircle} label="Assessments Completed" value={loading ? "—" : String(completedAssessments)} />
            <MetricCard icon={Calendar} label="Interviews This Week" value="—" />
            <MetricCard icon={AlertTriangle} label="Integrity Flags" value="—" warning />
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-title-lg text-on-surface">Campaign Pipeline</h2>
              <button className="text-label-md text-primary flex items-center hover:underline">
                View All <ArrowRight size={14} className="ml-xs" />
              </button>
            </div>
            {loading && <div className="p-lg text-center text-on-surface-variant text-body-md">Loading campaigns...</div>}
            {error && <div className="p-lg text-center text-error text-body-md">{error}</div>}
            {!loading && !error && campaigns.length === 0 && (
              <div className="p-lg text-center text-on-surface-variant text-body-md">No campaigns found. Create your first campaign.</div>
            )}
            {!loading && !error && campaigns.length > 0 && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-lg py-md text-label-md text-on-surface-variant">Campaign</th>
                  <th className="px-lg py-md text-label-md text-on-surface-variant">Applicants</th>
                  <th className="px-lg py-md text-label-md text-on-surface-variant text-center">Trend</th>
                  <th className="px-lg py-md text-label-md text-on-surface-variant">Status</th>
                  <th className="px-lg py-md text-label-md text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-lg py-md">
                      <div className="flex flex-col">
                        <span className="text-title-md text-on-surface">{campaign.title}</span>
                        <span className="text-body-sm text-on-surface-variant">{campaign.description || campaign.title}</span>
                      </div>
                    </td>
                    <td className="px-lg py-md text-body-md text-on-surface">
                      {campaign._count?.applications || campaign.applicantCount || 0} <span className="text-on-surface-variant ml-xs">applicants</span>
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex items-center justify-center space-x-1">
                        {[30, 60, 80, 50].map((height, i) => (
                          <div
                            key={i}
                            className="w-1 bg-primary rounded-full"
                            style={{ height: `${height}px`, opacity: campaign.status === "CLOSED" ? 0.3 : 1 }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-lg py-md">
                      <span
                        className={`inline-flex items-center px-md py-xs rounded-full text-label-md uppercase tracking-tight ${
                          campaign.status === "OPEN"
                            ? "bg-primary-fixed text-primary"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-lg py-md text-right">
                      <button className="text-on-surface-variant hover:text-primary p-xs rounded hover:bg-surface-container-high">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-lg p-lg">
              <h3 className="text-title-md text-on-surface mb-lg">Recent Interviews</h3>
              <div className="space-y-md">
                {mockInterviews.map((interview) => (
                  <div
                    key={interview.name}
                    className="flex items-center justify-between p-md bg-surface border border-outline-variant rounded-lg"
                  >
                    <div className="flex items-center space-x-md">
                      <div className="h-12 w-12 bg-surface-variant rounded flex items-center justify-center">
                        <User className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className="text-body-md font-semibold text-on-surface">{interview.name}</p>
                        <p className="text-body-sm text-on-surface-variant">
                          {interview.role} • {interview.time}
                        </p>
                      </div>
                    </div>
                    <button
                      className={`px-md py-sm rounded text-label-sm ${
                        interview.primary
                          ? "bg-primary text-on-primary"
                          : "border border-primary text-primary"
                      }`}
                    >
                      {interview.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary-container text-on-primary-container rounded-lg p-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-title-md mb-md">Integrity Insights</h3>
                <p className="text-body-sm mb-lg opacity-90">
                  Review candidates with flagged assessment behavior to maintain hiring standards.
                </p>
                <div className="bg-surface-container-lowest/10 p-md rounded-lg mb-lg border border-white/20">
                  <div className="flex justify-between items-center mb-xs">
                    <span className="text-label-md">Global Trust Score</span>
                    <span className="text-label-md">98.2%</span>
                  </div>
                  <div className="w-full bg-surface-container-lowest/30 rounded-full h-2">
                    <div className="bg-on-primary-container h-2 rounded-full" style={{ width: "98.2%" }} />
                  </div>
                </div>
                <button className="w-full bg-surface text-primary py-sm rounded text-label-md hover:bg-surface-container-low transition-all">
                  Review Flagged Cases
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, warning }) {
  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant p-lg rounded-lg flex items-center space-x-lg ${
        warning ? "border-l-4 border-l-secondary" : ""
      }`}
    >
      <div className={`p-md rounded-lg ${warning ? "bg-secondary-fixed" : "bg-primary-fixed"}`}>
        <Icon className={warning ? "text-secondary" : "text-primary"} size={24} />
      </div>
      <div>
        <p className="text-label-md text-on-surface-variant">{label}</p>
        <p className="text-display-sm text-on-surface font-bold">{value}</p>
      </div>
    </div>
  );
}