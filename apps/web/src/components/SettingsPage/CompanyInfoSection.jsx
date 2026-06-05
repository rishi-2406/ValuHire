import React from "react";

export function CompanyInfoSection({ companyName, setCompanyName, companyWebsite, setCompanyWebsite }) {
  return (
    <div className="border border-outline-variant/80 rounded-lg p-6 bg-[#F8FAFC] mt-8">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-bold text-on-surface">Company Information</h3>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Acme Corp"
            className="w-full border border-outline-variant/80 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface font-medium"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Company Website</label>
          <input
            type="url"
            value={companyWebsite}
            onChange={e => setCompanyWebsite(e.target.value)}
            placeholder="https://acme.com"
            className="w-full border border-outline-variant/80 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface font-medium"
          />
        </div>
      </div>
    </div>
  );
}
