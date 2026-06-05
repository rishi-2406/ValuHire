import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import { useAuth } from "../hooks/useAuth";
import { SettingsSidebar } from "../components/SettingsPage/SettingsSidebar";
import { ProfileForm } from "../components/SettingsPage/ProfileForm";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const role = user?.role || "CANDIDATE";
  const isRecruiter = role === "RECRUITER" || role === "ADMIN";
  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);

  const nameParts = (user?.name || "").split(" ");
  const initials = ((nameParts[0]?.[0] || "") + (nameParts[1]?.[0] || "")).toUpperCase() || (user?.email?.[0] || "?").toUpperCase();

  return (
    <div className="app-shell bg-[#F8FAFC]">
      <Sidebar role={role} />
      <main className="workspace">
        <TopBar
          title=""
          eyebrow=""
          showSearch={false}
          actions={
            <div className="flex gap-3">
              <button type="button" className="bg-white border border-outline-variant/60 hover:bg-surface-light text-on-surface px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm">
                Discard Changes
              </button>
              <button type="submit" form="settings-form" disabled={saving} className="bg-[#059669] hover:bg-[#047857] text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-60">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          }
        />

        <div className="p-8 max-w-5xl mx-auto h-full flex flex-col items-center justify-center">
          <div className="w-full bg-white rounded-xl shadow-lg border border-outline-variant/30 overflow-hidden flex min-h-[600px]">
            <SettingsSidebar 
              initials={initials} 
              activeSection={activeSection} 
              setActiveSection={setActiveSection} 
            />

            <section className="flex-1 p-10 overflow-y-auto">
              {activeSection === "profile" && (
                <ProfileForm 
                  user={user} 
                  updateUser={updateUser} 
                  isRecruiter={isRecruiter} 
                  initials={initials} 
                  saving={saving} 
                  setSaving={setSaving} 
                />
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
