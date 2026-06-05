import { useState, useRef } from "react";
import { userService, companyService } from "../services/api";

export function useProfileForm(user, updateUser, isRecruiter, toast, setSaving) {
  const nameParts = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [email] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [specialties, setSpecialties] = useState(user?.skills || user?.specialties || []);
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicUrl || "");
  
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [leetcodeUrl, setLeetcodeUrl] = useState(user?.leetcodeUrl || "");
  const [codeforcesUrl, setCodeforcesUrl] = useState(user?.codeforcesUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");
  const [urlErrors, setUrlErrors] = useState({});
  
  const [companyName, setCompanyName] = useState(user?.company?.name || "");
  const [companyWebsite, setCompanyWebsite] = useState(user?.company?.website || "");
  
  const fileInputRef = useRef(null);

  const URL_FIELDS = [
    {
      key: "githubUrl", label: "GitHub URL", value: githubUrl, setter: setGithubUrl,
      placeholder: "https://github.com/username", pattern: /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/?$/,
      hint: "e.g. https://github.com/yourusername"
    },
    {
      key: "leetcodeUrl", label: "LeetCode URL", value: leetcodeUrl, setter: setLeetcodeUrl,
      placeholder: "https://leetcode.com/u/username", pattern: /^https:\/\/leetcode\.com\/(u\/)?[a-zA-Z0-9_.-]+\/?$/,
      hint: "e.g. https://leetcode.com/u/yourusername"
    },
    {
      key: "codeforcesUrl", label: "Codeforces URL", value: codeforcesUrl, setter: setCodeforcesUrl,
      placeholder: "https://codeforces.com/profile/username", pattern: /^https:\/\/codeforces\.com\/profile\/[a-zA-Z0-9_.-]+\/?$/,
      hint: "e.g. https://codeforces.com/profile/yourusername"
    },
    {
      key: "linkedinUrl", label: "LinkedIn URL", value: linkedinUrl, setter: setLinkedinUrl,
      placeholder: "https://linkedin.com/in/username", pattern: /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_.-]+\/?$/,
      hint: "e.g. https://linkedin.com/in/yourname"
    },
    {
      key: "portfolioUrl", label: "Portfolio / Website", value: portfolioUrl, setter: setPortfolioUrl,
      placeholder: "https://myportfolio.com", pattern: /^https?:\/\/.+\..+/,
      hint: "Any valid URL starting with https://"
    },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    if (Object.values(urlErrors).some(Boolean)) {
      toast.error("Please fix the invalid URL fields before saving.");
      return;
    }
    setSaving(true);
    try {
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
      if (isRecruiter) {
        await companyService.updateCompany({ name: companyName, website: companyWebsite });
      }
      const data = await userService.updateProfile({
        name: fullName, bio, skills: specialties, profilePicUrl: avatarUrl,
        githubUrl, leetcodeUrl, codeforcesUrl, linkedinUrl, portfolioUrl
      });
      updateUser({ 
        ...data.user, 
        company: isRecruiter ? { ...user?.company, name: companyName, website: companyWebsite } : data.user.company 
      });
      toast.success("Profile saved", { title: "Changes applied" });
    } catch (err) {
      toast.error(err.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("File is too large (max 1MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatarUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return {
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
  };
}
