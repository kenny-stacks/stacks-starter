# Domain Pitfalls: Chakra UI to shadcn/Tailwind Migration

**Domain:** UI Library Migration (Chakra UI to shadcn/ui + Tailwind CSS)
**Researched:** 2026-01-28
**Confidence:** HIGH (verified with official docs and multiple community sources)

## Critical Pitfalls

Mistakes that cause rewrites, major technical debt, or project delays.

### Pitfall 1: Dynamic Class Name Construction
**What goes wrong:** Developers attempt to build Tailwind classes dynamically (string interpolation, template literals, variables) coming from Chakra's prop-based styling. Tailwind's purge mechanism cannot detect these classes, resulting in styles that don't apply despite correct HTML class attributes.

**Why it happens:** Chakra UI uses runtime style props (`<Box bg={isPrimary ? "blue.500" : "gray.500"} />`), leading developers to assume Tailwind works the same way. Tailwind scans source files at build time, not runtime.

**Consequences:**
- Styles fail silently in production
- Components render unstyled
- Difficult to debug (class names appear in HTML but CSS missing)

**Prevention:**
```typescript
// BAD - Dynamic class construction
const color = isPrimary ? "blue-500" : "gray-500";
<div className={`bg-${color}`} /> // Won't work

// GOOD - Complete class names
<div className={isPrimary ? "bg-blue-500" : "bg-gray-500"} />

// GOOD - Use CSS variables for truly dynamic values
<div className="bg-[var(--dynamic-color)]" style={{ "--dynamic-color": color }} />
```

**Detection:** Run production build and check CSS output size. If significantly smaller than expected or components lack styling, check for dynamic class construction.

**Phase Impact:** Should be addressed in Phase 1 (Foundation/Setup) through linting rules and developer documentation.

---

### Pitfall 2: Provider Architecture Mismatch
**What goes wrong:** Teams attempt to replicate Chakra's `ChakraProvider` pattern, creating multiple wrapper providers (ColorModeProvider, ThemeProvider, etc.) when shadcn requires minimal provider setup.

**Why it happens:** Chakra UI requires `ChakraProvider` at the root with theme configuration. Developers assume shadcn needs similar architecture.

**Consequences:**
- Unnecessary complexity in app structure
- Performance overhead from extra context providers
- Confusion about where theming lives (providers vs CSS variables)
- Hydration mismatches in Next.js SSR

**Prevention:**
- Use only `ThemeProvider` from `next-themes` for dark mode
- Store theme configuration in `tailwind.config.ts` and CSS variables in `globals.css`
- Avoid wrapping components in unnecessary providers
- In Next.js 15, add `suppressHydrationWarning` to html element for theme provider

```typescript
// BAD - Over-engineering providers
<ConfigProvider>
  <ThemeProvider>
    <ColorModeProvider>
      <ChakraStyleProvider>
        {children}
      </ChakraStyleProvider>
    </ColorModeProvider>
  </ThemeProvider>
</ConfigProvider>

// GOOD - Minimal provider setup
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

**Detection:**
- Multiple theme-related providers in app layout
- Theme not persisting across page reloads
- Hydration warnings in console
- Dark mode flickering on page load

**Phase Impact:** Must be addressed in Phase 1 (Foundation/Setup). Incorrect provider setup blocks all subsequent component migration work.

---

### Pitfall 3: Component State Pattern Misunderstanding
**What goes wrong:** Chakra components use controlled/uncontrolled patterns via `useControllableState` hook. Developers port this pattern to shadcn components that already handle it differently via Radix UI primitives.

**Why it happens:** Chakra abstracts state management behind custom hooks. Developers assume they need to replicate this when shadcn/Radix handles it natively.

**Consequences:**
- Duplicated state management logic
- Fighting with Radix UI's built-in state handling
- Controlled/uncontrolled warnings in console
- Components behaving unpredictably

**Prevention:**
- Read Radix UI documentation for each component's state management
- Use Radix's built-in controlled props (`value`, `onValueChange`) directly
- Avoid creating wrapper hooks unless truly needed for business logic
- Trust that shadcn components already handle controlled/uncontrolled modes

**Detection:**
- React warnings about switching between controlled/uncontrolled
- Duplicate state updates
- State not syncing between parent and component

**Phase Impact:** Affects Phase 2-4 (component-by-component migration). Each component needs evaluation of state patterns.

---

### Pitfall 4: Peer Dependency Conflicts (React 19 + Next.js 15)
**What goes wrong:** Installing shadcn components with npm fails due to strict peer dependency checking. Many Radix UI packages specify `"react": "^16.x || ^17.x || ^18.x"` but project uses React 19.

**Why it happens:** Package maintainers haven't updated peer dependency ranges for React 19. npm enforces peer dependencies strictly (unlike pnpm/bun/yarn).

**Consequences:**
- CLI installation fails with "ERESOLVE unable to resolve dependency tree"
- Development blocked until workaround applied
- Risk of using incompatible package versions
- Different behavior across package managers (works in pnpm, fails in npm)

**Prevention:**
```bash
# During initial setup, choose installation flag when prompted by shadcn CLI
npx shadcn@latest init
# Select --legacy-peer-deps or --force when prompted

