import React from "react";
import { Search, CheckSquare, Square, ChevronLeft, ChevronRight, BarChart3, ShieldCheck, AlertTriangle, Star } from "lucide-react";

export default function RankingsTab({
  isCandidate,
  filtered,
  paged,
  page,
  totalPages,
  setPage,
  search,
  setSearch,
  minMcqScore,
  setMinMcqScore,
  minCodingScore,
  setMinCodingScore,
  selectedIds,
  setSelectedIds,
  shortlisting,
  handleShortlist,
  toggleSelectAll,
  allPageSelected,
  toggleOne,
  setSelectedCandidate,
  candidates,
  avgScore,
  perPage
}) {
  return (
    <div className="space-y-6">

      {/* Rankings Table */}
      <div className="bg-white border border-outline-variant/60 rounded-2xl shadow-sm overflow-hidden">
          {/* Table toolbar */}
          <div className="p-6 border-b border-outline-variant/50 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-on-surface">Candidate Rankings</h3>
              {!isCandidate && selectedIds.size > 0 && (
                <button
                  id="shortlist-selected-btn"
                  onClick={() => handleShortlist(selectedIds)}
                  disabled={shortlisting}
                  className="flex items-center gap-2 px-5 py-2 bg-[#111827] text-white rounded-lg text-sm font-bold hover:bg-[#1F2937] transition-all shadow-md active:scale-95 disabled:opacity-60"
                >
                  <Star size={14} className="text-[#FBBF24]" fill="currentColor" /> {shortlisting ? "Shortlisting…" : `Shortlist ${selectedIds.size} Selected`}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  className="pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/60 rounded-lg text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-52"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-on-surface-variant">Min MCQ:</span>
                <input type="number" min="0" max="100" placeholder="0" className="w-16 px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-md text-sm font-medium focus:outline-none focus:border-primary" value={minMcqScore} onChange={e => { setMinMcqScore(e.target.value); setPage(1); }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-on-surface-variant">Min Coding:</span>
                <input type="number" min="0" max="100" placeholder="0" className="w-16 px-2 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-md text-sm font-medium focus:outline-none focus:border-primary" value={minCodingScore} onChange={e => { setMinCodingScore(e.target.value); setPage(1); }} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/50">
                  {!isCandidate && (
                    <th className="px-4 py-4 w-10">
                      <button id="select-all-checkbox" onClick={toggleSelectAll} className="text-on-surface-variant hover:text-on-surface">
                        {allPageSelected ? <CheckSquare size={18} className="text-[#2563EB]" /> : <Square size={18} />}
                      </button>
                    </th>
                  )}
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant text-center w-16">Rank</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant">Candidate</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant w-24">MCQ</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant w-24">Coding</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant w-32">Overall</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant text-right">Integrity</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={isCandidate ? 6 : 7} className="px-6 py-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center">
                        <h3 className="text-lg font-bold text-on-surface mb-2">No results found</h3>
                        <p className="text-sm">No candidates match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map(c => {
                    const hasFlags = c.integrityFlags > 0;
                    const isSelected = c.candidateId && selectedIds.has(c.candidateId);
                    return (
                      <tr
                        key={c.id || c.candidateId}
                        className={`border-b border-outline-variant/30 hover:bg-surface-light transition-colors last:border-0 ${isSelected ? "bg-[#EFF6FF]/40" : ""}`}
                      >
                        {!isCandidate && (
                          <td className="px-4 py-4">
                            <button
                              onClick={e => { e.stopPropagation(); c.candidateId && toggleOne(c.candidateId); }}
                              className="text-on-surface-variant hover:text-[#2563EB]"
                            >
                              {isSelected ? <CheckSquare size={18} className="text-[#2563EB]" /> : <Square size={18} />}
                            </button>
                          </td>
                        )}
                        <td className="px-6 py-4 text-center cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${c.rank === 1 ? "bg-[#FEF08A] text-[#854D0E]" : c.rank === 2 ? "bg-[#E2E8F0] text-[#475569]" : c.rank === 3 ? "bg-[#DBEAFE] text-[#1E40AF]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                            {c.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-[#C7D2FE]">
                              {c.candidateProfile?.profilePicUrl
                                ? <img src={c.candidateProfile.profilePicUrl} alt={c.name} className="w-full h-full object-cover" />
                                : c.name?.split(" ").map(n => n[0]).join("").substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-on-surface text-sm">{c.name}</div>
                              <div className="text-xs text-on-surface-variant mt-0.5">{c.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                          <div className="flex flex-col">
                            <div className="text-sm font-semibold text-on-surface-variant">{c.mcqScore} pts</div>
                            <div className="text-[10px] text-on-surface-variant/70">{Math.floor((c.mcqDurationSeconds || 0)/60)}m {(c.mcqDurationSeconds || 0)%60}s</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                          <div className="flex flex-col">
                            <div className="text-sm font-semibold text-on-surface-variant">{c.codingScore} pts</div>
                            <div className="text-[10px] text-on-surface-variant/70">{Math.floor((c.codingDurationSeconds || 0)/60)}m {(c.codingDurationSeconds || 0)%60}s</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                          <div className="font-bold text-on-surface text-sm">{c.score} pts</div>
                        </td>
                        <td className="px-6 py-4 text-right cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                          {hasFlags ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FEE2E2] text-[#DC2626] rounded-full text-xs font-bold border border-[#DC2626]/20">
                                <AlertTriangle size={12} /> {c.integrityFlags} Flags
                              </span>
                              {c.integrityFlags >= 5 && (
                                <span className="text-[10px] font-bold text-[#DC2626]">Auto-Submitted</span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#D1FAE5] text-[#059669] rounded-full text-xs font-bold border border-[#059669]/20">
                              <ShieldCheck size={12} /> Pass
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-outline-variant/50 bg-white flex justify-between items-center text-sm font-semibold text-on-surface-variant">
            <span>Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-4">
              <button className="p-1 hover:text-on-surface disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs">{page}/{totalPages}</span>
              <button className="p-1 hover:text-on-surface disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
