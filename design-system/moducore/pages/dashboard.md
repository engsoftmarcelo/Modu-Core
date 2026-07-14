# Dashboard Page Overrides

> **PROJECT:** ModuCore
> **Generated:** 2026-07-14 04:26:34
> **Page Type:** Dashboard / Data View

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px (standard)
- **Layout:** Full-width sections, centered content
- **Sections:** 1. Hero (product + live preview or status), 2. Key metrics/indicators, 3. How it works, 4. CTA (Start trial / Contact)

### Spacing Overrides

- No overrides — use Master spacing

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- **Strategy:** Dark or neutral. Status colors (green/amber/red). Data-dense but scannable.

### Component Overrides

- Avoid: Desktop-first causing mobile issues
- Avoid: Large blocking CSS files
- Avoid: Break browser/app back button behavior

---

## Page-Specific Components

- No unique components for this page

---

## Recommendations

- Effects: Spring animations (mass:1 damping:15 stiffness:120); gradient buttons (0052FF→4D7CFF); scale press 0.96→1.0 with haptics; floating FAB with gentle bobbing (Reanimated); glassmorphism BlurView navigation bars; staggered fade-in entrance (Y:20→0 + opacity:0→1); pulsing status dot on section badges; layout transitions (LayoutAnimation or Reanimated entering)
- Responsive: Start with mobile styles then add breakpoints
- Performance: Inline critical CSS defer non-critical
- Navigation: Preserve navigation history properly
- CTA Placement: Primary CTA in nav + After metrics
