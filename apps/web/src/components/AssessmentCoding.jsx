import React from "react";
import { Editor } from "@monaco-editor/react";
import { IDEHeader } from "./AssessmentCoding/IDEHeader";
import { ConsolePanel } from "./AssessmentCoding/ConsolePanel";

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
        <IDEHeader
          currentLanguage={currentLanguage}
          language={language}
          setLanguage={setLanguage}
          showLangDropdown={showLangDropdown}
          setShowLangDropdown={setShowLangDropdown}
          LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
          activeCodingQ={activeCodingQ}
          setCode={setCode}
          handleRunCode={handleRunCode}
          isRunning={isRunning}
        />

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
          <ConsolePanel
            activeBottomTab={activeBottomTab}
            setActiveBottomTab={setActiveBottomTab}
            activeCodingQ={activeCodingQ}
            activeTestCase={activeTestCase}
            output={output}
          />
        </div>
      </section>
    </div>
  );
}
