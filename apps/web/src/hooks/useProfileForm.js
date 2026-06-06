import { useState, useRef, useEffect } from "react";
import { userService, companyService } from "../services/api";

export function useProfileForm(user, updateUser, isRecruiter, toast, setSaving) {
  const [initialState, setInitialState] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email] = useState(user?.email || "");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  
  const [githubUrl, setGithubUrl] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [codeforcesUrl, setCodeforcesUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [urlErrors, setUrlErrors] = useState({});
  
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").split(" ");
      const newInitial = {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        bio: user.bio || "",
        specialties: user.skills || user.specialties || [],
        avatarUrl: (user.profilePicUrl === "null" ? "" : user.profilePicUrl) || "",
        resumeUrl: (user.resumeUrl === "null" ? "" : user.resumeUrl) || "",
        githubUrl: user.githubUrl || "",
        leetcodeUrl: user.leetcodeUrl || "",
        codeforcesUrl: user.codeforcesUrl || "",
        linkedinUrl: user.linkedinUrl || "",
        portfolioUrl: user.portfolioUrl || "",
        companyName: user.company?.name || "",
        companyWebsite: user.company?.website || ""
      };
      setInitialState(newInitial);
      setFirstName(newInitial.firstName);
      setLastName(newInitial.lastName);
      setBio(newInitial.bio);
      setSpecialties(newInitial.specialties);
      setAvatarUrl(newInitial.avatarUrl);
      setResumeUrl(newInitial.resumeUrl);
      setGithubUrl(newInitial.githubUrl);
      setLeetcodeUrl(newInitial.leetcodeUrl);
      setCodeforcesUrl(newInitial.codeforcesUrl);
      setLinkedinUrl(newInitial.linkedinUrl);
      setPortfolioUrl(newInitial.portfolioUrl);
      setCompanyName(newInitial.companyName);
      setCompanyWebsite(newInitial.companyWebsite);
    }
  }, [user]);

  const isDirty = initialState ? (
    firstName !== initialState.firstName ||
    lastName !== initialState.lastName ||
    bio !== initialState.bio ||
    avatarUrl !== initialState.avatarUrl ||
    resumeUrl !== initialState.resumeUrl ||
    githubUrl !== initialState.githubUrl ||
    leetcodeUrl !== initialState.leetcodeUrl ||
    codeforcesUrl !== initialState.codeforcesUrl ||
    linkedinUrl !== initialState.linkedinUrl ||
    portfolioUrl !== initialState.portfolioUrl ||
    companyName !== initialState.companyName ||
    companyWebsite !== initialState.companyWebsite ||
    JSON.stringify(specialties) !== JSON.stringify(initialState.specialties)
  ) : false;

  const resetForm = () => {
    if (initialState) {
      setFirstName(initialState.firstName);
      setLastName(initialState.lastName);
      setBio(initialState.bio);
      setSpecialties(initialState.specialties);
      setAvatarUrl(initialState.avatarUrl);
      setResumeUrl(initialState.resumeUrl);
      setGithubUrl(initialState.githubUrl);
      setLeetcodeUrl(initialState.leetcodeUrl);
      setCodeforcesUrl(initialState.codeforcesUrl);
      setLinkedinUrl(initialState.linkedinUrl);
      setPortfolioUrl(initialState.portfolioUrl);
      setCompanyName(initialState.companyName);
      setCompanyWebsite(initialState.companyWebsite);
      setUrlErrors({});
    }
  };

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
    e?.preventDefault();
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
        name: fullName, bio, skills: specialties, profilePicUrl: avatarUrl, resumeUrl,
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

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large (max 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setResumeUrl(reader.result);
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
  };
}
