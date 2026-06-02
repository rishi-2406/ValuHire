---
name: ValuHire Core
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#434655'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  space-1: 0.25rem
  space-2: 0.5rem
  space-3: 0.75rem
  space-4: 1rem
  space-6: 1.5rem
  space-8: 2rem
  space-12: 3rem
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

The design system is engineered for a modern enterprise SaaS environment where data density must coexist with extreme clarity. The brand personality is rooted in **Professionalism** and **Security**, reflecting the high-stakes nature of talent acquisition and valuation. 

The visual style follows a **Corporate / Modern** aesthetic, characterized by a structured layout, purposeful use of whitespace, and a high-precision interface. It leverages subtle depth through tonal layering and refined shadows to ensure the user feels grounded in a stable, trustworthy environment. The goal is to evoke a sense of calm efficiency and technical reliability.

## Colors

The palette is anchored by a commanding **Deep Blue/Indigo** primary color, symbolizing intelligence and stability. 

- **Primary (#2563eb):** Reserved for core actions, focus states, and essential brand identifiers.
- **Surface & Background:** A clear distinction is made between the `f8fafc` workspace background and `ffffff` elevated component surfaces to create natural visual hierarchy.
- **Text & UI Elements:** We use a deep slate (`1e293b`) for maximum legibility and professional tone, avoiding absolute blacks to maintain a sophisticated, modern feel.
- **Functional Accents:** Success, warning, and error states should utilize standard semantic palettes (Green, Amber, Red) but adjusted to match the saturation and vibrance of the primary blue.

## Typography

The design system utilizes **Inter** exclusively to take advantage of its systematic, utilitarian nature. The hierarchy is strictly enforced to manage complex information architecture.

- **Display & Headlines:** Use tighter letter spacing and heavier weights to create a sense of authority.
- **Body Text:** Optimized for long-form reading and data scanning with generous line heights.
- **Labels:** Small caps or medium weights are used for metadata and form labels to differentiate from user-inputted content.
- **Responsiveness:** Large display types scale down on mobile to maintain readability without excessive wrapping.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for desktop layouts to ensure content remains readable on ultra-wide monitors, while transitioning to a **Fluid Grid** for mobile and tablet devices.

- **Grid System:** A 12-column grid with 24px gutters is the standard for internal dashboards. 
- **Spacing Rhythm:** An 8pt linear scale is used for most layout components (8, 16, 24, 32, 48, 64), with a 4pt sub-step for fine-tuning UI elements like icons and labels.
- **Breakpoints:** 
  - Mobile: < 640px (1-column, 16px margins)
  - Tablet: 641px - 1024px (Fluid columns, 24px margins)
  - Desktop: > 1025px (Fixed 1280px max-width, centered)

## Elevation & Depth

To maintain a "Professional & Secure" feel, elevation is used sparingly and logically. We avoid heavy, muddy shadows in favor of **Tonal Layers** and **Ambient Depth**.

- **Level 0 (Base):** Background color (`#f8fafc`). Used for the main canvas.
- **Level 1 (Surface):** White cards (`#ffffff`) with a subtle 1px border (`#e2e8f0`). This is the primary container for content.
- **Level 2 (Elevated):** Used for hover states on cards or navigation elements. A very soft, diffused shadow (0 4px 6px -1px rgb(0 0 0 / 0.1)) provides a tactile lift.
- **Level 3 (Overlay):** Used for modals and dropdowns. Features a high-blur ambient shadow with a soft indigo tint to integrate with the primary brand color.

## Shapes

The design system uses a **Rounded** shape language to soften the industrial nature of enterprise software, making it feel more approachable and modern.

- **Small Components:** Checkboxes and radio buttons use 4px (Soft) radii for precision.
- **Standard UI:** Buttons, input fields, and chips use 8px (`0.5rem`) radii.
- **Containers:** Cards and modals utilize 12px-16px (`rounded-lg` to `rounded-xl`) to create a clear "object" feel on the screen.

## Components

### Buttons
- **Primary:** High-contrast `#2563eb` background with white text. 8px corner radius. Slight "lift" on hover via shadow.
- **Secondary:** Outlined with a 1px border using the primary blue or a soft gray.
- **Ghost:** No border or background; text-only until hover. Used for tertiary actions to reduce visual noise.

### Input Fields
- **Style:** Outlined with a 1px border (`#cbd5e1`). Labels are positioned above the field in `label-md` style.
- **Focus State:** 2px solid primary blue border with a soft outer glow.
- **Validation:** Clear red text and icons for errors, ensuring accessibility is prioritized.

### Cards
- **Structure:** White background, 1px subtle border, and 12px-16px corners. 
- **Padding:** Standard 24px (`space-6`) internal padding to provide "generous whitespace."

### Navigation & Tabs
- **Tabs:** Subtle transitions using an underline indicator in the primary blue. Non-active tabs use the neutral text color at a lower opacity.
- **Side Navigation:** Uses tonal layering; the active state should be a subtle background tint of the primary color (e.g., 10% opacity) with a vertical 4px bar on the leading edge.

### Feedback Elements
- **Chips:** Highly rounded (pill-shaped) with low-saturation background tints and high-saturation text for status indicators (e.g., "Active", "Pending").