import React from "react";

const FEATURES = [
  {
    icon: "analytics",
    iconColor: "text-primary-fixed",
    iconBg: "bg-primary-fixed-dim/20",
    title: "AI Integrity Score",
    desc: "Fraud detection algorithms."
  },
  {
    icon: "videocam",
    iconColor: "text-secondary-fixed",
    iconBg: "bg-secondary-fixed-dim/20",
    title: "Real-time Proctored Rooms",
    desc: "Secure live technical interviews."
  },
  {
    icon: "format_list_numbered",
    iconColor: "text-tertiary-fixed",
    iconBg: "bg-tertiary-fixed-dim/20",
    title: "Automated Ranking",
    desc: "Data-driven candidate comparison."
  },
  {
    icon: "edit_note",
    iconColor: "text-white",
    iconBg: "bg-white/20",
    title: "Custom Assessments",
    desc: "Tailored technical challenges."
  }
];

const BRAND_FEATURES = [...FEATURES, ...FEATURES];

export function BrandPanel() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 10
  }));

  return (
    <div className="hidden lg:flex w-1/2 bg-primary relative flex-col justify-between p-12 overflow-hidden bg-pattern">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary opacity-30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-screen pointer-events-none animate-ambient-shift" />
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-fixed-dim opacity-20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 mix-blend-screen pointer-events-none animate-ambient-shift"
        style={{ animationDelay: "-10s" }}
      />

      {particles.map((p) => (
        <div
          key={p.id}
          className="floating-particle absolute bg-white/10 rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `-${p.delay}s`
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col justify-center flex-grow">
        <div className="brand-mark mb-12 animate-fade-in-up">VH</div>

        <h1 className="text-display-lg text-on-primary mb-6 max-w-lg leading-tight animate-fade-in-up stagger-1">
          Precision Technical Recruitment
        </h1>
        <p className="text-body-lg text-primary-fixed mb-12 max-w-md animate-fade-in-up stagger-2">
          Unlock top engineering talent with our data-driven valuation platform. Streamline your hiring
          pipeline with confidence.
        </p>

        <div className="animate-fade-in-up stagger-3 w-[calc(100%+6rem)] -ml-12">
          <div className="scroll-container py-4">
            <div className="scroll-content gap-4 px-12">
              {BRAND_FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="glass-card flex items-center gap-4 p-4 rounded-xl min-w-[280px]"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${f.iconBg}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {f.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-label-md text-on-primary font-semibold">{f.title}</h3>
                    <p className="text-body-sm text-primary-fixed/80">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between text-primary-fixed/60 text-body-sm animate-fade-in stagger-5">
        <span>© 2024 ValuHire</span>
        <div className="flex gap-4">
          <a className="hover:text-on-primary transition-colors" href="#">Privacy</a>
          <a className="hover:text-on-primary transition-colors" href="#">Terms</a>
        </div>
      </div>
    </div>
  );
}
