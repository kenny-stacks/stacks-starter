---
phase: 01-foundation-developer-setup
plan: 04
subsystem: ui-foundation
tags: [dark-mode, next-themes, theming, tailwind, ui-migration]
completed: 2026-01-28

requires:
  - 01-02: shadcn/ui and Tailwind CSS configuration with CSS variables

provides:
  - Dark mode implementation using next-themes
  - Theme toggle component for interactive theme switching
  - Chakra UI completely removed from codebase
  - AppProviders structure combining QueryClient + ThemeProvider

affects:
  - Phase 2: UI Component Library (will rebuild components without Chakra)
  - Phase 3: Wallet Integration (will integrate wallet providers into AppProviders)

tech-stack:
  added:
    - next-themes@0.4.6
  removed:
    - "@chakra-ui/react"
    - "@chakra-ui/icons"
  patterns:
    - Client Component pattern for theme provider isolation
    - Hydration-safe theme detection with mounted state
    - Provider composition pattern (QueryClient > ThemeProvider > children)

key-files:
  created:
    - front-end/src/components/providers/theme-provider.tsx
    - front-end/src/components/providers/app-providers.tsx
    - front-end/src/components/theme-toggle.tsx
    - front-end/src/components/_deprecated-chakra/ (temporary, Phase 2 will rebuild)
    - front-end/src/hooks/_deprecated-chakra/ (temporary, Phase 2 will rebuild)
  modified:
    - front-end/src/app/layout.tsx
    - front-end/src/app/page.tsx
    - front-end/package.json
    - front-end/tsconfig.json
  deleted:
    - front-end/src/theme.ts
    - front-end/src/components/ui/Providers.tsx

decisions:
  - decision: Use next-themes for dark mode instead of custom implementation
    rationale: Handles SSR hydration, system theme detection, and localStorage persistence automatically
    alternatives: [Custom useTheme hook, CSS-only dark mode]
    phase: 01
    plan: 04

  - decision: Move Chakra-dependent components to _deprecated-chakra folders instead of deleting
    rationale: Preserves existing functionality for reference during Phase 2 rebuild, allows TypeScript to compile
    alternatives: [Delete and rebuild from scratch, Convert components incrementally]
    phase: 01
    plan: 04

  - decision: Exclude wallet providers from AppProviders in Phase 1
    rationale: Wallet integration is Phase 3 scope, foundation must be buildable without wallet dependencies
    alternatives: [Include wallet providers now, Create separate wallet provider wrapper]
    phase: 01
    plan: 04

duration: 5min
---

# Phase 1 Plan 4: Dark Mode & UI Migration Summary

**One-liner:** Implemented dark mode with next-themes (SSR-safe, system theme support, no hydration flash), created interactive theme toggle, removed Chakra UI dependencies, established AppProviders foundation.

## What Was Built

### Dark Mode Foundation
- **next-themes Integration:** Installed next-themes@0.4.6 for robust dark mode support
- **ThemeProvider Wrapper:** Created client component wrapper to isolate next-themes usage
- **Hydration Safety:** Configured with suppressHydrationWarning and mounted state pattern
- **System Theme Detection:** Defaults to system preference with `defaultTheme="system"` and `enableSystem`
- **CSS Class Strategy:** Uses `attribute="class"` for Tailwind dark mode compatibility

### Interactive Theme Toggle
- **ThemeToggle Component:** Built client component with sun/moon icons using lucide-react
- **Hydration-Safe Rendering:** Uses mounted state to prevent hydration mismatches
- **Layout Shift Prevention:** Renders placeholder button during hydration for stable layout
- **Visual Feedback:** Hover states and smooth transitions for better UX
- **Accessibility:** Includes aria-label for screen readers

### Chakra UI Removal
- **Dependencies Removed:** Uninstalled @chakra-ui/react and @chakra-ui/icons (62 packages)
- **Old Providers Deleted:** Removed Chakra-based Providers.tsx and theme.ts
- **Components Preserved:** Moved 9 Chakra-dependent components to _deprecated-chakra for Phase 2 reference
- **Build Compatibility:** Updated tsconfig.json to exclude deprecated folders
- **Clean Foundation:** No Chakra code in active codebase, clean build with no Chakra errors

