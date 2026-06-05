import React from "react";
import { Building2, XCircle, CheckCircle2, Eye } from "lucide-react";

export function PendingCompaniesTable({
  companyFilter,
  setCompanyFilter,
  COMPANY_FILTERS,
  loading,
  filteredCompanies,
  handleReject,
  handleApprove,
  busyId
}) {
  return (
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
                      {company.recruiters?.length || 0} recruiters, {company.campaigns?.length || 0} campaigns
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
  );
}
