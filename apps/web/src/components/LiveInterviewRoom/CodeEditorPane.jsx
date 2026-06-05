import React from "react";
import { Code as CodeIcon, ChevronDown, CheckCircle2, Play } from "lucide-react";
import { Editor } from "@monaco-editor/react";

export default function CodeEditorPane({
  LANGUAGE_OPTIONS,
  currentLanguage,
  showLangDropdown,
  setShowLangDropdown,
  language,
  handleLanguageChange,
  isRunning,
  handleRunCode,
  code,
  handleCodeChange,
  output
}) {
  return (
    <div className="flex-1 flex flex-col bg-[#1E1E1E] min-w-0">
      {/* IDE Toolbar */}
      <div className="h-12 bg-[#252526] border-b border-[#3C3C3C] flex items-center justify-between px-4 shrink-0">
         <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 bg-[#1E1E1E] border border-[#3C3C3C] px-3 py-1.5 rounded text-[#D4D4D4] text-xs font-semibold cursor-pointer hover:bg-[#3C3C3C] transition-colors"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
            >
              <CodeIcon size={14} />
              <span>{currentLanguage.label}</span>
              <ChevronDown size={14} />
            </button>
            {showLangDropdown && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-[#252526] border border-[#3C3C3C] rounded shadow-2xl z-50">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.id}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#3C3C3C] ${language === lang.id ? 'text-white' : 'text-[#D4D4D4]'}`}
                    onClick={() => handleLanguageChange(lang.id)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
         </div>
         
         <div className="flex items-center gap-3">
           <span className="text-[#858585] text-xs font-semibold flex items-center gap-1.5">
             <CheckCircle2 size={12} className="text-[#10B981]" />
             Synced Live
           </span>
           <button 
             onClick={handleRunCode}
             disabled={isRunning}
             className="flex items-center gap-1.5 bg-[#2563EB] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#1D4ED8] transition-colors shadow-sm disabled:opacity-50"
           >
             <Play size={12} fill="currentColor" /> {isRunning ? "Running..." : "Run Code"}
           </button>
         </div>
      </div>
      
      {/* Editor Container */}
      <div className="flex-1 relative w-full min-h-0 z-0">
        <Editor
          height="100%"
          language={language === "javascript" ? "javascript" : language === "python" ? "python" : language === "cpp" ? "cpp" : "java"}
          value={code}
          theme="vs-dark"
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            tabSize: 4,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            quickSuggestions: true,
            cursorBlinking: "smooth",
            smoothScrolling: true
          }}
        />
      </div>

      {/* Bottom Console */}
      <div className="h-[250px] bg-surface-container-lowest border-t border-[#3C3C3C] flex flex-col shrink-0">
        <div className="flex border-b border-[#3C3C3C] bg-[#252526]">
          <button className="px-6 py-2 text-xs font-bold text-white border-b-2 border-[#2563EB] bg-[#1E1E1E]">
            Execution Console
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-[#1E1E1E] font-mono text-xs text-[#D4D4D4] whitespace-pre-wrap">
          {output || <span className="text-[#858585] italic">Ready to run code.</span>}
        </div>
      </div>
    </div>
  );
}