### AppProviders Architecture
- **Provider Composition:** QueryClientProvider (outer) > ThemeProvider (inner) > children
- **Phase 3 Ready:** Commented imports for HiroWalletProvider and DevnetWalletProvider
- **Centralized Configuration:** Single source of truth for app-wide providers
- **Type Safety:** Properly typed with React.ComponentProps pattern

### Layout & Page Updates
- **Root Layout:** Updated to use AppProviders, added suppressHydrationWarning, removed Navbar
- **Metadata Update:** Changed branding to "Stacks Starter"
- **Font Rendering:** Added antialiased class for better font quality
- **Simplified Page:** Created temporary foundation-focused home page with theme toggle demo

## Key Decisions Made

### 1. next-themes Over Custom Implementation
**Decision:** Use next-themes library instead of building custom dark mode solution.

**Rationale:**
- Handles complex SSR hydration edge cases automatically
- Provides battle-tested system theme detection
- Manages localStorage persistence with sync across tabs
- Reduces maintenance burden for starter kit

**Impact:** Developers get robust dark mode out of the box with minimal code.

### 2. Preserve Chakra Components in _deprecated-chakra
**Decision:** Move Chakra-dependent components to _deprecated-chakra folders instead of deleting.

**Rationale:**
- Preserves working functionality for reference during Phase 2 rebuild
- Documents existing features that need shadcn equivalents
- Allows TypeScript build to succeed by excluding from compilation
- Safer migration path than wholesale deletion

**Impact:** Phase 2 can rebuild components with full context of original implementations.

### 3. Defer Wallet Providers to Phase 3
**Decision:** Exclude HiroWalletProvider and DevnetWalletProvider from AppProviders in Phase 1.

**Rationale:**
- Wallet integration is explicitly Phase 3 scope
- Foundation must build without wallet dependencies
- Commented imports clearly mark where they'll be integrated
- Reduces complexity and potential breaking changes in foundation phase

**Impact:** Clean separation of concerns, Phase 3 has clear integration points.

## Technical Implementation Notes

### Hydration Safety Pattern
```typescript
const [mounted, setMounted] = React.useState(false)

React.useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) {
  return <PlaceholderButton />
}
```
This pattern prevents hydration mismatches by:
1. Server renders placeholder with stable dimensions
2. Client mounts and detects theme
3. Re-renders with actual theme-based content
4. No layout shift due to matching placeholder dimensions

### Theme Configuration
```typescript
<ThemeProvider
  attribute="class"           // Use class-based dark mode
  defaultTheme="system"       // Respect OS preference
  enableSystem                // Enable system theme detection
  disableTransitionOnChange   // Prevent flash during theme switch
>
```

### Provider Nesting Order
```
QueryClientProvider (outermost - data layer)
  └─ ThemeProvider (theming layer)
      └─ children (app content)
```
This order ensures:
- React Query available globally
- Theme context available to all components
- Clean separation of concerns

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Moved Chakra components to make build succeed**
- **Found during:** Task 3
- **Issue:** Build failed with TypeScript errors for Chakra imports after removing dependencies
- **Fix:** Created _deprecated-chakra folders and moved 9 components + 1 hook, updated tsconfig.json to exclude
- **Files modified:** All Chakra-dependent components, tsconfig.json
- **Commit:** 291f560

**2. [Rule 3 - Blocking] Simplified page.tsx to remove Chakra component dependencies**
- **Found during:** Task 3
- **Issue:** page.tsx imported CampaignDetails which has Chakra dependencies
- **Fix:** Replaced with temporary foundation-focused page showing theme toggle
- **Files modified:** front-end/src/app/page.tsx
- **Commit:** 291f560
- **Note:** Campaign functionality will be restored in Phase 2 with shadcn components

## Verification Results

All success criteria met:

