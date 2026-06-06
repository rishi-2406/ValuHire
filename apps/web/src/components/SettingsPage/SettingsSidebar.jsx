import React from "react";
import { User, FileText, Link as LinkIcon, Building2 } from "lucide-react";

export function SettingsSidebar({ initials, activeSection, setActiveSection, isRecruiter }) {
  const SECTIONS = isRecruiter 
    ? [
        { id: "personal", label: "Personal Info", icon: User },
        { id: "company", label: "Company Info", icon: Building2 }
      ]
    : [
        { id: "personal", label: "Personal Info", icon: User },
        { id: "resume", label: "Resume & Skills", icon: FileText },
        { id: "profiles", label: "Online Profiles", icon: LinkIcon }
      ];

  return (
    <aside className="w-72 bg-white border-r border-outline-variant/30 p-8 flex flex-col shrink-0">
      <nav className="flex flex-col gap-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-left group ${
                isActive 
                  ? "bg-[#EFF6FF] text-[#1D4ED8]" 
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <Icon size={18} className={`transition-colors ${isActive ? "text-[#2563EB]" : "text-[#94A3B8] group-hover:text-[#64748B]"}`} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
