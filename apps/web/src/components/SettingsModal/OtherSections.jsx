import React from "react";
import { Check } from "lucide-react";

export function AccountSection() {
  return (
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
  );
}

export function NotificationsSection({ emailNotifs, setEmailNotifs }) {
  return (
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
  );
}

export function PrivacySection({ privateProfile, setPrivateProfile, shareResults, setShareResults }) {
  return (
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
  );
}