# For adding components
npx shadcn@latest add button --legacy-peer-deps

# OR switch to pnpm/bun which handle this gracefully
pnpm dlx shadcn@latest add button  # No flags needed
```

**Detection:**
- CLI fails during component installation
- Error message contains "peer dependency" and React version mismatch
- Works in one package manager but not another

**Phase Impact:** Blocks Phase 1 (Foundation/Setup). Must be resolved before any component installation. Document in setup guide.

**Source Verification:** [Official shadcn React 19 docs](https://ui.shadcn.com/docs/react-19)

---

### Pitfall 5: Tailwind Content Path Misconfiguration
**What goes wrong:** Tailwind config doesn't include all file paths where shadcn components live. Purge mechanism strips used classes, causing missing styles in production.

**Why it happens:** shadcn copies components into project (usually `components/ui/`). If content paths don't include this directory, Tailwind won't scan it.

**Consequences:**
- All styles work in development, fail in production build
- Seemingly random missing styles
- CSS bundle doesn't include component classes
- Hard to debug (no errors, just missing styles)

**Prevention:**
```typescript
// tailwind.config.ts
export default {
  content: [
    "./app/**/*.{ts,tsx}",           // Next.js app directory
    "./components/**/*.{ts,tsx}",    // ALL component directories
    "./src/**/*.{ts,tsx}",           // If using src directory
    "./pages/**/*.{ts,tsx}",         // If using pages directory
  ],
  // ...
}
```

**Detection:**
- Run `npm run build` and check CSS output size (should be ~10-50KB with components)
- Compare dev vs production styling
- Check if component-specific classes missing in production CSS

**Phase Impact:** Must be correct in Phase 1 (Foundation/Setup). Incorrect config silently breaks all subsequent work.

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or reduced code quality.

### Pitfall 6: CSS Variable vs Utility Class Confusion
**What goes wrong:** Teams mix CSS variable approach (`bg-primary`) with utility class approach (`bg-blue-500`), creating inconsistent theming that's half-dynamic, half-hardcoded.

**Why it happens:** Documentation shows both approaches. Developers don't realize these are exclusive strategies chosen via `components.json` config (`cssVariables: true|false`).

**Consequences:**
- Half the components use theme variables, half use hardcoded colors
- Dark mode works for some components, not others
- Theme changes only affect subset of UI
- Difficult to maintain consistent design system

**Prevention:**
- Choose CSS variables approach (`cssVariables: true`) for themeable applications
- Define all colors in `globals.css` as CSS variables using OKLCH format
- Use semantic variable names (`bg-primary`, `text-foreground`) not color names (`bg-blue-500`)
- Document decision in project README

```css
/* globals.css - Define theme with CSS variables */
@layer base {
  :root {
    --background: oklch(0.985 0 0);
    --foreground: oklch(0.205 0 0);
    --primary: oklch(0.433 0.132 263);
    --primary-foreground: oklch(0.985 0 0);
  }

  .dark {
    --background: oklch(0.118 0 0);
    --foreground: oklch(0.964 0 0);
    --primary: oklch(0.631 0.189 273);
    --primary-foreground: oklch(0.205 0 0);
  }
}
```

```tsx
// Use CSS variables consistently
<Button className="bg-primary text-primary-foreground">
  Themed Button
