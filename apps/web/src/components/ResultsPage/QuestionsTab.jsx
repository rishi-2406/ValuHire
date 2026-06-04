import React from "react";
import { Code, Plus, X } from "lucide-react";

export default function QuestionsTab({ interviewQuestions, setInterviewQuestions, onSaveQuestions }) {
  return (
    <div className="bg-white border border-outline-variant/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-outline-variant/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code size={20} className="text-[#2563EB]" />
          <h3 className="text-xl font-bold text-on-surface">Live Interview Questions</h3>
        </div>
        <button 
          onClick={() => {
            const newQ = { id: Date.now().toString(), title: "New Question", statement: "Write a function to...", language: "python" };
            setInterviewQuestions([...interviewQuestions, newQ]);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-bold hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>
      
      <div className="p-6 bg-surface-container-low min-h-[400px]">
        {interviewQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant">
            <Code size={48} className="mb-4 text-outline-variant" />
            <h3 className="text-lg font-bold text-on-surface mb-2">No Interview Questions</h3>
            <p className="text-sm">Pre-populate coding questions here to select them quickly during a live interview.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {interviewQuestions.map((q, idx) => (
              <div key={q.id || idx} className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between mb-4">
                   <input 
                     type="text" 
                     value={q.title} 
                     onChange={(e) => {
                       const arr = [...interviewQuestions];
                       arr[idx].title = e.target.value;
                       setInterviewQuestions(arr);
                     }}
                     className="text-lg font-bold text-on-surface border-b border-transparent hover:border-outline-variant focus:border-primary outline-none bg-transparent w-1/2 px-1"
                     placeholder="Question Title"
                   />
                   <button 
                     onClick={() => {
                       const arr = [...interviewQuestions];
                       arr.splice(idx, 1);
                       setInterviewQuestions(arr);
                     }}
                     className="text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors"
                   >
                     <X size={16} />
                   </button>
                </div>
                <textarea
                   value={q.statement}
                   onChange={(e) => {
                     const arr = [...interviewQuestions];
                     arr[idx].statement = e.target.value;
                     setInterviewQuestions(arr);
                   }}
                   rows={4}
                   className="w-full text-sm font-mono text-on-surface-variant bg-[#F8FAFC] border border-outline-variant/50 rounded-lg p-3 outline-none focus:border-primary resize-none"
                   placeholder="Problem statement..."
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-outline-variant/50 flex justify-end bg-white">
         <button 
           onClick={onSaveQuestions}
           className="flex items-center gap-2 bg-[#111827] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#1F2937] transition-all shadow-sm active:scale-95"
         >
           Save Questions
         </button>
      </div>
    </div>
  );
}
