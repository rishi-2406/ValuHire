import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const ILLUSTRATIONS = {
  "no-applications": "/images/empty_applications.png",
  "no-campaigns": "/images/empty_campaigns.png",
  "no-interviews": "/images/empty_interviews.png",
  "no-results": "/images/empty_results.png",
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  illustration,
  variant = "default"
}) {
  const Wrapper = primaryAction?.to ? Link : "button";
  const illustrationSrc = typeof illustration === "string" ? ILLUSTRATIONS[illustration] : null;

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-8 bg-white border border-outline rounded-3xl animate-fade-in shadow-sm w-full max-w-2xl mx-auto">
      {illustrationSrc ? (
        <div className="mb-8 flex justify-center">
          <img 
            src={illustrationSrc} 
            alt={title} 
            className="w-48 h-48 object-contain rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
          />
        </div>
      ) : illustration ? (
        <div className="mb-8">{illustration}</div>
      ) : Icon ? (
        <div
          className={
            "mb-6 w-16 h-16 rounded-2xl flex items-center justify-center " +
            (variant === "success"
              ? "bg-success-green/10 text-success-green"
              : variant === "warning"
              ? "bg-warning-amber/10 text-warning-amber"
              : "bg-primary/10 text-primary")
          }
        >
          <Icon size={32} strokeWidth={1.5} />
        </div>
      ) : null}

      <h3 className="text-2xl font-bold text-on-surface mb-3">{title}</h3>
      {description ? (
        <p className="text-on-surface-variant max-w-sm mb-8 leading-relaxed font-medium">{description}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-4">
        {primaryAction ? (
          <Wrapper
            {...(primaryAction.to ? { to: primaryAction.to } : { type: "button", onClick: primaryAction.onClick })}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm inline-flex items-center gap-2"
          >
            {primaryAction.icon || null}
            <span>{primaryAction.label}</span>
          </Wrapper>
        ) : null}

        {secondaryAction ? (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="bg-white border border-outline-variant hover:bg-surface-light text-on-surface px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <span>{secondaryAction.label}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
