import React from "react";
import { Mail, X, Plus, UploadCloud } from "lucide-react";

export function ProfileSection({
  user,
  firstName, setFirstName,
  lastName, setLastName,
  email,
  bio, setBio,
  specialties,
  newSpecialty, setNewSpecialty,
  addSpecialty, removeSpecialty,
  resumeName, handleResumeChange
}) {
  return (
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
  );
}
