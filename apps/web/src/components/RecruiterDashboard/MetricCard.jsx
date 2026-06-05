export function MetricCard({ icon: Icon, label, value, trend, iconColor, iconBg, trendColor, trendBg, isWarning }) {
  return (
    <div className={`bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm relative overflow-hidden`}>
      {isWarning && <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEF2F2] rounded-full -translate-y-1/2 translate-x-1/3 -z-0" />}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
          {trend && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${trendBg} ${trendColor}`}>
              {trend}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[2rem] font-bold text-[#111827] leading-none mb-1">{value}</span>
          <span className="text-sm text-[#6B7280] font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
}
