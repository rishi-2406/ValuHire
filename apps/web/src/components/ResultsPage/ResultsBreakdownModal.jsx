import { X, Check, XCircle } from "lucide-react";

export default function ResultsBreakdownModal({ isOpen, onClose, assessmentResult }) {
  if (!isOpen || !assessmentResult) return null;

  const { session } = assessmentResult;
  const { assessment, mcqAnswers = [], submissions = [], selectedVariants } = session;
  const { mcqQuestions = [], codingQuestions = [] } = assessment || {};

  // Extract selected MCQs in order
  const selectedMcqIds = selectedVariants?.mcq || [];
  const mcqList = selectedMcqIds.map(id => {
    const question = mcqQuestions.find(q => q.id === id);
    const answer = mcqAnswers.find(a => a.questionId === id);
    return {
      id,
      question,
      isCorrect: answer?.isCorrect || false,
      points: answer?.pointsAwarded || 0,
      maxPoints: question?.points || 0
    };
  });

  // Extract selected Coding Tasks in order
  const selectedCodingIds = selectedVariants?.coding || [];
  const codingList = selectedCodingIds.map(id => {
    const question = codingQuestions.find(q => q.id === id);
    const subs = submissions.filter(s => s.codingQuestionId === id);
    const bestSub = subs.reduce((best, curr) => (curr.score > (best?.score || -1) ? curr : best), null);
    
    let passedCases = 0;
    let totalCases = 0;
    if (bestSub?.testResults && Array.isArray(bestSub.testResults)) {
      totalCases = bestSub.testResults.length;
      passedCases = bestSub.testResults.filter(r => r.passed).length;
    }

    return {
      id,
      question,
      passedCases,
      totalCases,
      score: bestSub?.score || 0,
      maxPoints: question?.points || 0
    };
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/50">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Assessment Breakdown</h2>
            <p className="text-sm text-on-surface-variant mt-1">Detailed performance review</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-8">
          
          {/* MCQ Grid */}
          {mcqList.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <h3 className="text-lg font-bold text-on-surface">Multiple Choice Questions</h3>
                <span className="text-sm font-semibold text-primary">{assessmentResult.mcqScore} pts earned</span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {mcqList.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`aspect-square rounded-xl border flex items-center justify-center shadow-sm relative group cursor-default transition-all ${
                      item.isCorrect 
                        ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]" 
                        : "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]"
                    }`}
                  >
                    <div className="absolute top-1 left-1 text-[9px] font-bold opacity-60">
                      {idx + 1}
                    </div>
                    {item.isCorrect ? <Check size={20} strokeWidth={3} /> : <XCircle size={20} />}
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-inverse text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      {item.isCorrect ? `Correct (+${item.points} pts)` : "Incorrect (0 pts)"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coding Results */}
          {codingList.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <h3 className="text-lg font-bold text-on-surface">Coding Challenges</h3>
                <span className="text-sm font-semibold text-primary">{assessmentResult.codingScore} pts earned</span>
              </div>
              <div className="flex flex-col gap-3">
                {codingList.map((item, idx) => (
                  <div key={idx} className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-on-surface mb-1">Task {idx + 1}: {item.question?.title || "Unknown"}</div>
                      <div className="text-xs text-on-surface-variant font-semibold">
                        {item.passedCases === item.totalCases && item.totalCases > 0 ? (
                          <span className="text-[#059669]">All {item.totalCases} cases passed</span>
                        ) : item.totalCases > 0 ? (
                          <span className="text-[#D97706]">{item.passedCases} / {item.totalCases} cases passed</span>
                        ) : (
                          <span className="text-error-coral">0 cases passed</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-outline-variant/30 shadow-sm">
                      <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Score</div>
                      <div className="text-base font-extrabold text-primary">{item.score} <span className="text-xs text-on-surface-variant font-medium">/ {item.maxPoints}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