✅ **next-themes installed:** package.json shows next-themes@0.4.6
✅ **ThemeProvider created:** theme-provider.tsx exports NextThemesProvider wrapper
✅ **suppressHydrationWarning:** Present on <html> element in layout.tsx
✅ **ThemeProvider configured:** attribute="class", defaultTheme="system", enableSystem
✅ **Theme toggle created:** theme-toggle.tsx uses useTheme hook with sun/moon icons
✅ **Theme toggle integrated:** Added to main page for developer testing
✅ **Chakra removed:** No @chakra-ui dependencies in package.json
✅ **Old files deleted:** Providers.tsx and theme.ts removed
✅ **AppProviders created:** Combines QueryClient + ThemeProvider
✅ **Root layout updated:** Uses AppProviders with suppressHydrationWarning
✅ **Build succeeds:** pnpm build completes successfully
✅ **FOUN-04 complete:** Dark mode works without hydration flash
✅ **DEVX-05 complete:** pnpm dev starts without Chakra errors

### Build Output
```
Route (app)                              Size     First Load JS
┌ ○ /                                    2.71 kB         108 kB
└ ○ /_not-found                          980 B           106 kB
+ First Load JS shared by all            105 kB
```

Build is clean with only linting warnings (Tailwind class order suggestions, not errors).

## Next Phase Readiness

### Blockers
None. Phase 1 is complete.

### Concerns for Phase 2
1. **Chakra Components Need Rebuild:** 9 components in _deprecated-chakra folders need shadcn equivalents:
   - Navbar (navigation with wallet button)
   - CampaignDetails (main campaign display)
   - CampaignAdminControls (admin panel)
   - DonationModal (donation flow)
   - ConnectWallet (wallet connection UI)
   - DevnetWalletButton (devnet wallet selector)
   - StyledMarkdown (markdown rendering)
   - DevnetWalletProvider (devnet wallet context)
   - HiroWalletProvider (Hiro wallet context)

2. **Hook Migration:** useTransactionExecuter.tsx uses Chakra toast notifications - needs shadcn/ui Toast component

3. **Wallet Integration Pattern:** When rebuilding wallet providers in Phase 3, they'll need to:
   - Integrate into AppProviders in the correct nesting order
   - Use shadcn/ui components instead of Chakra
   - Maintain existing wallet selection logic

### Handoff Notes for Phase 2
- All shadcn/ui foundation is in place from Plan 01-02
- Dark mode works and will automatically apply to shadcn components
- Reference implementations exist in _deprecated-chakra folders
- Priority rebuild order: Navbar → ConnectWallet → DonationModal → CampaignDetails

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| 6b06051 | feat | Install next-themes and create ThemeProvider |
| 3f11c3d | feat | Create AppProviders and remove Chakra UI |
| 291f560 | feat | Update root layout for dark mode |
| 8d2d4ed | feat | Create theme toggle component |

**Total commits:** 4 (all atomic, per-task)
**Files changed:** 18 files
**Lines added:** 126
**Lines deleted:** 675

## Performance Impact

- **Bundle size reduced:** Removed 62 packages (Chakra UI ecosystem)
- **First Load JS:** 105 kB (reasonable for React + Next.js + React Query + next-themes)
- **Build time:** ~10-15 seconds (clean build)
- **Theme switching:** Instant with no flash (next-themes optimizations)

## Lessons Learned

1. **TypeScript Scope Management:** Moving files to excluded directories is cleaner than deleting during migration
2. **Provider Order Matters:** QueryClient should be outermost to make data available to theme-dependent components
3. **Hydration Safety Critical:** next-themes handles this well, but custom components need mounted state pattern
4. **Dependency Removal Impact:** Removing major UI framework affects more files than expected - systematic approach needed

## Related Documentation

- next-themes: https://github.com/pacocoursey/next-themes
- Tailwind Dark Mode: https://tailwindcss.com/docs/dark-mode
- Next.js App Router: https://nextjs.org/docs/app/building-your-application/routing
- shadcn/ui Theming: https://ui.shadcn.com/docs/theming
