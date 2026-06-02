import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { User, Bell, Lock, Shield, Save, Plus, X, Check, Mail, UploadCloud } from "lucide-react";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield }
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { success } = useToast();
  const role = user?.role || "candidate";
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

  const handleSave = (e) => {
    e.preventDefault();
    success("Settings saved", { title: "Preferences updated" });
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
    <div className="app-shell">
      <Sidebar role={role} />
      <main className="workspace">
        <TopBar
          title="Settings"
          eyebrow="Workspace"
          showSearch={false}
          actions={
            <button type="submit" form="settings-form" className="primary-button">
              <Save size={16} />
              <span>Save changes</span>
            </button>
          }
        />

        <form id="settings-form" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          <aside className="bg-white border border-outline rounded-2xl p-2 h-fit">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={
                    "w-full flex items-center gap-2 px-3 h-11 rounded-lg text-sm font-medium transition-colors text-left mb-1 " +
                    (activeSection === section.id
                      ? "bg-primary text-white"
                      : "text-on-surface-variant hover:bg-surface-light")
                  }
                >
                  <Icon size={18} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </aside>

          <section className="bg-white border border-outline rounded-2xl p-6 md:p-8 animate-fade-in">
            {activeSection === "profile" ? (
              <div className="stack">
                <div>
                  <h2 className="text-title-lg">Profile</h2>
                  <p className="text-sm text-on-surface-variant">Update how your name, bio, and avatar appear across the workspace.</p>
                </div>

                <div className="flex items-start gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-3xl font-bold">
                      {((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || (user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <button type="button" className="secondary-button text-sm">Change avatar</button>
                      <button type="button" className="tertiary-button text-sm text-error-coral">Remove</button>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-row">
                    <label htmlFor="settings-first">First name</label>
                    <input id="settings-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
                  </div>
                  <div className="form-row">
                    <label htmlFor="settings-last">Last name</label>
                    <input id="settings-last" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
                  </div>
                  <div className="form-row md:col-span-2">
                    <label htmlFor="settings-email">Email address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                      <input
                        id="settings-email"
                        value={email}
                        disabled
                        className="w-full pl-10"
                      />
                    </div>
                    <span className="helper">Email is managed by your account admin.</span>
                  </div>
                  <div className="form-row md:col-span-2">
                    <label htmlFor="settings-bio">Bio</label>
                    <textarea
                      id="settings-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Write a few sentences about yourself."
                      className="resize-none"
                    />
                  </div>
                </div>

                <div className="bg-surface border border-outline rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-title-md">Recruiting specialties</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">Tags help candidates find you in the directory.</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {specialties.length === 0 ? (
                      <span className="text-sm text-on-surface-variant italic">No specialties yet.</span>
                    ) : (
                      specialties.map((s) => (
                        <span
                          key={s}
                          className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => removeSpecialty(s)}
                            className="hover:text-error-coral transition-colors"
                            aria-label={`Remove ${s}`}
                          >
                            <X size={14} />
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-primary text-sm font-semibold hover:text-on-primary-fixed-variant inline-flex items-center gap-1"
                    >
                      <Plus size={16} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-title-md mb-3">Public resume</h3>
                  <label
                    htmlFor="settings-resume"
                    className="border-2 border-dashed border-outline rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-surface-light transition-colors cursor-pointer bg-surface"
                  >
                    <UploadCloud size={36} className="text-on-surface-variant mb-2" />
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
                <div>
                  <h2 className="text-title-lg">Account</h2>
                  <p className="text-sm text-on-surface-variant">Manage security and connected accounts.</p>
                </div>
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
                    <div className="flex items-center justify-between p-4 border border-outline rounded-lg bg-white">
                      <div>
                        <strong className="text-sm">Google</strong>
                        <p className="text-xs text-on-surface-variant m-0">Signed in for SSO</p>
                      </div>
                      <span className="status-chip success">Connected</span>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-outline rounded-lg bg-white">
                      <div>
                        <strong className="text-sm">GitHub</strong>
                        <p className="text-xs text-on-surface-variant m-0">Used for code imports</p>
                      </div>
                      <button type="button" className="tertiary-button text-sm">Connect</button>
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <label>Sign out everywhere</label>
                  <button type="button" className="tertiary-button w-fit text-error-coral">Revoke all sessions</button>
                  <span className="helper">Sign out of all devices at once.</span>
                </div>
              </div>
            ) : null}

            {activeSection === "notifications" ? (
              <div className="stack">
                <div>
                  <h2 className="text-title-lg">Notifications</h2>
                  <p className="text-sm text-on-surface-variant">Choose which email updates you'd like to receive.</p>
                </div>
                <div className="stack">
                  {[
                    { key: "applications", label: "New applications", desc: "When a candidate applies to your campaign." },
                    { key: "interviews", label: "Interview updates", desc: "Reminders and changes to scheduled interviews." },
                    { key: "results", label: "Assessment results", desc: "When candidates complete their assessment." },
                    { key: "digest", label: "Weekly digest", desc: "A summary of activity every Monday morning." }
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-3 p-4 border border-outline rounded-lg bg-white cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={emailNotifs[item.key]}
                        onChange={(e) => setEmailNotifs({ ...emailNotifs, [item.key]: e.target.checked })}
                        className="mt-1 w-4 h-4 accent-primary"
                      />
                      <div className="flex-1">
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
                <div>
                  <h2 className="text-title-lg">Privacy</h2>
                  <p className="text-sm text-on-surface-variant">Control how your profile and results are shared.</p>
                </div>
                <div className="stack">
                  <label className="flex items-start gap-3 p-4 border border-outline rounded-lg bg-white cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={privateProfile}
                      onChange={(e) => setPrivateProfile(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-primary"
                    />
                    <div className="flex-1">
                      <strong className="text-sm block">Private profile</strong>
                      <span className="text-xs text-on-surface-variant">Hide my profile from the public directory.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 border border-outline rounded-lg bg-white cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={shareResults}
                      onChange={(e) => setShareResults(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-primary"
                    />
                    <div className="flex-1">
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
          </section>
        </form>
      </main>
    </div>
  );
}