</Button>
```

**Detection:**
- Mix of `bg-primary` and `bg-blue-500` across codebase
- Dark mode toggle doesn't affect all components
- Some components don't follow theme color palette

**Phase Impact:** Should be decided in Phase 1 (Foundation/Setup) and enforced via linting in all subsequent phases.

---

### Pitfall 7: Dark Mode Hydration Flashing
**What goes wrong:** Dark mode flickers or shows wrong theme on page load. User sees light theme flash before dark theme applies, or vice versa.

**Why it happens:** Theme detection happens client-side after HTML renders. Server sends light theme HTML, client-side JS applies dark theme, causing visual flash.

**Consequences:**
- Poor UX (theme flicker on every page load)
- Accessibility issues (sudden brightness changes)
- Users see content shift/reflow
- Unprofessional appearance

**Prevention:**
```tsx
// app/layout.tsx (Next.js)
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning> {/* Critical! */}
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange  // Prevents flash
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Alternative approach using data attributes:
```css
/* globals.css */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

```tsx
<ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
```

**Detection:**
- Visual theme flash on page load
- Console warnings about hydration mismatch
- Theme indicator shows wrong state momentarily

**Phase Impact:** Address in Phase 1 (Foundation/Setup) when setting up dark mode. Impacts all phases if not fixed early.

**Source Verification:** [Official shadcn dark mode docs](https://ui.shadcn.com/docs/dark-mode)

---

### Pitfall 8: Component Ownership Maintenance Burden
**What goes wrong:** Teams treat shadcn components like npm packages, expecting automatic updates. Components become outdated, security patches missed, breaking changes unnoticed.

**Why it happens:** shadcn's copy-paste model is novel. Developers assume "install and forget" like traditional UI libraries.

**Consequences:**
- Components diverge from upstream (get custom modifications but lose updates)
- Security vulnerabilities in dependencies (Radix UI) not patched
- Missing new features/improvements from shadcn updates
- No clear update strategy

**Prevention:**
- Document which components are "vanilla shadcn" vs "customized"
- Track shadcn releases via GitHub watch/notifications
- Create update checklist:
  1. Review shadcn changelog
  2. Test component update in branch
  3. Merge if no breaking changes
  4. Document any skipped updates
- Consider component versioning strategy (git tags, comments with install date)

```tsx
// Comment documents component lineage
/**
 * Button component from shadcn/ui
 * Installed: 2026-01-15
 * Version: Based on shadcn/ui commit abc123
 * Customizations: Added loading state prop
 * Last updated: 2026-01-20
 */
export function Button({ loading, ...props }) {
  // ...
}
```

**Detection:**
- No process for updating components
- Components look different from shadcn examples
- Dependencies (Radix UI) showing security warnings

**Phase Impact:** Create update strategy in Phase 1 (Foundation/Setup). Impacts long-term maintenance in Phase 5 (Documentation) and beyond.

---

### Pitfall 9: Over-Customization Breaking Patterns
**What goes wrong:** Developers heavily customize shadcn components, breaking the CSS variable system, Radix UI accessibility features, or Tailwind patterns that enable theme consistency.

**Why it happens:** Ownership model gives false sense that "anything goes." Developers break conventions without understanding their purpose.

**Consequences:**
- Components don't respect theme variables (hardcode colors)
- Accessibility regressions (remove Radix UI props)
- Inconsistent styling (ignore Tailwind conventions)
- Future updates extremely difficult

**Prevention:**
- Understand before modifying:
  - All components use same CSS variables (`--primary`, `--foreground`, etc.)
  - Radix UI provides keyboard navigation, ARIA attributes, focus management
  - Tailwind utilities follow mobile-first responsive pattern
- Extend, don't replace:
  - Add new variants using existing CSS variables
  - Keep Radix UI wrapper structure intact
  - Use Tailwind's extend config for new utilities
- Document breaking changes with rationale

```tsx
// BAD - Breaks theme system
<Button className="bg-blue-500 text-white"> // Hardcoded colors

