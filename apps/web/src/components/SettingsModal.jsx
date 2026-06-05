import { X, User, Bell, Lock, Shield, Check } from "lucide-react";
import { useSettingsModal } from "../hooks/useSettingsModal";
import { ProfileSection } from "../components/SettingsModal/ProfileSection";
import { AccountSection, NotificationsSection, PrivacySection } from "../components/SettingsModal/OtherSections";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield }
];

export default function SettingsModal({ open, onClose }) {
  const {
    user,
    activeSection, setActiveSection,
    firstName, setFirstName,
    lastName, setLastName,
    email,
    bio, setBio,
    specialties,
    newSpecialty, setNewSpecialty,
    resumeName,
    emailNotifs, setEmailNotifs,
    privateProfile, setPrivateProfile,
    shareResults, setShareResults,
    handleSave,
    addSpecialty, removeSpecialty, handleResumeChange
  } = useSettingsModal(onClose);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSave}
        style={{ maxWidth: 720, height: "min(80vh, 720px)" }}
      >
        <div className="modal-header">
          <div>
            <h2 id="settings-title">Settings</h2>
            <p>Manage your account and workspace preferences.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-[200px_1fr] overflow-hidden">
          <nav className="border-r border-outline bg-surface-light p-3 overflow-y-auto" aria-label="Settings sections">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={
                    "w-full flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium transition-colors text-left mb-1 " +
                    (activeSection === section.id
                      ? "bg-primary text-white"
                      : "text-on-surface-variant hover:bg-white")
                  }
                >
                  <Icon size={16} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="overflow-y-auto p-6">
            {activeSection === "profile" && (
              <ProfileSection 
                user={user}
                firstName={firstName} setFirstName={setFirstName}
                lastName={lastName} setLastName={setLastName}
                email={email}
                bio={bio} setBio={setBio}
                specialties={specialties}
                newSpecialty={newSpecialty} setNewSpecialty={setNewSpecialty}
                addSpecialty={addSpecialty} removeSpecialty={removeSpecialty}
                resumeName={resumeName} handleResumeChange={handleResumeChange}
              />
            )}

            {activeSection === "account" && <AccountSection />}

            {activeSection === "notifications" && (
              <NotificationsSection 
                emailNotifs={emailNotifs} 
                setEmailNotifs={setEmailNotifs} 
              />
            )}

            {activeSection === "privacy" && (
              <PrivacySection 
                privateProfile={privateProfile} setPrivateProfile={setPrivateProfile}
                shareResults={shareResults} setShareResults={setShareResults}
              />
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="secondary-button">Cancel</button>
          <button type="submit" className="primary-button">
            <Check size={16} />
            <span>Save changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
