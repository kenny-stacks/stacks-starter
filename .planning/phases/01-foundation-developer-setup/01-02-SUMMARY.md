---
phase: 01-foundation-developer-setup
plan: 02
title: "Tailwind CSS v3 and shadcn/ui Configuration"
one-liner: "Installed Tailwind CSS v3 with PostCSS, initialized shadcn/ui with CSS variables for theming, verified production builds"
subsystem: ui-infrastructure
status: complete
completed: 2026-01-28

# Dependencies
requires:
  - 01-01  # pnpm package manager (required for dependency installation)
provides:
  - tailwind-v3  # Utility-first CSS framework configured and working
  - shadcn-ui  # Component library initialized with CSS variables
  - css-theming  # Dark mode support via CSS variables and class-based switching
  - cn-utility  # Class name merging utility for component styling
affects:
  - 01-03  # Can now remove Chakra UI safely (Tailwind/shadcn replaces it)
  - 02-*  # UI components can use Tailwind classes
  - 03-*  # Wallet UI can be styled with shadcn components

# Tech Stack
tech-stack:
  added:
    - tailwindcss: "3.4.19"  # Utility-first CSS framework
    - postcss: "8.5.6"  # CSS transformation tool
    - autoprefixer: "10.4.23"  # CSS vendor prefix automation
    - shadcn/ui: "latest"  # Radix UI-based component library
    - clsx: "2.1.1"  # Conditional class name utility
    - tailwind-merge: "3.4.0"  # Tailwind class conflict resolver
    - lucide-react: "0.563.0"  # Icon library for shadcn components
    - tailwindcss-animate: "latest"  # Animation utilities plugin
  patterns:
    - utility-first-css  # Tailwind's core paradigm
    - css-variables-theming  # HSL-based theme system
    - class-based-dark-mode  # darkMode: ["class"] approach
    - cn-utility-pattern  # clsx + tailwind-merge composition

# File Tracking
key-files:
  created:
    - front-end/tailwind.config.ts  # Tailwind configuration with content paths and dark mode
    - front-end/postcss.config.mjs  # PostCSS with Tailwind and Autoprefixer plugins
    - front-end/components.json  # shadcn/ui configuration with CSS variables enabled
    - front-end/src/lib/utils.ts  # cn() utility for class name merging
    - front-end/vitest.config.mts  # Test configuration (shadcn-generated)
    - front-end/vitest.setup.ts  # Test setup (shadcn-generated)
    - front-end/src/lib/__tests__/example.test.ts  # Example test (shadcn-generated)
  modified:
    - front-end/package.json  # Added Tailwind, shadcn, and utility dependencies
    - front-end/pnpm-lock.yaml  # Locked dependency versions
    - front-end/src/app/globals.css  # Added @tailwind directives and 49 CSS variables
    - front-end/tailwind.config.ts  # Extended with shadcn color system and animation plugin

# Decisions
decisions:
  - id: TAIL-01
    question: "Tailwind v3 vs v4?"
    decision: "Use Tailwind v3.4.19"
    rationale: "v4 is in alpha; v3 is stable and widely adopted for starter kits"
    impact: "Will need to migrate to v4 eventually, but v3 provides stable foundation"

  - id: SHAD-01
    question: "Which shadcn style variant?"
    decision: "Default style with Neutral base color"
    rationale: "Default style is most versatile; Neutral provides professional gray palette"
    impact: "Can change via shadcn CLI later if needed"

  - id: SHAD-02
    question: "CSS variables vs Tailwind classes for theming?"
    decision: "Use CSS variables (cssVariables: true)"
    rationale: "Enables runtime theme switching without rebuilding CSS"
    impact: "All shadcn components use HSL CSS variables, easy dark mode toggle"

  - id: SHAD-03
    question: "Include shadcn test infrastructure?"
    decision: "Keep vitest.config.mts and test files"
    rationale: "No harm keeping them; useful for future component testing"
    impact: "Project has Vitest configured but not required to use it"

# Metrics
duration: 4.65 min
tasks: 3
commits: 3
files-modified: 11
---

# Phase 01 Plan 02: Tailwind CSS v3 and shadcn/ui Configuration Summary

**Status:** Complete
**One-liner:** Installed Tailwind CSS v3 with PostCSS, initialized shadcn/ui with CSS variables for theming, verified production builds

## Objective Achieved

Successfully installed and configured Tailwind CSS v3 with PostCSS, initialized shadcn/ui with CSS variables for theming support, and verified the setup works in both development and production builds.

**Purpose fulfilled:** Established modern UI foundation to replace Chakra UI. Tailwind CSS provides utility-first styling, shadcn/ui provides accessible Radix UI-based components, and CSS variables enable seamless dark mode theming.

## Tasks Completed

| # | Task Name | Commit | Files Modified | Status |
|---|-----------|--------|----------------|--------|
| 1 | Install Tailwind CSS v3 and PostCSS | b2fce77 | package.json, pnpm-lock.yaml, tailwind.config.ts, postcss.config.mjs | ✓ Complete |
| 2 | Initialize shadcn/ui | a5b2b26 | package.json, pnpm-lock.yaml, components.json, src/lib/utils.ts, globals.css, tailwind.config.ts, vitest.config.mts | ✓ Complete |
| 3 | Verify Tailwind works in development | 84ae01b | vitest.setup.ts, src/lib/__tests__/example.test.ts | ✓ Complete |

## What Was Built

### Tailwind CSS v3 Configuration
- **tailwind.config.ts**: TypeScript config with content paths for `./src/**/*` and `./components/**/*`
- **Dark mode**: Class-based approach (`darkMode: ["class"]`) for manual theme toggle control
- **Content paths**: Critical purge configuration to prevent production CSS issues
- **PostCSS**: Configured with tailwindcss and autoprefixer plugins

