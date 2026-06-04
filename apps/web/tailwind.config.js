export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#004ac6",
        "on-primary": "#ffffff",
        "primary-container": "#2563eb",
        "on-primary-container": "#eeefff",
        "primary-fixed": "#dbe1ff",
        "primary-fixed-dim": "#b4c5ff",
        "on-primary-fixed": "#00174b",
        "on-primary-fixed-variant": "#003ea8",
        secondary: "#4648d4",
        "on-secondary": "#ffffff",
        "secondary-container": "#6063ee",
        "on-secondary-container": "#fffbff",
        "secondary-fixed": "#e1e0ff",
        "secondary-fixed-dim": "#c0c1ff",
        "on-secondary-fixed": "#07006c",
        "on-secondary-fixed-variant": "#2f2ebe",
        tertiary: "#006242",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#007d55",
        "on-tertiary-container": "#bdffdb",
        "tertiary-fixed": "#6ffbbe",
        "tertiary-fixed-dim": "#4edea3",
        "on-tertiary-fixed": "#002113",
        "on-tertiary-fixed-variant": "#005236",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        background: "#f8f9ff",
        "on-background": "#0b1c30",
        surface: "#f8f9ff",
        "surface-dim": "#cbdbf5",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#434655",
        "surface-variant": "#d3e4fe",
        "surface-tint": "#0053db",
        outline: "#737686",
        "outline-variant": "#c3c6d7",
        inverse: "#213145",
        "inverse-on-surface": "#eaf1ff",
        "inverse-primary": "#b4c5ff",
        "surface-light": "#F8FAFC",
        "surface-dark": "#0F172A",
        "code-bg-dark": "#0F172A",
        "success-green": "#10B981",
        "error-coral": "#EF4444",
        "warning-amber": "#F59E0B",
        "candidate-accent": "#8B5CF6",
        "editor-bg": "#1e1e1e",
        "editor-surface": "#252526",
        "editor-outline": "#3c3c3c",
        "editor-text": "#d4d4d4",
        "editor-keyword": "#569cd6",
        "editor-string": "#ce9178",
        "editor-comment": "#6a9955",
        "editor-function": "#dcdcaa",
        "editor-number": "#b5cea8"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px"
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
        gutter: "24px",
        base: "4px",
        "container-max": "1440px"
      },
      fontFamily: {
        "display-sm": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "title-lg": ["Inter", "sans-serif"],
        "title-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "code-md": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", fontWeight: "700", letterSpacing: "-0.02em" }],
        "display-sm": ["30px", { lineHeight: "38px", fontWeight: "700", letterSpacing: "-0.02em" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700", letterSpacing: "-0.02em" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600", letterSpacing: "-0.01em" }],
        "title-lg": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "title-md": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "600", letterSpacing: "0.02em" }],
        "label-sm": ["11px", { lineHeight: "14px", fontWeight: "500", letterSpacing: "0.03em" }]
      },
      boxShadow: {
        custom: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        "card": "0 4px 6px -1px rgba(0, 74, 198, 0.05), 0 2px 4px -2px rgba(0, 74, 198, 0.03)",
        "card-hover": "0 8px 16px -2px rgba(0, 74, 198, 0.08), 0 4px 6px -2px rgba(0, 74, 198, 0.04)",
        "modal": "0 20px 25px -5px rgba(0, 74, 198, 0.1), 0 8px 10px -6px rgba(0, 74, 198, 0.04)"
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        "fade-in": "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-up": "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "ambient-shift": "ambientShift 20s ease-in-out infinite alternate"
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(40px)" },
          to: { opacity: "1", transform: "translateX(0)" }
        },
        ambientShift: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(5%, 5%) scale(1.05)" },
          "100%": { transform: "translate(-5%, -5%) scale(0.95)" }
        }
      }
    }
  },
  plugins: []
};
