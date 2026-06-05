import React from "react";
import { User } from "lucide-react";

export const SECTIONS = [
  { id: "profile", label: "Profile", icon: User }
];

export function SettingsSidebar({ initials, activeSection, setActiveSection }) {
  return (
    <aside className="w-64 bg-[#F8FAFC] border-r border-outline-variant/50 p-6 flex flex-col shrink-0">
      <div className="mb-10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xl font-bold">
          {initials}
        </div>
        <div>
          <h2 className="font-bold text-on-surface text-lg leading-tight">ValuHire Settings</h2>
          <p className="text-sm text-on-surface-variant">Manage your account</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors text-left ${isActive ? "bg-[#2563EB] text-white" : "text-on-surface-variant hover:bg-surface-container-high"}`}
            >
              <Icon size={18} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
