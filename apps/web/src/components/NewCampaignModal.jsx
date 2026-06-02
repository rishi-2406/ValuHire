import { useState } from "react";
import { X, Plus, Trash2, Sparkles } from "lucide-react";

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard", "Expert"];
const DURATION_OPTIONS = ["30", "60", "90", "120"];
const LANGUAGE_OPTIONS = ["JavaScript", "Python", "Java", "C++", "Go", "TypeScript", "Ruby"];

export default function NewCampaignModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState("60");
  const [language, setLanguage] = useState("JavaScript");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [questions, setQuestions] = useState([
    { title: "", description: "", sampleInput: "", sampleOutput: "" }
  ]);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const addTag = (e) => {
    e.preventDefault();
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
    }
    setTagInput("");
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { title: "", description: "", sampleInput: "", sampleOutput: "" }
    ]);
  };

  const removeQuestion = (i) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, idx) => idx !== i));
  };

  const updateQuestion = (i, field, value) => {
    setQuestions(questions.map((q, idx) => (idx === i ? { ...q, [field]: value } : q)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await onCreate?.({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        duration: Number(duration),
        language,
        tags,
        questions
      });
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="new-campaign-title">
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div>
            <h2 id="new-campaign-title">New Campaign</h2>
            <p>Create a new assessment campaign for candidates.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="stack">
            <div className="form-row">
              <label htmlFor="campaign-title">Campaign Title</label>
              <input
                id="campaign-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                required
                autoFocus
              />
            </div>

            <div className="form-row">
              <label htmlFor="campaign-desc">Description</label>
              <textarea
                id="campaign-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, expectations, and assessment focus."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="form-row">
                <label htmlFor="campaign-difficulty">Difficulty</label>
                <select id="campaign-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="campaign-duration">Duration (min)</label>
                <select id="campaign-duration" value={duration} onChange={(e) => setDuration(e.target.value)}>
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="campaign-language">Language</label>
                <select id="campaign-language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="campaign-tags">Skills & Tags</label>
              <div className="flex flex-wrap items-center gap-2 p-2 border border-outline rounded-lg min-h-[44px] bg-white">
                {tags.map((tag) => (
                  <span key={tag} className="status-chip info">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1" aria-label={`Remove ${tag}`}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  id="campaign-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(e);
                    }
                  }}
                  placeholder={tags.length ? "Add more…" : "React, TypeScript, Algorithms…"}
                  className="flex-1 min-w-[120px] outline-none text-sm bg-transparent border-none h-8 px-1"
                />
              </div>
              <span className="helper">Press Enter to add a tag</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-on-surface">Questions</label>
                <button type="button" onClick={addQuestion} className="tertiary-button text-sm">
                  <Plus size={16} />
                  <span>Add question</span>
                </button>
              </div>
              <div className="stack">
                {questions.map((q, i) => (
                  <div key={i} className="border border-outline rounded-lg p-3 bg-surface-light">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-on-surface">Question {i + 1}</span>
                      {questions.length > 1 ? (
                        <button type="button" onClick={() => removeQuestion(i)} className="icon-button" aria-label="Remove question">
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                    <div className="stack">
                      <input
                        value={q.title}
                        onChange={(e) => updateQuestion(i, "title", e.target.value)}
                        placeholder="Question title"
                        className="h-10 px-3 border border-outline rounded-lg text-sm bg-white"
                      />
                      <textarea
                        value={q.description}
                        onChange={(e) => updateQuestion(i, "description", e.target.value)}
                        placeholder="Problem statement"
                        rows={2}
                        className="px-3 py-2 border border-outline rounded-lg text-sm bg-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={q.sampleInput}
                          onChange={(e) => updateQuestion(i, "sampleInput", e.target.value)}
                          placeholder="Sample input"
                          className="h-10 px-3 border border-outline rounded-lg text-sm font-mono bg-white"
                        />
                        <input
                          value={q.sampleOutput}
                          onChange={(e) => updateQuestion(i, "sampleOutput", e.target.value)}
                          placeholder="Sample output"
                          className="h-10 px-3 border border-outline rounded-lg text-sm font-mono bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="secondary-button" disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={submitting || !title.trim() || !description.trim()}>
            <Sparkles size={16} />
            <span>{submitting ? "Creating…" : "Create Campaign"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