// GOOD - Extends theme system
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">

// BAD - Breaks Radix accessibility
<div onClick={handleClick}> // Removes Button semantics

// GOOD - Extends Radix component
<Button onClick={handleClick}> // Keeps accessibility
```

**Detection:**
- Component doesn't change with theme toggle
- Keyboard navigation broken
- Screen reader announces component incorrectly
- Component diverges significantly from shadcn source

**Phase Impact:** Most risk in Phase 2-4 (component migration). Set guidelines in Phase 1, enforce in code review.

**Source Verification:** [Vercel Academy on shadcn ownership model](https://vercel.com/academy/shadcn-ui/why-shadcn-ui-is-different)

---

### Pitfall 10: Converting Chakra Responsive Props to Tailwind
**What goes wrong:** Chakra's array/object responsive syntax (`fontSize={{ base: "sm", md: "md", lg: "lg" }}`) doesn't directly translate to Tailwind. Developers write invalid Tailwind or create overly complex responsive patterns.

**Why it happens:** Chakra abstracts responsive design behind prop objects. Tailwind uses mobile-first utility prefixes (`text-sm md:text-md lg:text-lg`).

**Consequences:**
- Invalid Tailwind classes (arrays/objects in className)
- Inconsistent responsive patterns across codebase
- Over-engineering with custom hooks for responsive values
- Mobile layouts broken (not mobile-first)

**Prevention:**
```tsx
// Chakra pattern
<Text fontSize={{ base: "sm", md: "md", lg: "lg" }}>

// Tailwind equivalent (mobile-first)
<p className="text-sm md:text-base lg:text-lg">

// Chakra responsive display
<Box display={{ base: "none", md: "block" }}>

// Tailwind equivalent
<div className="hidden md:block">
```

Create cheatsheet for common patterns:
| Chakra | Tailwind |
|--------|----------|
| `fontSize={{ base: "sm", md: "lg" }}` | `text-sm md:text-lg` |
| `display={{ base: "none", md: "block" }}` | `hidden md:block` |
| `padding={{ base: 4, md: 8 }}` | `p-4 md:p-8` |

**Detection:**
- Responsive breakpoints inconsistent across components
- Mobile layouts not tested/broken
- Complex helper functions for responsive values

**Phase Impact:** Training needed in Phase 1 (Foundation/Setup). Affects every component migration in Phase 2-4.

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

### Pitfall 11: Forgetting to Install Lucide React
**What goes wrong:** shadcn components reference Lucide icons, but package not installed. Components fail to render icons or throw import errors.

**Why it happens:** shadcn CLI prompts for icon library during init, but easy to skip. Developers add components later without dependencies.

**Prevention:**
```bash
npm install lucide-react
```

Check `components.json` for icon library selection:
```json
{
  "iconLibrary": "lucide"
}
```

**Detection:**
- Import errors for icons
- Components render without icons
- Build fails with "Cannot find module 'lucide-react'"

**Phase Impact:** Quick fix anytime. Should be in Phase 1 (Foundation/Setup) setup checklist.

---

### Pitfall 12: Missing PostCSS Configuration
**What goes wrong:** Tailwind v4 requires PostCSS setup, but developers skip configuration file. Build fails or Tailwind directives not processed.

**Why it happens:** Tailwind v3 often worked without explicit PostCSS config. v4 requires it.

**Prevention:**
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Detection:**
- Tailwind utilities not applying
- Build errors about unknown at-rules
- CSS not processing @tailwind directives

**Phase Impact:** Must be correct in Phase 1 (Foundation/Setup).

---

### Pitfall 13: CLI Version Out of Date
**What goes wrong:** Old shadcn CLI version doesn't prompt for React 19 installation flags, causing confusing failures. Missing new component features.

**Why it happens:** Developers install CLI once and forget to update. CLI evolves rapidly (v2.6.3+ fixed peer dependency prompts).

**Prevention:**
```bash
# Don't install globally - use latest via npx
npx shadcn@latest add button

