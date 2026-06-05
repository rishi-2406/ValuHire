import React from "react";

export function OnlineProfilesSection({ urlFields, urlErrors, setUrlErrors }) {
  const validateUrl = (key, value, pattern) => {
    if (!value) {
      setUrlErrors(prev => ({ ...prev, [key]: undefined }));
      return;
    }
    const valid = pattern.test(value.trim());
    setUrlErrors(prev => ({ ...prev, [key]: valid ? undefined : true }));
  };

  return (
    <div className="border border-outline-variant/80 rounded-lg p-6 bg-[#F8FAFC] mt-8">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-on-surface">Online Profiles</h3>
      </div>
      <p className="text-sm text-on-surface-variant mb-6">Add your coding profiles and portfolio links — they'll appear on your candidate profile.</p>
      <div className="space-y-5">
        {urlFields.map(field => {
          const hasError = !!urlErrors[field.key];
          return (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">{field.label}</label>
              <input
                type="url"
                value={field.value}
                onChange={e => {
                  field.setter(e.target.value);
                  if (urlErrors[field.key]) {
                    setUrlErrors(prev => ({ ...prev, [field.key]: undefined }));
                  }
                }}
                onBlur={e => validateUrl(field.key, e.target.value, field.pattern)}
                placeholder={field.placeholder}
                className={`w-full border rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 text-on-surface font-medium transition-colors ${
                  hasError
                    ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626] bg-[#FEF2F2]"
                    : "border-outline-variant/80 focus:border-[#2563EB] focus:ring-[#2563EB]"
                }`}
              />
              {hasError ? (
                <p className="text-xs text-[#DC2626] mt-1 font-medium">⚠ Invalid URL format — {field.hint}</p>
              ) : (
                <p className="text-xs text-on-surface-variant/60 mt-1">{field.hint}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
