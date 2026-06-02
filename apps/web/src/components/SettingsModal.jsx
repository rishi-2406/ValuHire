import { useState } from "react";
import { X, User, Bell, Lock, Shield, Check, Mail, Plus, UploadCloud } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield }
];

export default function SettingsModal({ open, onClose }) {
  const { user } = useAuth();
  const { success } = useToast();
  const [activeSection, setActiveSection] = useState("profile");
  const [firstName, setFirstName] = useState((user?.name || "").split(" ")[0] || "");
  const [lastName, setLastName] = useState((user?.name || "").split(" ").slice(1).join(" "));
  const [email] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [specialties, setSpecialties] = useState(user?.specialties || ["Engineering", "SaaS"]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [resumeName, setResumeName] = useState(user?.resumeName || "");
  const [emailNotifs, setEmailNotifs] = useState({
    applications: true,
    interviews: true,
    results: true,
    digest: false
  });
  const [privateProfile, setPrivateProfile] = useState(user?.privateProfile ?? false);
  const [shareResults, setShareResults] = useState(user?.shareResults ?? true);

  if (!open) return null;

  const handleSave = (e) => {
    e.preventDefault();
    success("Settings saved", { title: "Preferences updated" });
    onClose?.();
  };

  const addSpecialty = () => {
    const v = newSpecialty.trim();
    if (!v || specialties.includes(v)) {
      setNewSpecialty("");
      return;
    }
    setSpecialties([...specialties, v]);
    setNewSpecialty("");
  };

  const removeSpecialty = (s) => setSpecialties(specialties.filter((x) => x !== s));

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setResumeName(file.name);
  };

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
            {activeSection === "profile" ? (
              <div className="stack">
                <h3 className="text-title-md">Profile</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-2xl font-bold">
                    {((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || (user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <button type="button" className="secondary-button text-sm">Change avatar</button>
                    <p className="text-xs text-on-surface-variant mt-1">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-row">
                    <label htmlFor="settings-first">First name</label>
                    <input id="settings-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label htmlFor="settings-last">Last name</label>
                    <input id="settings-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="settings-email">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    <input id="settings-email" value={email} disabled className="w-full pl-10" />
                  </div>
                  <span className="helper">Email is managed by your account admin.</span>
                </div>
                <div className="form-row">
                  <label htmlFor="settings-bio">Bio</label>
                  <textarea
                    id="settings-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Write a few sentences about yourself."
                    className="resize-none"
                  />
                </div>
                <div className="bg-surface border border-outline rounded-2xl p-4">
                  <h4 className="text-sm font-semibold mb-1">Recruiting specialties</h4>
                  <p className="text-xs text-on-surface-variant mb-3">Tags help candidates find you in the directory.</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {specialties.length === 0 ? (
                      <span className="text-xs text-on-surface-variant italic">No specialties yet.</span>
                    ) : (
                      specialties.map((s) => (
                        <span
                          key={s}
                          className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => removeSpecialty(s)}
                            className="hover:text-error-coral"
                            aria-label={`Remove ${s}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSpecialty();
                        }
                      }}
                      placeholder="Add a skill…"
                    />
                    <button
                      type="button"
                      onClick={addSpecialty}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-primary text-sm font-semibold inline-flex items-center gap-1"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Public resume</h4>
                  <label
                    htmlFor="settings-resume"
                    className="border-2 border-dashed border-outline rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-surface-light transition-colors cursor-pointer bg-surface"
                  >
                    <UploadCloud size={28} className="text-on-surface-variant mb-1" />
                    <p className="text-sm font-semibold text-on-surface">
                      {resumeName ? resumeName : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">PDF, DOCX up to 5MB</p>
                    <input
                      id="settings-resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {activeSection === "account" ? (
              <div className="stack">
                <h3 className="text-title-md">Account</h3>
                <div className="form-row">
                  <label>Password</label>
                  <button type="button" className="secondary-button w-fit">Change password</button>
                </div>
                <div className="form-row">
                  <label>Two-factor authentication</label>
                  <button type="button" className="secondary-button w-fit">Enable 2FA</button>
                  <span className="helper">Add an extra layer of security to your account.</span>
                </div>
                <div className="form-row">
                  <label>Connected accounts</label>
                  <div className="stack">
                    <div className="flex items-center justify-between p-3 border border-outline rounded-lg bg-white">
                      <div>
                        <strong className="text-sm">Google</strong>
                        <p className="text-xs text-on-surface-variant m-0">Signed in for SSO</p>
                      </div>
                      <span className="status-chip success">Connected</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-outline rounded-lg bg-white">
                      <div>
                        <strong className="text-sm">GitHub</strong>
                        <p className="text-xs text-on-surface-variant m-0">Used for code imports</p>
                      </div>
                      <button type="button" className="tertiary-button text-sm">Connect</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {activeSection === "notifications" ? (
              <div className="stack">
                <h3 className="text-title-md">Notifications</h3>
                <p className="text-sm text-on-surface-variant -mt-2">Choose which email updates you'd like to receive.</p>
                <div className="stack">
                  {[
                    { key: "applications", label: "New applications", desc: "When a candidate applies to your campaign." },
                    { key: "interviews", label: "Interview updates", desc: "Reminders and changes to scheduled interviews." },
                    { key: "results", label: "Assessment results", desc: "When candidates complete their assessment." },
                    { key: "digest", label: "Weekly digest", desc: "A summary of activity every Monday morning." }
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-3 p-3 border border-outline rounded-lg bg-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifs[item.key]}
                        onChange={(e) => setEmailNotifs({ ...emailNotifs, [item.key]: e.target.checked })}
                        className="mt-1"
                      />
                      <div>
                        <strong className="text-sm block">{item.label}</strong>
                        <span className="text-xs text-on-surface-variant">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {activeSection === "privacy" ? (
              <div className="stack">
                <h3 className="text-title-md">Privacy</h3>
                <p className="text-sm text-on-surface-variant -mt-2">Control how your profile and results are shared.</p>
                <div className="stack">
                  <label className="flex items-start gap-3 p-3 border border-outline rounded-lg bg-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privateProfile}
                      onChange={(e) => setPrivateProfile(e.target.checked)}
                      className="mt-1"
                    />
                    <div>
                      <strong className="text-sm block">Private profile</strong>
                      <span className="text-xs text-on-surface-variant">Hide my profile from the public directory.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-outline rounded-lg bg-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareResults}
                      onChange={(e) => setShareResults(e.target.checked)}
                      className="mt-1"
                    />
                    <div>
                      <strong className="text-sm block">Share assessment results</strong>
                      <span className="text-xs text-on-surface-variant">Let recruiters see your detailed assessment breakdown.</span>
                    </div>
                  </label>
                </div>
                <div className="form-row">
                  <label>Data export</label>
                  <button type="button" className="secondary-button w-fit inline-flex items-center gap-2">
                    <Check size={16} />
                    <span>Request a copy of my data</span>
                  </button>
                  <span className="helper">We'll email a downloadable archive within 24 hours.</span>
                </div>
              </div>
            ) : null}
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