# Check CLI version
npx shadcn@latest --version
```

**Detection:**
- CLI behavior doesn't match documentation
- Missing features described in recent docs
- Peer dependency errors without helpful prompts

**Phase Impact:** Ongoing maintenance. Include "update CLI" in developer setup docs.

**Source Verification:** [GitHub Issue #7606](https://github.com/shadcn-ui/ui/issues/7606)

---

### Pitfall 14: Chakra's useColorModeValue Pattern
**What goes wrong:** Developers search for Chakra's `useColorModeValue(light, dark)` hook equivalent in shadcn. Create complex workarounds when simple CSS approach exists.

**Why it happens:** Chakra centralizes theme logic in JS hooks. Tailwind uses CSS for theme switching.

**Prevention:**
```tsx
// Chakra pattern
const bgColor = useColorModeValue("white", "gray.800");
<Box bg={bgColor}>

// Tailwind pattern - no hook needed!
<div className="bg-white dark:bg-gray-800">

// If truly need JS access to theme
import { useTheme } from "next-themes";
const { theme } = useTheme();
// But avoid - use CSS classes instead
```

**Detection:**
- Custom hooks replicating `useColorModeValue`
- Conditional rendering based on theme
- Complex theme logic in components

**Phase Impact:** Developer education in Phase 1 (Foundation/Setup). Simplifies Phase 2-4 (component migration).

---

### Pitfall 15: Documentation Outdated After Migration
**What goes wrong:** Project docs still reference Chakra patterns, setup instructions, theming approach. New developers follow outdated guidance.

**Why it happens:** Focus on code migration, documentation update forgotten. No clear owner for doc updates.

**Prevention:**
- Update documentation in parallel with code migration
- Search codebase for "Chakra" references:
  ```bash
  rg -i "chakra" --type md
  ```
- Update README, CONTRIBUTING, setup guides, component docs
- Add migration notes explaining changes
- Include new developer setup checklist

**Detection:**
- Documentation mentions Chakra UI
- Setup instructions fail for new developers
- PR comments asking about documentation mismatches

**Phase Impact:** Critical in Phase 5 (Documentation). Start tracking doc TODOs in Phase 1.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Foundation Setup | Peer dependency conflicts blocking installation | Document --legacy-peer-deps approach for npm users. Recommend pnpm. Include in setup guide. |
| Phase 1: Foundation Setup | Tailwind content paths missing component directories | Test production build immediately. Verify CSS bundle includes component styles. |
| Phase 1: Foundation Setup | Provider architecture over-engineered | Start minimal (only ThemeProvider). Add providers only when needed. |
| Phase 2: Core Components | Dynamic Tailwind class construction | Add ESLint rule, create migration cheatsheet, code review focus |
| Phase 2: Core Components | Component state patterns duplicated | Read Radix docs first. Trust built-in state management. |
| Phase 3: Complex Components | Over-customization breaking accessibility | Document Radix UI structure as "do not modify." Extend, don't replace. |
| Phase 3: Complex Components | Responsive prop conversion confusion | Create Chakra-to-Tailwind responsive cheatsheet. Mobile-first training. |
| Phase 4: Integration | Stacks wallet provider conflicts | Test provider ordering. Ensure wallet context separate from UI theme context. |
| Phase 5: Documentation | Setup docs outdated | Parallel doc updates. Search for "Chakra" in docs. New dev testing. |
| Phase 5: Starter Kit | Missing dependency install instructions | Comprehensive dependency list. Test fresh install. |

## Stacks Wallet Integration Specific

### Pitfall 16: Provider Nesting Order (Stacks + Theme)
**What goes wrong:** Stacks wallet provider (Connect) and ThemeProvider conflict or wrong nesting order causes hooks to fail.

**Prevention:**
```tsx
// Correct nesting
<ThemeProvider>  {/* Outer - UI theming */}
  <ConnectProvider>  {/* Inner - Wallet context */}
    <App />
  </ConnectProvider>
