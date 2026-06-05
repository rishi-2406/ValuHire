import { useState } from "react";

export function useNewCampaign(onCreate, onClose) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState(["React", "TypeScript"]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addTag = (e) => {
    e.preventDefault();
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
    }
    setTagInput("");
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetRole.trim()) return;
    setSubmitting(true);
    try {
      await onCreate?.({
        title: title.trim(),
        description: description.trim(),
        targetRole: targetRole.trim(),
        duration,
        tags
      });
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return {
    title, setTitle,
    description, setDescription,
    targetRole, setTargetRole,
    duration, setDuration,
    tags, setTags,
    tagInput, setTagInput,
    submitting,
    addTag, removeTag, handleSubmit
  };
}
