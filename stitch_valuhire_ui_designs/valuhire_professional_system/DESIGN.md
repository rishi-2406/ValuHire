---
name: ValuHire Professional System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#3755c3'
  on-secondary: '#ffffff'
  secondary-container: '#708cfd'
  on-secondary-container: '#00217a'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c4ff'
  on-secondary-fixed: '#001453'
  on-secondary-fixed-variant: '#173bab'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  success-green: '#10B981'
  error-coral: '#EF4444'
  warning-amber: '#F59E0B'
  candidate-accent: '#8B5CF6'
  code-bg-dark: '#0F172A'
  surface-light: '#F8FAFC'
  surface-dark: '#0F172A'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  code-md:
    fontFamily: jetbrainsMono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for a high-stakes technical recruitment environment, balancing the analytical rigors of the **Recruiter** with the aspirational journey of the **Candidate**. The brand personality is authoritative yet empathetic—positioning itself as a "Digital Career Coach" for candidates and a "Precision Instrument" for recruiters.

The aesthetic follows a **Corporate / Modern** style with **Minimalist** influences. It prioritizes clarity and information density for dashboard environments while employing subtle **Glassmorphism** and soft depth to maintain an approachable, non-intimidating feel.

- **Recruiter Context:** Focuses on high-density data, analytical precision, and efficiency.
- **Candidate Context:** Focuses on clarity, encouragement, and clear progression paths.
- **Assessment Context:** A specialized "Focus Mode" inspired by modern IDEs, maximizing signal-to-noise ratio.

## Colors

The palette is anchored in **Professional Blues** to establish trust and institutional stability. **Forest Green** is utilized as a growth-oriented secondary color, primarily for candidate progress and successful system outcomes. **Coral Red** provides a high-visibility contrast for integrity flags and critical errors.

### Implementation Guidelines
- **Primary/Secondary:** Used for core brand actions, navigation states, and recruiter-focused headers.
- **Tertiary (Success):** Reserved for "Start" buttons, "Passed" states, and positive trend visualizations.
- **Candidate Mode:** Introduce subtle gradients using the `candidate-accent` (Violet) to soften the corporate blue and provide a distinct "supportive" visual indicator.
- **Dark Mode:** In dark mode, surfaces use `code-bg-dark`. Text contrast is strictly maintained at AAA levels for assessment IDEs.

## Typography

The system utilizes **Inter** for its exceptional legibility in data-heavy SaaS environments and its neutral, modern tone. For coding assessments, **JetBrains Mono** is employed to provide the technical precision required for an IDE experience.

### Hierarchy & Scaling
- **Tracking:** Headlines use slightly negative letter-spacing (-0.02em) to maintain a tight, professional appearance at large sizes.
- **Code:** Monospaced text is used exclusively for the editor and test output areas to prevent visual fatigue during assessments.
- **Labels:** Small labels use a semi-bold weight and increased tracking to remain legible even at 12px.

## Layout & Spacing

The layout philosophy relies on a **12-column Fluid Grid** for dashboards, ensuring that data scales gracefully across device widths. 

- **Recruiter Layout:** Utilizes a fixed left sidebar (240px) to maximize horizontal space for tables and complex analytical cards.
- **Candidate Layout:** Centered or wide-margin layouts that guide the eye downward through a single-path journey.
- **Spacing Rhythm:** An 8px linear scale (4, 8, 16, 24, 32, 48, 64) is used to create a "generous" feeling of whitespace, preventing the data-rich recruiter views from feeling cramped.
- **Breakpoints:**
  - Mobile (< 768px): 1-column stack, 16px margins.
  - Tablet (768px - 1024px): 2-column or fluid grid, 24px margins.
  - Desktop (> 1024px): 12-column grid, 32px margins.

## Elevation & Depth

Visual hierarchy is established using **Tonal Layers** combined with **Ambient Shadows**. This approach creates clear separation between the background canvas and the interactive "work" surfaces.

- **Level 0 (Canvas):** `surface-light` or `surface-dark`. No shadow.
- **Level 1 (Cards):** Subtle 1px border (#E2E8F0) and a soft, diffused shadow (0 4px 6px -1px rgba(0,0,0,0.1)). Used for dashboard metrics and campaign rows.
- **Level 2 (Modals/Overlays):** Elevated shadow (0 20px 25px -5px rgba(0,0,0,0.1)) with a backdrop blur (8px) to focus user attention on inputs.
- **Depth in Dark Mode:** Shadows are replaced by slight variations in background lightness (tonal tiers) to maintain visibility without "muddy" glows.

## Shapes

The shape language is consistently **Rounded**, using an 8px (`0.5rem`) base radius. This softens the "enterprise" feel of the application, making it more approachable for candidates while remaining professional for recruiters.

- **Standard Elements:** 8px (Buttons, Inputs, Small Cards).
- **Large Containers:** 16px (Main dashboard cards, Modals).
- **Utility Elements:** 4px (Checkboxes, Tooltips).
- **Pills:** Full rounding for status badges and tags to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid `primary_color`, 8px radius, white text. High prominence for "Submit" and "Create Campaign".
- **Success:** Solid `tertiary_color`. Used for "Start Assessment" or "Join Call" to signal progress.
- **Secondary:** Outlined with 1px `primary_color`, clear background. Used for "Cancel" or "Edit".

### Cards
- **Recruiter Style:** White background, thin border, sharp typography. Focus on information density.
- **Candidate Style:** Subtle gradient headers or soft-colored icons to create an "encouraging" vibe.

### Input Fields
- **Default State:** 8px radius, 1px neutral border.
- **Focus State:** 2px primary blue border with a soft outer glow.
- **IDE Editor:** Dark background, syntax highlighting for various languages, monospaced font, no rounded corners internally to mimic professional dev environments.

### Status Indicators
- **Integrity Flags:** Use Coral Red with a warning icon.
- **Progress Badges:** Use Pill-shaped backgrounds with low-opacity fills and high-contrast text.

### Feedback
- **Skeletons:** Linear shimmer moving from left to right, matching the 8px roundedness of the cards they represent.
- **Toasts:** Positioned top-right, featuring a 4px left-border accent corresponding to the message type (Success/Info/Error).