import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

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

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white border border-outline rounded-2xl animate-fade-in">
      {illustration ? (
        <div className="mb-6 max-w-xs">{illustration}</div>
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

      <h3 className="text-headline-md text-on-surface mb-2">{title}</h3>
      {description ? (
        <p className="text-body-md text-on-surface-variant max-w-sm mb-6">{description}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {primaryAction ? (
          <Wrapper
            {...(primaryAction.to ? { to: primaryAction.to } : { type: "button", onClick: primaryAction.onClick })}
            className="primary-button"
          >
            {primaryAction.icon || <Plus size={18} />}
            <span>{primaryAction.label}</span>
            {primaryAction.arrow !== false ? <ArrowRight size={16} /> : null}
          </Wrapper>
        ) : null}

        {secondaryAction ? (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="tertiary-button"
          >
            <span>{secondaryAction.label}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