</ThemeProvider>
```

**Detection:**
- useConnect() hook returns undefined
- Theme doesn't persist across wallet interactions
- Console errors about missing context

**Phase Impact:** Phase 4 (Stacks Integration). Test thoroughly with wallet connection flows.

---

### Pitfall 17: Wallet Modal Styling Lost
**What goes wrong:** Stacks Connect modal uses Chakra styling. After migration, modal renders unstyled or breaks.

**Prevention:**
- Check if Connect wallet uses custom modal components
- May need to style Connect modal separately or use Connect's built-in theming
- Test wallet connection modal styling in both light/dark modes

**Detection:**
- Wallet connection modal looks broken
- Modal doesn't follow app theme
- Connect button styling inconsistent

**Phase Impact:** Phase 4 (Stacks Integration). Requires Stacks-specific testing.

---

## Starter Kit Documentation Pitfalls

### Pitfall 18: Assuming Technical Knowledge
**What goes wrong:** Documentation assumes users know Tailwind, shadcn's copy-paste model, CSS variables, Next.js 15 App Router, React 19, etc. New developers get lost.

**Prevention:**
- Include "Prerequisites" section listing required knowledge
- Link to learning resources for each technology
- Provide glossary of terms (OKLCH, CSS variables, Radix UI primitives)
- Add "New to X?" sections with quick primers

**Detection:**
- GitHub issues asking basic questions
- Frequent confusion in community discussions
- High barrier to entry for contributors

**Phase Impact:** Phase 5 (Documentation). User testing reveals knowledge gaps.

**Source Verification:** [Technical writing best practices 2026](https://www.archbee.com/blog/technical-writing-mistakes)

---

### Pitfall 19: Documentation Becomes Stale Immediately
**What goes wrong:** Document current setup, but Next.js 16 or Tailwind v5 releases make docs outdated within months.

**Prevention:**
- Note version numbers explicitly: "As of Next.js 15.1, Tailwind 4.0, React 19"
- Include "Last updated: YYYY-MM-DD" on key docs
- Set up GitHub Actions to flag outdated dependencies
- Community contribution guide for updating docs

**Detection:**
- Issues reporting "this doesn't work"
- Instructions fail with newer versions
- Documentation contradicts current behavior

**Phase Impact:** Phase 5 (Documentation) and ongoing maintenance. Plan for doc updates.

---

### Pitfall 20: No Clear Migration Path for Existing Projects
**What goes wrong:** Documentation perfect for new projects, useless for teams wanting to adopt starter kit patterns in existing Chakra projects.

**Prevention:**
- Include migration guide separate from setup guide
- Document incremental migration strategy (keep Chakra + shadcn temporarily)
- Provide component mapping: Chakra Button → shadcn Button
- Share pitfalls specific to migration (this doc!)

**Detection:**
- Questions about mixing Chakra + shadcn
- Requests for migration examples
- Confusion about adoption path

**Phase Impact:** Phase 5 (Documentation). Consider migration guide as first-class doc.

**Source:** Research found that mixing Chakra UI with Tailwind CSS is possible, useful for gradual migration.

---

## Meta: Research Gaps & Validation Flags

**Areas where research was inconclusive (LOW confidence):**
- Specific Stacks Connect modal styling issues (needs hands-on testing)
- Performance benchmarks Chakra vs shadcn in Stacks context
- Breaking changes between recent shadcn versions (rapid iteration)

**Validation needed during implementation:**
- [ ] Test Stacks wallet provider + ThemeProvider interaction
- [ ] Verify Connect modal theming in production
- [ ] Confirm React 19 peer dependency workarounds still needed (may be fixed upstream)
- [ ] Test all common Chakra components have clear shadcn equivalents

**Known unknowns:**
- Future breaking changes in Tailwind v4 (still evolving)
- shadcn component registry changes (copy-paste approach may evolve)
- Next.js 15 + React 19 stability (recent releases)

---

## Sources

### Official Documentation (HIGH confidence)
- [shadcn/ui Dark Mode Documentation](https://ui.shadcn.com/docs/dark-mode)
- [shadcn/ui React 19 + Next.js 15 Compatibility](https://ui.shadcn.com/docs/react-19)
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [Vercel Academy - Why shadcn/ui is Different](https://vercel.com/academy/shadcn-ui/why-shadcn-ui-is-different)
- [Vercel Academy - Updating and Maintaining Components](https://vercel.com/academy/shadcn-ui/updating-and-maintaining-components)

### Community Experience Reports (MEDIUM confidence)
- [Chakra UI vs Shadcn UI - DEV Community](https://dev.to/dera_johnson/chakra-ui-vs-shadcn-ui-5ll)
- [Migrating from Chakra UI to Tailwind CSS - DEV Community](https://dev.to/oncet/migrating-from-chakra-ui-to-tailwind-css-my-experience-5f2c)
- [Why I moved from chakra-ui to tailwind-ui - Medium](https://medium.com/@kalkanyunus/why-i-moved-my-websites-ui-from-chakra-ui-to-tailwind-454800a12393)
- [React UI libraries in 2025 - Makers' Den](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra)
- [shadcn/ui with Next.js 15 and React 19 - JavaScript in Plain English](https://javascript.plainenglish.io/shadcn-ui-with-next-js-15-and-react-19-8b04acd90a1a)

### Technical Deep Dives (MEDIUM confidence)
- [The shadcn Revolution - Medium](https://medium.com/@genildocs/the-shadcn-revolution-why-developers-are-abandoning-traditional-component-libraries-a9a4747935d5)
- [Troubleshooting Tailwind CSS - Mindful Chase](https://www.mindfulchase.com/explore/troubleshooting-tips/front-end-frameworks/troubleshooting-tailwind-css-build-errors,-missing-styles,-and-configuration-pitfalls-in-front-end-projects.html)
- [Tailwind CSS Common Mistakes - Helius Work](https://heliuswork.com/blogs/tailwind-css-common-mistakes/)
- [Tailwind CSS in Large Projects - Medium](https://medium.com/@vishalthakur2463/tailwind-css-in-large-projects-best-practices-pitfalls-bf745f72862b)

### Issue Trackers & Discussions (MEDIUM confidence)
- [GitHub Issue #7606 - CLI peer dependency prompt](https://github.com/shadcn-ui/ui/issues/7606)
- [GitHub Issue #5557 - Next.js 15 / React 19 installation](https://github.com/shadcn-ui/ui/issues/5557)
- [GitHub Issue #5562 - Peer Dependency Conflicts](https://github.com/shadcn-ui/ui/issues/5562)
- [GitHub Discussion #1147 - Dark mode selector issues](https://github.com/shadcn-ui/ui/issues/1147)

### Best Practices Guides (MEDIUM confidence)
- [Shadcn UI Best Practices - Cursor Rules](https://cursorrules.org/article/shadcn-cursor-mdc-file)
- [Technical Writing Mistakes - Archbee Blog](https://www.archbee.com/blog/technical-writing-mistakes)
- [Code Documentation Best Practices 2026 - Qodo.ai](https://www.qodo.ai/blog/code-documentation-best-practices-2026/)
- [Good Documentation Practices 2025 - Technical Writer HQ](https://technicalwriterhq.com/documentation/good-documentation-practices/)

### Ecosystem Context (MEDIUM-LOW confidence)
- [Is it possible to mix Chakra UI with Tailwind CSS - GeeksforGeeks](https://www.geeksforgeeks.org/css/it-is-possible-to-mix-chakra-ui-with-tailwind-css/)
- [React Fundamentals in 2026 - Nucamp](https://www.nucamp.co/blog/react-fundamentals-in-2026-components-hooks-react-compiler-and-modern-ui-development)