### shadcn/ui Initialization
- **components.json**: Configuration with `cssVariables: true`, `rsc: true`, proper aliases
- **cn() utility**: Class merging utility at `@/lib/utils` combining clsx + tailwind-merge
- **CSS variables**: 49 HSL-based CSS variables in globals.css for complete theme system
- **Color system**: Neutral base color with primary, secondary, accent, destructive, muted variants
- **Animation**: tailwindcss-animate plugin added for component motion

### Verification
- **Production build**: Next.js build succeeds, generates 9616-byte CSS output
- **Type checking**: TypeScript compilation passes
- **Linting**: ESLint validation passes (1 pre-existing warning unrelated to Tailwind)

## Deviations from Plan

### Auto-added Test Infrastructure (shadcn CLI behavior)

**1. [Rule 2 - Missing Critical] shadcn CLI added Vitest configuration**
- **Found during:** Task 2 (shadcn init)
- **Issue:** shadcn CLI automatically creates test infrastructure (vitest.config.mts, vitest.setup.ts, example.test.ts)
- **Rationale:** This is standard shadcn behavior; the CLI assumes projects want testing capability
- **Decision:** Kept the files (no harm, useful for future component testing)
- **Files added:**
  - `vitest.config.mts` - Vitest configuration with React plugin
  - `vitest.setup.ts` - Testing Library setup
  - `src/lib/__tests__/example.test.ts` - Example test demonstrating Vitest works
- **Commit:** 84ae01b (Task 3)

**2. [Rule 3 - Blocking] Added @tailwind directives before shadcn init**
- **Found during:** Task 2 (shadcn init validation)
- **Issue:** shadcn CLI validates Tailwind by checking for @tailwind directives in globals.css
- **Fix:** Added `@tailwind base/components/utilities` to globals.css before running shadcn init
- **Impact:** shadcn init succeeded, then modified globals.css further with CSS variables
- **Files modified:** `src/app/globals.css`
- **Commit:** a5b2b26 (Task 2)

## Technical Details

### Content Path Configuration
```typescript
content: [
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
]
```
**Critical for production:** Missing paths cause Tailwind to purge needed styles in build.

### Dark Mode Strategy
```typescript
darkMode: ["class"]
```
**Enables manual control:** App can toggle `.dark` class on root element for theme switching.

### CSS Variables Theme System
- **49 CSS variables** defined in `:root` and `.dark` selectors
- **HSL color format**: Enables shade generation (`hsl(var(--primary) / 0.9)`)
- **Variable categories**: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart, radius

### cn() Utility Pattern
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
**Purpose:** Merge conditional classes and resolve Tailwind conflicts (e.g., `p-4` + `p-2` = `p-2`)

## Dependencies & Integration

### Depends On
- **01-01 (pnpm migration):** Required for installing Tailwind and shadcn dependencies without peer conflict issues

### Provides For
- **01-03 (Chakra removal):** Tailwind/shadcn now ready as Chakra replacement
- **Phase 02 (UI components):** Can style pages with Tailwind utilities
- **Phase 03 (Wallet UI):** Can use shadcn components (Button, Card, Dialog, etc.)

### Affects Future Work
- All new components should use Tailwind classes, not CSS modules or Chakra
- Dark mode implementation should use `.dark` class toggle approach
- Component styling should use cn() utility for conditional class merging
- ESLint rule `tailwindcss/no-custom-classname` recommended for next plan

## Decisions Made

1. **Tailwind v3 over v4:** v3.4.19 is stable and battle-tested; v4 still in alpha
2. **CSS variables over Tailwind classes:** Enables runtime theming without CSS rebuild
3. **Default shadcn style with Neutral base:** Versatile professional gray palette
4. **Keep shadcn test infrastructure:** No harm; useful for component testing later
5. **Class-based dark mode:** Manual control via `.dark` class toggle

## Key Learnings

1. **shadcn CLI validation:** Requires @tailwind directives in globals.css before init
2. **shadcn creates test files:** Standard behavior to add Vitest configuration
3. **Content paths are critical:** Missing paths cause production CSS purging issues
4. **CSS variables unlocked:** 49 theme variables enable sophisticated theming
5. **Build verification essential:** Confirms Tailwind compiles correctly in production

## Verification Results

All success criteria met:

- ✓ Tailwind CSS v3 installed with PostCSS
- ✓ tailwind.config.ts has correct content paths and darkMode: ["class"]
- ✓ shadcn/ui initialized with CSS variables enabled (cssVariables: true)
- ✓ components.json created with proper aliases (@/components, @/lib/utils)
- ✓ cn() utility available at @/lib/utils
- ✓ globals.css has @tailwind directives and 49 CSS variable definitions
- ✓ Production build succeeds (9616 bytes CSS output)
- ✓ FOUN-01 (Tailwind configured) complete
- ✓ FOUN-02 (shadcn initialized) complete

## Next Phase Readiness

### Blockers: None

### Recommendations for Next Plan (01-03: Remove Chakra UI)
1. **Audit Chakra imports:** Search for `@chakra-ui` imports across codebase
2. **Replace incrementally:** Convert one component at a time to Tailwind
3. **Test after each conversion:** Ensure UI still works before moving to next component
4. **Remove Chakra deps last:** Only uninstall after all imports removed
5. **Add ESLint rule:** `tailwindcss/no-custom-classname` to prevent className typos

### Ready to Proceed
- Tailwind and shadcn fully configured and verified
- No blocking issues or concerns
- Next plan can safely remove Chakra UI dependencies
