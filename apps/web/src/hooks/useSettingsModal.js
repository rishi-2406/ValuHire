import { useState } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

export function useSettingsModal(onClose) {
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

  return {
    user,
    activeSection, setActiveSection,
    firstName, setFirstName,
    lastName, setLastName,
    email,
    bio, setBio,
    specialties, setSpecialties,
    newSpecialty, setNewSpecialty,
    resumeName, setResumeName,
    emailNotifs, setEmailNotifs,
    privateProfile, setPrivateProfile,
    shareResults, setShareResults,
    handleSave,
    addSpecialty, removeSpecialty, handleResumeChange
  };
}
