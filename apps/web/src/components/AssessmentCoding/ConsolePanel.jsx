import React from "react";
import { TestTube, Terminal } from "lucide-react";

export function ConsolePanel({ activeBottomTab, setActiveBottomTab, activeCodingQ, activeTestCase, output }) {
  return (
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
  );
}
