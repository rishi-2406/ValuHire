import React from "react";
import { ChevronLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResultsHeader({ isCandidate, currentCampaign, isCurrentlyOpen, handleToggleCampaign }) {
  const navigate = useNavigate();

  return (
    <header className="h-20 bg-white border-b border-outline-variant/50 px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {!isCandidate && (
          <button onClick={() => navigate("/campaigns")} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant border border-outline-variant/60">
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            {isCandidate ? "My Assessment Results" : (currentCampaign?.title || "Campaign Details")}
          </h1>
          {!isCandidate && currentCampaign && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${isCurrentlyOpen ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#F3F4F6] text-[#4B5563]"}`}>
                {isCurrentlyOpen ? "OPEN" : "CLOSED"}
              </span>
              <span className="text-xs text-on-surface-variant font-semibold">Results and Rankings</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isCandidate && (
          <>
            {currentCampaign && (
              isCurrentlyOpen ? (
                <button onClick={handleToggleCampaign} className="text-sm font-bold bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors border border-red-200">
                  Close Campaign
                </button>
              ) : (
                <button onClick={handleToggleCampaign} className="text-sm font-bold bg-[#D1FAE5] text-[#059669] hover:bg-[#A7F3D0] px-4 py-2 rounded-lg transition-colors border border-[#059669]/20">
                  Open Campaign
                </button>
              )
            )}
            <div className="h-8 w-px bg-outline-variant/50 mx-2" />
            <button className="flex items-center gap-2 bg-white border border-outline-variant/80 hover:bg-surface-light text-on-surface px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm">
              <Download size={16} /> Export
            </button>
          </>
        )}
      </div>
    </header>
  );
}
