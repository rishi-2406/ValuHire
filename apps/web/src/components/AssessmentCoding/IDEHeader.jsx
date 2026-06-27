import React, { useState } from "react";
import { Code, ChevronDown, RotateCcw, Play } from "lucide-react";

export function IDEHeader({
  currentLanguage,
  language,
  setLanguage,
  showLangDropdown,
  setShowLangDropdown,
  LANGUAGE_OPTIONS,
  activeCodingQ,
  setCode,
  handleRunCode,
  isRunning
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="flex justify-between items-center bg-editor-surface border-b border-editor-outline px-4 py-2">
      <div className="relative">
        {LANGUAGE_OPTIONS.length > 1 ? (
          <>
            <button
              type="button"
              className="flex items-center gap-2 bg-editor-bg border border-editor-outline px-3 py-1 rounded text-editor-text text-sm cursor-pointer hover:bg-editor-outline transition-colors"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
            >
              <Code size={16} />
              <span>{currentLanguage.label}</span>
              <ChevronDown size={16} />
            </button>
            {showLangDropdown && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-[#252526] border border-editor-outline rounded shadow-2xl z-[9999]">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.id}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[#3c3c3c] ${
                      language === lang.id ? "text-white font-bold" : "text-[#d4d4d4]"
                    }`}
                    onClick={() => {
                      setLanguage(lang.id);
                      setShowLangDropdown(false);
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 bg-editor-bg border border-editor-outline px-3 py-1 rounded text-editor-text text-sm select-none">
            <Code size={16} />
            <span>{currentLanguage.label}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1 text-editor-text hover:text-white px-3 py-1 rounded transition-colors text-sm"
          onClick={() => {
            setShowResetConfirm(true);
          }}
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          type="button"
          onClick={handleRunCode}
          disabled={isRunning}
          className="flex items-center gap-1 bg-primary text-on-primary hover:bg-primary/90 px-4 py-1 rounded transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
        >
          <Play size={16} className="fill-current" />
          {isRunning ? "Running..." : "Run Code"}
        </button>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center backdrop-blur-sm" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-[#1e1e1e] border border-editor-outline rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-title-lg font-bold text-white mb-2">Reset Code?</h2>
            <p className="text-body-md text-editor-text mb-6">
              Are you sure you want to reset your code? All your progress will be lost and restored to the initial problem statement.
            </p>
            <div className="flex justify-end gap-3 font-sans">
              <button type="button" className="px-4 py-2 text-sm font-semibold text-editor-text hover:bg-editor-outline rounded-lg" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="px-4 py-2 text-sm font-semibold bg-error-coral text-white rounded-lg hover:opacity-90 transition-opacity" onClick={() => {
                setShowResetConfirm(false);
                setCode(activeCodingQ.statement || "");
              }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
