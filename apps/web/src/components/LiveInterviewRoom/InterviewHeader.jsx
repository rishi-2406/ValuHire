import React from "react";
import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff } from "lucide-react";

export default function InterviewHeader({
  isRecruiter,
  interviewData,
  micOn,
  setMicOn,
  videoOn,
  setVideoOn,
  isScreenSharing,
  toggleScreenShare,
  handleEndInterview
}) {
  return (
    <header className="h-16 bg-white border-b border-outline-variant flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-[#E0E7FF] text-[#3730A3] font-bold rounded-lg flex items-center justify-center">
          {isRecruiter ? "R" : "C"}
        </div>
        <div>
          <h1 className="font-bold text-on-surface text-lg">Live Interview Session</h1>
          <p className="text-xs font-semibold text-on-surface-variant">
            {interviewData ? `with ${isRecruiter ? interviewData.candidate?.name : interviewData.recruiter?.name}` : "Secure Connection Established"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
         {/* Meeting Controls */}
         <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/60 shadow-sm">
           <button 
             onClick={() => setMicOn(!micOn)}
             className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${micOn ? 'bg-white text-on-surface hover:bg-surface-variant' : 'bg-[#FFDAD6] text-[#93000A] hover:bg-[#BA1A1A] hover:text-white'}`}
           >
             {micOn ? <Mic size={20} /> : <MicOff size={20} />}
           </button>
           <button 
             onClick={() => setVideoOn(!videoOn)}
             className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${videoOn ? 'bg-white text-on-surface hover:bg-surface-variant' : 'bg-[#FFDAD6] text-[#93000A] hover:bg-[#BA1A1A] hover:text-white'}`}
           >
             {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
           </button>
           <button 
             onClick={toggleScreenShare}
             className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-[#D3E3FD] text-[#004AC6] hover:bg-[#A8C7FA]' : 'bg-white text-on-surface hover:bg-surface-variant'}`}
           >
             <ScreenShare size={20} />
           </button>
         </div>
         
         {isRecruiter && (
           <div className="w-px h-8 bg-outline-variant/50 mx-1" />
         )}
         
         <button 
           onClick={handleEndInterview}
           className="flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95"
         >
           <PhoneOff size={18} />
           {isRecruiter ? "End & Evaluate" : "Leave Interview"}
         </button>
      </div>
    </header>
  );
}
