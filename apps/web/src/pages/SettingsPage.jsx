import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import { useAuth } from "../hooks/useAuth";
import { SettingsSidebar } from "../components/SettingsPage/SettingsSidebar";
import { ProfileForm } from "../components/SettingsPage/ProfileForm";
import { AlertCircle, X } from "lucide-react";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const role = user?.role || "CANDIDATE";
  const isRecruiter = role === "RECRUITER" || role === "ADMIN";
  const [activeSection, setActiveSection] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [resetForm, setResetForm] = useState(null);
  
  const navigate = useNavigate();
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingSection, setPendingSection] = useState(null);
  const [pendingRoute, setPendingRoute] = useState(null);

  useEffect(() => {
    if (isDirty) {
      window.__triggerUnsavedModal = (to) => {
        setPendingRoute(to);
        setShowUnsavedModal(true);
      };
    } else {
      window.__triggerUnsavedModal = null;
    }
    return () => {
      window.__triggerUnsavedModal = null;
    };
  }, [isDirty]);

  const displayModal = showUnsavedModal;

  const handleSectionChange = (section) => {
    if (isDirty) {
      setPendingSection(section);
      setShowUnsavedModal(true);
    } else {
      setActiveSection(section);
    }
  };

  const confirmDiscard = () => {
    if (resetForm) resetForm();
    if (showUnsavedModal) {
      setShowUnsavedModal(false);
      if (pendingSection) {
        setActiveSection(pendingSection);
        setPendingSection(null);
      }
      if (pendingRoute) {
        navigate(pendingRoute);
        setPendingRoute(null);
      }
    }
  };

  const cancelDiscard = () => {
    if (showUnsavedModal) {
      setShowUnsavedModal(false);
      setPendingSection(null);
      setPendingRoute(null);
    }
  };

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
          showNotifications={false}
          actions={
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => { if (resetForm) resetForm(); }}
                disabled={!isDirty || saving}
                className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Discard Changes
              </button>
              <button 
                type="submit" 
                form="settings-form" 
                disabled={saving || !isDirty} 
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-blue-500/20 disabled:opacity-60 disabled:hover:bg-[#2563EB] disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          }
        />

        <div className="p-8 max-w-6xl mx-auto h-full flex flex-col items-center justify-center">
          <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex min-h-[650px]">
            <SettingsSidebar 
              initials={initials} 
              activeSection={activeSection} 
              setActiveSection={handleSectionChange}
              isRecruiter={isRecruiter}
            />

            <section className="flex-1 p-12 overflow-y-auto bg-white">
              <ProfileForm 
                user={user} 
                updateUser={updateUser} 
                isRecruiter={isRecruiter} 
                initials={initials} 
                saving={saving} 
                setSaving={setSaving}
                activeSection={activeSection}
                setIsDirty={setIsDirty}
                setResetForm={setResetForm}
              />
            </section>
          </div>
        </div>
      </main>

      {/* UNSAVED CHANGES MODAL */}
      {displayModal && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#DC2626]">
                  <AlertCircle size={20} />
                </div>
                <h3 className="text-lg font-bold text-on-surface">Unsaved Changes</h3>
              </div>
              <button onClick={cancelDiscard} className="text-on-surface-variant hover:text-on-surface hover:bg-outline-variant/20 p-1.5 rounded-md transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                You have unsaved changes. If you switch {pendingRoute ? "pages" : "sections"} now, your edits will be discarded. Do you want to discard your changes?
              </p>
            </div>
            <div className="p-6 bg-[#F8FAFC] border-t border-outline-variant/30 flex justify-end gap-3">
              <button onClick={cancelDiscard} className="px-5 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-outline-variant/20 rounded-lg transition-colors">
                Keep Editing
              </button>
              <button onClick={confirmDiscard} className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm shadow-red-500/20 transition-all">
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
