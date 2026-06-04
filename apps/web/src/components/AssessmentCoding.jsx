import React from "react";
import { Code, ChevronDown, RotateCcw, Play, TestTube, Terminal } from "lucide-react";
import { Editor } from "@monaco-editor/react";

export default function AssessmentCoding({
  activeCodingQ,
  language,
  setLanguage,
  showLangDropdown,
  setShowLangDropdown,
  LANGUAGE_OPTIONS,
  code,
  setCode,
  isRunning,
  handleRunCode,
  activeBottomTab,
  setActiveBottomTab,
  activeTestCase,
  output,
}) {
  const currentLanguage = LANGUAGE_OPTIONS.find((l) => l.id === language) || LANGUAGE_OPTIONS[0];

  return (
    <div className="flex-1 flex flex-row w-full h-full overflow-hidden">
      <aside className="w-1/3 min-w-[350px] max-w-[500px] flex flex-col bg-surface-container-lowest border-r border-outline-variant h-full overflow-y-auto">
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2 border-b border-outline-variant pb-4">
            <div className="flex justify-between items-start">
              <h2 className="text-headline-md font-bold text-on-surface">{activeCodingQ.title}</h2>
              <span className="bg-surface-container px-2 py-1 rounded text-label-sm font-semibold text-primary">
                {activeCodingQ.points} pts
              </span>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-surface-container text-on-surface-variant text-label-sm font-semibold border border-outline-variant rounded capitalize">
                {activeCodingQ.language}
              </span>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-on-surface-variant space-y-4 whitespace-pre-wrap">
            {activeCodingQ.statement}
          </div>
        </div>
      </aside>

      {/* Right Panel: Code Editor and Tests */}
      <section className="flex-1 flex flex-col bg-editor-bg border-r border-editor-outline h-full overflow-hidden">
        {/* IDE Header Bar */}
        <div className="flex justify-between items-center bg-editor-surface border-b border-editor-outline px-4 py-2">
          <div className="relative">
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
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 text-editor-text hover:text-white px-3 py-1 rounded transition-colors text-sm"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to reset your code? All your progress will be lost and restored to the initial problem statement."
                  )
                ) {
                  setCode(activeCodingQ.statement || "");
                }
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
        </div>

        {/* Editor and Console Stack */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Area */}
          <div className="flex-1 relative w-full min-h-[300px] z-0">
            <Editor
              height="100%"
              defaultLanguage={
                language === "javascript"
                  ? "javascript"
                  : language === "python"
                  ? "python"
                  : language === "cpp"
                  ? "cpp"
                  : "java"
              }
              language={
                language === "javascript"
                  ? "javascript"
                  : language === "python"
                  ? "python"
                  : language === "cpp"
                  ? "cpp"
                  : "java"
              }
              value={code}
              theme="vs-dark"
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                tabSize: 4,
                wordWrap: "on",
                padding: { top: 16 },
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: "allDocuments",
                parameterHints: { enabled: true },
                snippetSuggestions: "inline",
              }}
              beforeMount={(monaco) => {
                // Enable basic TS/JS completion
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                  noSemanticValidation: true,
                  noSyntaxValidation: false,
                });
                monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                  target: monaco.languages.typescript.ScriptTarget.ES6,
                  allowNonTsExtensions: true,
                });
              }}
            />
          </div>

          {/* Bottom Docked Console Panel */}
          <div className="h-[280px] bg-surface-container-lowest border-t border-editor-outline flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-outline-variant bg-surface-container-low">
              <button
                className={`px-6 py-2 text-sm flex items-center justify-center gap-2 font-bold ${
                  activeBottomTab === "testcases"
                    ? "text-primary border-b-2 border-primary bg-surface-container"
                    : "text-on-surface-variant hover:bg-surface-container-low transition-colors"
                }`}
                onClick={() => setActiveBottomTab("testcases")}
              >
                <TestTube size={18} />
                Test Cases
              </button>
              <button
                className={`px-6 py-2 text-sm flex items-center justify-center gap-2 font-bold ${
                  activeBottomTab === "results"
                    ? "text-primary border-b-2 border-primary bg-surface-container"
                    : "text-on-surface-variant hover:bg-surface-container-low transition-colors"
                }`}
                onClick={() => setActiveBottomTab("results")}
              >
                <Terminal size={18} />
                Execution Results
              </button>
            </div>

            {/* Console Content */}
            <div
              className={`flex-1 overflow-y-auto p-4 flex ${
                activeBottomTab === "testcases" ? "flex-row gap-4" : "flex-col"
              } bg-surface scrollbar-hide`}
            >
              {activeBottomTab === "testcases" ? (
                activeCodingQ.testCases?.length > 0 ? (
                  activeCodingQ.testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="min-w-[300px] max-w-[350px] bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm h-fit shrink-0"
                    >
                      <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-sm ${
                              activeTestCase === idx ? "text-primary" : "text-on-surface"
                            }`}
                          >
                            Case {idx + 1}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col gap-3 font-mono text-sm">
                        <div>
                          <div className="text-on-surface-variant mb-1">Input:</div>
                          <div className="bg-surface-container p-2 rounded border border-outline-variant/50 text-on-surface break-all italic text-[12px]">
                            {tc.input || "None"}
                          </div>
                        </div>
                        <div>
                          <div className="text-on-surface-variant mb-1">Expected Output:</div>
                          <div className="bg-surface-container p-2 rounded border border-outline-variant/50 text-on-surface break-all italic text-[12px]">
                            {tc.expectedOutput || "None"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-on-surface-variant w-full text-center mt-8">
                    No test cases available.
                  </div>
                )
              ) : (
                <div className="font-mono text-sm h-full w-full">
                  {output ? (
                    <pre className="text-on-surface whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="text-on-surface-variant flex items-center justify-center h-full italic">
                      Run your code to see execution results here.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
