import React from "react";
import { Shield, CheckCircle2 } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { SpecialtiesSection } from "./SpecialtiesSection";
import { OnlineProfilesSection } from "./OnlineProfilesSection";
import { CompanyInfoSection } from "./CompanyInfoSection";
import { useProfileForm } from "../../hooks/useProfileForm";

export function ProfileForm({ user, updateUser, isRecruiter, initials, saving, setSaving }) {
  const toast = useToast();
  
  const {
    firstName, setFirstName,
    lastName, setLastName,
    email,
    bio, setBio,
    specialties, setSpecialties,
    avatarUrl, setAvatarUrl,
    urlErrors, setUrlErrors,
    companyName, setCompanyName,
    companyWebsite, setCompanyWebsite,
    fileInputRef,
    URL_FIELDS,
    handleSave,
    handleAvatarChange
  } = useProfileForm(user, updateUser, isRecruiter, toast, setSaving);

  return (
    <form id="settings-form" onSubmit={handleSave} className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Profile Information</h1>
        <p className="text-on-surface-variant">Update your personal details here.</p>
      </div>

      <div className="h-px w-full bg-outline-variant/50 mb-8" />

      {/* Avatar */}
      {!isRecruiter && (
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-[#E0E7FF] text-[#2563EB] flex items-center justify-center text-3xl font-bold border-2 border-transparent shadow-sm overflow-hidden">
            {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : initials}
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <input
                type="file"
                accept="image/png, image/jpeg, image/gif"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white border border-outline-variant hover:bg-surface-light text-on-surface px-4 py-2 rounded font-semibold text-sm transition-colors">
                Change avatar
              </button>
              <button type="button" onClick={() => setAvatarUrl("")} className="text-[#DC2626] hover:text-[#B91C1C] font-semibold text-sm transition-colors">
                Remove
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">JPG, GIF or PNG. 1MB max.</p>
          </div>
        </div>
      )}

      {/* Resume Upload */}
      {!isRecruiter && (
        <div className="flex items-center gap-6 mb-8 bg-[#F8FAFC] border border-outline-variant/50 p-6 rounded-xl">
          <div className="w-14 h-14 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-2xl border border-[#BFDBFE]">
            <Shield size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-on-surface mb-1">Resume / CV</h3>
            <p className="text-xs text-on-surface-variant mb-3">Upload your latest resume. PDF up to 5MB.</p>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="application/pdf"
                id="resume-upload"
                onChange={(e) => {
                   const file = e.target.files?.[0];
                   if(file) {
                      toast.success("Resume uploaded temporarily (mocked)");
                      updateUser({ ...user, resumeUrl: URL.createObjectURL(file) });
                   }
                }}
                className="hidden"
              />
              <button type="button" onClick={() => document.getElementById("resume-upload").click()} className="bg-white border border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] px-4 py-2 rounded font-semibold text-sm transition-colors">
                Upload Resume
              </button>
              {user?.resumeUrl && (
                <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#059669] hover:underline flex items-center gap-1">
                  <CheckCircle2 size={16} /> Attached
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="w-full border border-outline-variant/80 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface font-medium"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="w-full border border-outline-variant/80 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface font-medium"
          />
        </div>
      </div>

      {/* Email */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-on-surface mb-2">Email Address</label>
        <div className="relative">
          <input
            type="email"
            value={email}
            disabled
            className="w-full border border-outline-variant/80 rounded pl-10 pr-4 py-2.5 text-sm bg-surface-container-low focus:outline-none text-on-surface-variant font-medium cursor-not-allowed"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">Email cannot be changed after registration.</p>
      </div>

      {/* Bio */}
      {!isRecruiter && (
        <div className="mb-8">
          <label className="block text-sm font-semibold text-on-surface mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={4}
            placeholder="Write a few sentences about yourself..."
            className="w-full border border-outline-variant/80 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-on-surface resize-none font-medium leading-relaxed"
          />
        </div>
      )}

      {/* Specialties */}
      {!isRecruiter && (
        <SpecialtiesSection specialties={specialties} setSpecialties={setSpecialties} />
      )}

      {/* Online Profiles */}
      {!isRecruiter && (
        <OnlineProfilesSection urlFields={URL_FIELDS} urlErrors={urlErrors} setUrlErrors={setUrlErrors} />
      )}

      {isRecruiter && (
        <CompanyInfoSection
          companyName={companyName}
          setCompanyName={setCompanyName}
          companyWebsite={companyWebsite}
          setCompanyWebsite={setCompanyWebsite}
        />
      )}

      <div className="mt-8 flex justify-end gap-3 border-t border-outline-variant/50 pt-6">
        <button type="button" className="bg-white border border-outline-variant/80 hover:bg-surface-light text-on-surface px-6 py-2.5 rounded font-bold text-sm transition-colors">
          Discard Changes
        </button>
        <button type="submit" disabled={saving} className="bg-[#41765B] hover:bg-[#2F5A44] text-white px-6 py-2.5 rounded font-bold text-sm transition-colors shadow-sm disabled:opacity-60">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
