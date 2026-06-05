import { X, Mic, Video } from "lucide-react";

export default function DeviceSettingsModal({
  open,
  onClose,
  devices,
  selectedAudioId,
  setSelectedAudioId,
  selectedVideoId,
  setSelectedVideoId,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(17,28,45,0.60)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
          <h2 className="text-lg font-bold text-on-surface">Device Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Microphone Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Mic size={16} className="text-primary" />
              Microphone
            </label>
            <select
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
              value={selectedAudioId}
              onChange={(e) => setSelectedAudioId(e.target.value)}
            >
              {devices.audioInputs.length === 0 ? (
                <option value="">No microphones found</option>
              ) : (
                devices.audioInputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Microphone ${d.deviceId.substring(0, 5)}...`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Camera Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Video size={16} className="text-primary" />
              Camera
            </label>
            <select
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
              value={selectedVideoId}
              onChange={(e) => setSelectedVideoId(e.target.value)}
            >
              {devices.videoInputs.length === 0 ? (
                <option value="">No cameras found</option>
              ) : (
                devices.videoInputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.substring(0, 5)}...`}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-outline-variant/30 bg-[#F9F9FF] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white font-medium text-sm rounded-lg hover:bg-[#0053DB] transition-all shadow-sm active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
