import React from "react";
import { Shield, CheckCircle2, UploadCloud, Link as LinkIcon, Building2, User, FileText } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { SpecialtiesSection } from "./SpecialtiesSection";
import { OnlineProfilesSection } from "./OnlineProfilesSection";
import { CompanyInfoSection } from "./CompanyInfoSection";
import { useProfileForm } from "../../hooks/useProfileForm";

export function ProfileForm({ user, updateUser, isRecruiter, initials, saving, setSaving, activeSection, setIsDirty, setResetForm }) {
  const toast = useToast();
  
  const {
    firstName, setFirstName,
    lastName, setLastName,
    email,
    bio, setBio,
    specialties, setSpecialties,
    avatarUrl, setAvatarUrl,
    resumeUrl, setResumeUrl,
    urlErrors, setUrlErrors,
    companyName, setCompanyName,
    companyWebsite, setCompanyWebsite,
    fileInputRef,
    URL_FIELDS,
    handleSave,
    handleAvatarChange,
    handleResumeChange,
    isDirty,
    resetForm
  } = useProfileForm(user, updateUser, isRecruiter, toast, setSaving);

  React.useEffect(() => {
    if (setIsDirty) setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  React.useEffect(() => {
    if (setResetForm) setResetForm(() => resetForm);
  }, [resetForm, setResetForm]);

  const handleViewResume = () => {
    if (!resumeUrl || !resumeUrl.startsWith("data:")) {
      window.open(resumeUrl, "_blank");
      return;
    }
    try {
      const arr = resumeUrl.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch(e) {
      toast.error("Could not open resume document.");
    }
  };

  return (
    <form id="settings-form" onSubmit={handleSave} className="max-w-2xl animate-fade-in-up">
      {/* PERSONAL INFO SECTION */}
      {activeSection === "personal" && (
        <div className="space-y-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2 tracking-tight">Personal Information</h1>
            <p className="text-[#64748B] font-medium text-sm">Update your avatar, name, and basic contact details.</p>
          </div>

          {!isRecruiter && (
            <div className="flex flex-col sm:flex-row items-center gap-8 bg-[#F8FAFC] border border-outline-variant/40 p-8 rounded-3xl shadow-sm">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] text-[#2563EB] flex items-center justify-center text-4xl font-black border-4 border-white shadow-lg overflow-hidden transition-transform group-hover:scale-105">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-sm font-bold text-[#0F172A] mb-1">Profile Photo</h3>
                <p className="text-xs text-[#64748B] mb-4">We recommend an image of at least 400x400. Max 1MB.</p>
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#0F172A] px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm">
                    {avatarUrl ? "Change Photo" : "Upload Photo"}
                  </button>
                  <button type="button" onClick={() => setAvatarUrl("")} className="text-[#EF4444] hover:text-[#B91C1C] hover:bg-red-50 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 text-[#0F172A] font-medium transition-all group-hover:border-[#CBD5E1]"
              />
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 text-[#0F172A] font-medium transition-all group-hover:border-[#CBD5E1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative group">
              <input
                type="email"
                value={email}
                disabled
                className="w-full border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-3.5 text-sm bg-[#F8FAFC] focus:outline-none text-[#64748B] font-medium cursor-not-allowed"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <p className="text-xs text-[#94A3B8] font-medium mt-2 flex items-center gap-1.5"><Shield size={14} /> Email cannot be changed after registration.</p>
          </div>

          {!isRecruiter && (
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Professional Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                placeholder="Write a few sentences about yourself, your experience, and your goals..."
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3.5 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 text-[#0F172A] font-medium transition-all hover:border-[#CBD5E1] resize-none leading-relaxed"
              />
            </div>
          )}
        </div>
      )}

      {/* RESUME & SKILLS SECTION */}
      {activeSection === "resume" && !isRecruiter && (() => {
        const hasValidResume = typeof resumeUrl === 'string' && resumeUrl.length > 10 && resumeUrl !== "null" && resumeUrl !== "undefined";
        return (
          <div className="space-y-10">
            <div>
              <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2 tracking-tight">Resume & Skills</h1>
              <p className="text-[#64748B] font-medium text-sm">Upload your latest CV and highlight your core competencies.</p>
            </div>

            <div className="border border-[#E2E8F0] bg-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center border border-[#E2E8F0] shrink-0">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Resume Document</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">PDF format, maximum 5MB size limit.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  id="resume-upload"
                  onChange={handleResumeChange}
                  className="hidden"
                />
                
                {hasValidResume && (
                  <button 
                    type="button"
                    onClick={handleViewResume}
                    className="bg-white border border-[#BFDBFE] hover:bg-[#EFF6FF] text-[#2563EB] px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2"
                  >
                    View Resume
                  </button>
                )}

                <button 
                  type="button" 
                  onClick={() => document.getElementById("resume-upload").click()} 
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2"
                >
                  <UploadCloud size={16} /> {hasValidResume ? "Update Resume" : "Upload Resume"}
                </button>
              </div>
            </div>

            <SpecialtiesSection specialties={specialties} setSpecialties={setSpecialties} />
          </div>
        );
      })()}

      {/* ONLINE PROFILES SECTION */}
      {activeSection === "profiles" && !isRecruiter && (
        <div className="space-y-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2 tracking-tight">Online Profiles</h1>
            <p className="text-[#64748B] font-medium text-sm">Link your external portfolios, GitHub, and competitive programming profiles.</p>
          </div>
          
          <div className="bg-white border border-[#E2E8F0] p-8 rounded-3xl shadow-sm">
            <OnlineProfilesSection urlFields={URL_FIELDS} urlErrors={urlErrors} setUrlErrors={setUrlErrors} />
          </div>
        </div>
      )}

      {/* COMPANY INFO SECTION */}
      {activeSection === "company" && isRecruiter && (
        <div className="space-y-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2 tracking-tight">Company Info</h1>
            <p className="text-[#64748B] font-medium text-sm">Manage your organization's details.</p>
          </div>
          
          <div className="bg-white border border-[#E2E8F0] p-8 rounded-3xl shadow-sm">
            <CompanyInfoSection
              companyName={companyName}
              setCompanyName={setCompanyName}
              companyWebsite={companyWebsite}
              setCompanyWebsite={setCompanyWebsite}
            />
          </div>
        </div>
      )}

    </form>
  );
}
