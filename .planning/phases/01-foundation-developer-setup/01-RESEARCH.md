# Phase 1: Foundation & Developer Setup - Research

**Researched:** 2026-01-28
**Domain:** Next.js 15 + Tailwind CSS v3 + shadcn/ui Setup & Migration
**Confidence:** HIGH

## Summary

Phase 1 establishes the modern UI foundation and development tooling for the Stacks starter kit. The implementation involves installing Tailwind CSS v3 (not v4 due to browser compatibility), initializing shadcn/ui with the CSS variables approach, configuring ESLint 9 with Tailwind linting, setting up Vitest for contract testing, implementing dark mode without hydration flash, and migrating from npm to pnpm.

The standard approach is well-documented with mature tooling. Key decisions are locked: Tailwind v3, shadcn/ui with CSS variables, ESLint 9 flat config, pnpm as package manager. The primary technical challenges are peer dependency conflicts with React 19 (solved with pnpm), dynamic class construction pitfalls (solved with ESLint rules), and dark mode hydration flash (solved with next-themes configuration).

Existing research in `.planning/research/` provides comprehensive technology stack details. This research focuses on implementation specifics for Phase 1.

**Primary recommendation:** Use pnpm for installation to avoid React 19 peer dependency issues, configure ESLint with Tailwind plugin immediately to catch dynamic class construction, and implement dark mode with suppressHydrationWarning from the start.

## Standard Stack

The established libraries/tools for Next.js 15 + Tailwind + shadcn/ui setup:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v3.4.x | Utility-first CSS framework | v3 has better browser compatibility for starter kits (v4 requires Safari 16.4+, Chrome 111+). Mature plugin ecosystem. |
| shadcn/ui | latest via CLI | Customizable component library | Industry standard for modern Next.js apps. Copy-paste model gives full control. Built on Radix UI for accessibility. |
| next-themes | latest | Theme management | Official shadcn recommendation for dark mode. Prevents hydration flash, system theme detection. |
| ESLint 9 | 9.x | Linting | Flat config format. ESLint 8 reached end-of-life Oct 2024. Next.js 15 supports ESLint 9. |
| eslint-plugin-tailwindcss | latest | Tailwind linting | Catches dynamic class construction, enforces class order, prevents contradicting classes. |
| Vitest | 2.x | Unit testing | 10-20x faster than Jest, native ESM support, excellent Next.js 15 integration. |
| pnpm | latest | Package manager | Handles React 19 peer dependencies gracefully. 3-4x faster than npm. Smaller node_modules. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitejs/plugin-react | latest | Vitest React support | Required for testing React components with Vitest |
| jsdom | latest | DOM environment | Required for Vitest to test components (simulates browser) |
| @testing-library/react | latest | Component testing utilities | User-focused testing, works with React 19 |
| @testing-library/dom | latest | DOM testing utilities | Peer dependency of @testing-library/react |
| vite-tsconfig-paths | latest | Path alias support | Enables @/ imports in Vitest tests |
| Prettier | 3.x | Code formatting | Industry standard, separate from ESLint |
| prettier-plugin-tailwindcss | latest | Tailwind class sorting | Automatically sorts Tailwind classes in recommended order |
| Lucide React | latest | Icon library | Default for shadcn/ui components, tree-shakeable |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v3 | Tailwind v4 | v4 is faster (10x build speed) but requires modern browsers. Starter kit should maximize compatibility. |
| pnpm | npm with --legacy-peer-deps | npm works but requires flags for every install. pnpm handles React 19 peer deps natively. |
| next-themes | Custom dark mode | next-themes prevents hydration flash out-of-box. Custom solution requires complex SSR handling. |
| Vitest | Jest | Jest is mature but 10-20x slower. Vitest has native ESM support, better Next.js 15 integration. |
| eslint-plugin-tailwindcss | Manual code review | Plugin catches errors at dev time. Manual review is error-prone and doesn't scale. |

**Installation:**
```bash
# Switch to pnpm
cd front-end
npm install -g pnpm
pnpm install  # Recreates lock file from package.json

# Install Tailwind CSS v3
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Initialize shadcn/ui (no flags needed with pnpm)
pnpm dlx shadcn@latest init

# Install dark mode support
pnpm add next-themes

# Install Vitest
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths

# Install ESLint Tailwind plugin
pnpm add -D eslint-plugin-tailwindcss

# Install Prettier with Tailwind plugin
pnpm add -D prettier prettier-plugin-tailwindcss

# Add essential shadcn components (minimal set)
pnpm dlx shadcn@latest add button card input dialog dropdown-menu sonner badge skeleton
```

## Architecture Patterns

### Recommended Project Structure
```
front-end/
├── src/
│   ├── app/                     # App Router (routes, layouts, pages)
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── page.tsx            # Homepage
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (atoms)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── providers/          # Context providers (Client Components)
│   │   │   ├── theme-provider.tsx
│   │   │   └── app-providers.tsx
│   │   └── features/           # Domain-specific components
│   ├── lib/
│   │   ├── stacks/             # Stacks blockchain integration (KEEP)
│   │   └── utils.ts            # shadcn cn() utility + helpers
│   ├── hooks/                  # Custom React hooks
│   ├── constants/              # Configuration & constants
│   └── types/                  # TypeScript definitions
├── examples/                    # Reference implementations (DELETE AFTER LEARNING)
│   └── counter/                # Example feature - deletable
│       ├── components/
│       ├── hooks/
│       └── README.md
├── vitest.config.mts           # Vitest configuration
├── components.json             # shadcn configuration
├── tailwind.config.ts          # Tailwind configuration
├── eslint.config.mjs           # ESLint 9 flat config
├── .prettierrc                 # Prettier configuration
└── package.json
```

### Pattern 1: Package Manager Migration (npm → pnpm)
**What:** Replace npm with pnpm to avoid React 19 peer dependency conflicts and improve performance.

**When to use:** Phase 1 foundation setup. Do this before installing dependencies.

**Steps:**
```bash
# 1. Install pnpm globally
npm install -g pnpm

# 2. Delete npm artifacts
rm package-lock.json
rm -rf node_modules

# 3. Install with pnpm (creates pnpm-lock.yaml)
pnpm install

# 4. Update package.json scripts (optional - pnpm compatible with npm scripts)
# pnpm dev, pnpm build, pnpm test all work

# 5. Configure git
echo "pnpm-lock.yaml" >> .gitignore  # If using npm-shrinkwrap
# Or commit pnpm-lock.yaml (recommended)
```

**Why:** pnpm uses hard links to save disk space, handles React 19 peer dependencies without flags, and is 3-4x faster than npm. January 2026 benchmarks show pnpm completes Next.js 15 app installs in 12.4s vs npm's 46.1s.

**Source:** [Transitioning from npm to pnpm in Next.js Projects](https://medium.com/@caiqinghua/transitioning-from-npm-to-pnpm-in-next-js-projects-73957b90687f)

### Pattern 2: shadcn/ui Initialization with Next.js 15
**What:** Initialize shadcn/ui with CSS variables approach for themeable components.

**When to use:** After Tailwind is installed, before adding components.

**Implementation:**
```bash
# Run init CLI (interactive)
pnpm dlx shadcn@latest init

# Choose these options:
# Style: Default (or New York)
# Base color: Slate (neutral gray palette)
# CSS variables: Yes (enables theming)
# TypeScript: Yes
```

**Generated files:**
- `components.json` - shadcn configuration
- `components/ui/` - component installation directory
- `lib/utils.ts` - cn() utility for className merging
- Updated `tailwind.config.ts` - CSS variable colors
- Updated `app/globals.css` - theme variables

**components.json structure:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Key settings:**
- `"rsc": true` - React Server Components support (App Router)
- `"cssVariables": true` - CSS variables for theming (enables dark mode)
- `"baseColor": "slate"` - Neutral gray palette

**Source:** [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next)

### Pattern 3: Dark Mode Implementation (No Hydration Flash)
**What:** Implement dark mode using next-themes with proper SSR hydration handling.

**When to use:** Phase 1, immediately after shadcn initialization.

**Implementation:**

**Step 1: Create theme provider (Client Component)**
```typescript
// components/providers/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Step 2: Update root layout**
```typescript
// app/layout.tsx
import { ThemeProvider } from "@/components/providers/theme-provider"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Critical attributes:**
- `suppressHydrationWarning` on `<html>` - Prevents React hydration mismatch warnings during theme detection
- `attribute="class"` - Uses CSS classes for theme switching (adds/removes `dark` class)
- `defaultTheme="system"` - Respects user's OS preference by default
- `enableSystem` - Enables automatic system theme detection
- `disableTransitionOnChange` - Prevents animation flashing when toggling themes

**Why this prevents hydration flash:** next-themes injects a script in `<head>` that runs before React hydration, setting the correct theme class before any content renders. `suppressHydrationWarning` tells React to expect this client-side difference.

**Source:** [shadcn/ui Dark Mode for Next.js](https://ui.shadcn.com/docs/dark-mode/next)

### Pattern 4: Tailwind Configuration for shadcn/ui
**What:** Configure Tailwind with correct content paths and CSS variable colors.

**When to use:** Phase 1, during shadcn initialization (CLI updates this automatically).

**Implementation:**
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // If using src directory
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui semantic colors (CSS variables)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
export default config
```

**Critical: Content paths must include ALL directories with components:**
- `./components/**/*.{js,ts,jsx,tsx,mdx}` - Includes `components/ui/` shadcn components
- `./app/**/*.{js,ts,jsx,tsx,mdx}` - App Router pages/layouts
- `./src/**/*.{js,ts,jsx,tsx,mdx}` - If using src directory

**Missing content paths cause production builds to purge used classes.** Symptoms: styles work in dev, fail in production.

**Source:** [Tailwind CSS Content Configuration](https://tailwindcss.com/docs/content-configuration)

### Pattern 5: ESLint 9 Flat Config with Tailwind Plugin
**What:** Configure ESLint 9 with Tailwind plugin to catch dynamic class construction and enforce best practices.

**When to use:** Phase 1, after Tailwind is configured.

**Implementation:**
```javascript
// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc'
import tailwind from 'eslint-plugin-tailwindcss'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...tailwind.configs['flat/recommended'],
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**'],
  },
  {
    rules: {
      // Enforce Tailwind best practices
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'warn',
      'tailwindcss/no-contradicting-classname': 'error',
    },
  },
]

export default eslintConfig
```

**Key rules:**
- `classnames-order`: Enforces consistent class ordering (improves readability, reduces merge conflicts)
- `no-custom-classname`: Catches invalid Tailwind classes and dynamic class construction
- `no-contradicting-classname`: Prevents conflicting utilities like `p-2 p-3`

**Why `no-custom-classname` catches dynamic classes:**
```typescript
// BAD - ESLint error: "bg-blue-500" is constructed dynamically
const color = isPrimary ? "blue-500" : "gray-500"
<div className={`bg-${color}`} />

// GOOD - ESLint passes: complete class names
<div className={isPrimary ? "bg-blue-500" : "bg-gray-500"} />
```

The rule validates that all classes in `className` attributes are registered Tailwind utilities. Dynamic string interpolation creates undetectable class names at build time, causing production styling failures.

**Source:** [eslint-plugin-tailwindcss GitHub](https://github.com/francoismassart/eslint-plugin-tailwindcss)

### Pattern 6: Vitest Configuration for Next.js 15
**What:** Configure Vitest for testing React components and contract interaction logic.

**When to use:** Phase 1, for contract testing requirement (DEVX-06).

**Implementation:**

**Step 1: Create Vitest config**
```typescript
// vitest.config.mts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),           // React component support
    tsconfigPaths(),   // Enables @/ path aliases
  ],
  test: {
    environment: 'jsdom',  // Simulates browser DOM
    globals: true,          // Enable describe, it, expect globally
    setupFiles: './vitest.setup.ts',
  },
})
```

**Step 2: Create setup file**
```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

**Step 3: Add test scripts**
```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Example test:**
```typescript
// lib/stacks/__tests__/contract-utils.test.ts
import { describe, it, expect } from 'vitest'
import { someContractUtil } from '../contract-utils'

describe('Contract Utils', () => {
  it('should format STX amount correctly', () => {
    expect(someContractUtil()).toBeDefined()
  })
})
```

**CRITICAL LIMITATION:** Vitest does NOT support async Server Components. Use E2E tests (Playwright) for async RSCs. Vitest is for synchronous components and utility functions only.

**Source:** [Next.js Vitest Testing Guide](https://nextjs.org/docs/app/guides/testing/vitest)

### Pattern 7: Prettier with Tailwind Class Sorting
**What:** Configure Prettier with Tailwind plugin for automatic class sorting.

**When to use:** Phase 1, after Tailwind is installed.

**Implementation:**
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**CRITICAL:** `prettier-plugin-tailwindcss` must be **last** in plugins array if using multiple plugins.

**package.json scripts:**
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**Why:** Automatic class sorting ensures consistency across the codebase without manual effort. Tailwind's recommended order improves readability and reduces merge conflicts.

**Example transformation:**
```typescript
// Before formatting
<Button className="hover:bg-blue-700 text-white bg-blue-600 py-2 px-4 rounded">

// After formatting
<Button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Dynamic Tailwind Class Construction
**What:** Building Tailwind classes with string interpolation or template literals.

**Why bad:** Tailwind's purge mechanism scans source files as text at build time. Dynamic classes are not detected, resulting in missing styles in production.

**Example:**
```typescript
// BAD - Classes not detected by Tailwind
const bgColor = isPrimary ? "blue-500" : "gray-500"
<div className={`bg-${bgColor}`} />  // Won't work in production

// BAD - Dynamic property access
<div className={`text-${props.size}`} />  // Won't work

// GOOD - Complete class names
<div className={isPrimary ? "bg-blue-500" : "bg-gray-500"} />

// GOOD - Safelist pattern for truly dynamic values
const colorClasses = {
  blue: "bg-blue-500 text-blue-100",
  gray: "bg-gray-500 text-gray-100"
}
<div className={colorClasses[color]} />
```

**Detection:** ESLint `tailwindcss/no-custom-classname` rule flags these errors at dev time.

**Source:** [Tailwind Dynamic Class Names - Pitfalls](https://www.mindfulchase.com/explore/troubleshooting-tips/front-end-frameworks/troubleshooting-tailwind-css-build-errors,-missing-styles,-and-configuration-pitfalls-in-front-end-projects.html)

### Anti-Pattern 2: Missing Tailwind Content Paths
**What:** Forgetting to include component directories in Tailwind content configuration.

**Why bad:** Production builds purge unused classes. If shadcn components in `components/ui/` aren't included in content paths, their styles won't be generated.

**Symptoms:**
- Styles work in development, fail in production
- CSS bundle is tiny (< 5KB instead of ~15-30KB)
- Components render unstyled

**Prevention:**
```typescript
// tailwind.config.ts
content: [
  "./components/**/*.{js,ts,jsx,tsx,mdx}",  // MUST include this
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
]
```

**Verification:**
```bash
# Check production CSS bundle size
pnpm build
# Inspect .next/static/css/*.css - should be 15-30KB minimum with components
```

### Anti-Pattern 3: Missing suppressHydrationWarning for Dark Mode
**What:** Implementing dark mode without `suppressHydrationWarning` on `<html>` element.

**Why bad:** Causes React hydration mismatch warnings and visual theme flashing on page load.

**Symptoms:**
- Console warnings: "Hydration failed because the initial UI does not match what was rendered on the server"
- Theme flickers on page load (light flash before dark mode applies)

**Prevention:**
```typescript
// app/layout.tsx
<html lang="en" suppressHydrationWarning>  {/* Required! */}
```

**Why this works:** next-themes injects a script before React hydration to set the theme class. `suppressHydrationWarning` tells React to expect client/server HTML differences on the `<html>` element.

### Anti-Pattern 4: Using npm with --legacy-peer-deps Flags
**What:** Sticking with npm and using `--legacy-peer-deps` for every install command.

**Why bad:** Requires flags for every `npm install`, `npm add`, and `npx shadcn add` command. Error-prone, slows development, confusing for contributors.

**Instead:** Switch to pnpm which handles React 19 peer dependencies natively without flags.

```bash
# npm approach (tedious)
npm install --legacy-peer-deps
npx shadcn@latest add button --legacy-peer-deps
# Every. Single. Time.

# pnpm approach (seamless)
pnpm install
pnpm dlx shadcn@latest add button
# Just works
```

**Performance benefit:** pnpm is also 3-4x faster for installs.

### Anti-Pattern 5: Installing Tailwind v4 for a Starter Kit
**What:** Using Tailwind CSS v4 instead of v3 for a starter kit project.

**Why bad:** v4 requires modern browsers (Safari 16.4+, Chrome 111+, Firefox 128+). Starter kits should maximize compatibility for diverse users.

**Additional friction:**
- v4 uses CSS-first configuration (@theme in CSS) instead of tailwind.config.js
- Plugin ecosystem still catching up to v4
- Migration is a breaking change for developers familiar with v3

**Correct approach:** Use Tailwind v3.4.x for starter kit. Document upgrade path to v4 in README for users ready to adopt it.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode toggle | Custom theme context + localStorage + SSR handling | next-themes | Handles SSR hydration, system theme detection, localStorage persistence, prevents flash. Complex edge cases solved. |
| Tailwind class merging | Custom string concatenation | clsx + tailwind-merge (cn() utility) | Handles conditional classes, deduplication, precedence. shadcn includes this. |
| Component state patterns | Custom useControllableState hook | Radix UI primitives | shadcn/ui components use Radix which handles controlled/uncontrolled states, accessibility, keyboard nav. |
| ESLint Tailwind validation | Manual code review | eslint-plugin-tailwindcss | Catches invalid classes, dynamic construction, contradicting utilities at dev time. |
| Class name ordering | Manual sorting | prettier-plugin-tailwindcss | Automatically sorts in recommended order. Zero manual effort. |

**Key insight:** UI tooling in 2026 has solved common patterns. Don't rebuild what next-themes, shadcn/ui, and ESLint plugins provide. Focus on dApp-specific features.

## Common Pitfalls

### Pitfall 1: Peer Dependency Conflicts (React 19 + npm)
**What goes wrong:** Installing shadcn components with npm fails with "ERESOLVE unable to resolve dependency tree" errors. Many Radix UI packages specify peer dependencies for React 16-18 but project uses React 19.

**Why it happens:** Package maintainers haven't updated peer dependency ranges for React 19. npm enforces peer dependencies strictly (unlike pnpm/bun/yarn).

**How to avoid:**
1. **Best solution:** Switch to pnpm (handles React 19 peer deps natively)
2. **Acceptable workaround:** Use `--legacy-peer-deps` flag with npm

```bash
# During shadcn init
npx shadcn@latest init --legacy-peer-deps

# When adding components
npx shadcn@latest add button --legacy-peer-deps

# Better: use pnpm (no flags needed)
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button
```

**Warning signs:**
- CLI fails during component installation
- Error message contains "peer dependency" and React version mismatch
- Works in pnpm but fails in npm

**Source:** [shadcn/ui React 19 Compatibility](https://ui.shadcn.com/docs/react-19)

### Pitfall 2: Dark Mode Hydration Flash
**What goes wrong:** Dark mode flickers or shows wrong theme on page load. User sees light theme flash before dark theme applies.

**Why it happens:** Theme detection happens client-side after HTML renders. Server sends light theme HTML, client-side JS applies dark theme, causing visual flash.

**How to avoid:**
1. Add `suppressHydrationWarning` to `<html>` element
2. Use `disableTransitionOnChange` on ThemeProvider
3. Ensure ThemeProvider wraps all content

```typescript
// app/layout.tsx
<html lang="en" suppressHydrationWarning>  {/* Critical! */}
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
```

**Warning signs:**
- Visual theme flash on page load
- Console warnings about hydration mismatch
- Theme indicator shows wrong state momentarily

**Source:** [shadcn/ui Dark Mode Documentation](https://ui.shadcn.com/docs/dark-mode)

### Pitfall 3: Tailwind Content Path Misconfiguration
**What goes wrong:** Tailwind config doesn't include all file paths where shadcn components live. Purge mechanism strips used classes, causing missing styles in production.

**Why it happens:** shadcn copies components into project (usually `components/ui/`). If content paths don't include this directory, Tailwind won't scan it.

**How to avoid:**
```typescript
// tailwind.config.ts - Include ALL component directories
content: [
  "./app/**/*.{ts,tsx}",           // Next.js app directory
  "./components/**/*.{ts,tsx}",    // ALL component directories (includes ui/)
  "./src/**/*.{ts,tsx}",           // If using src directory
]
```

**Verification:**
```bash
# Build and check CSS size
pnpm build
# Check .next/static/css/*.css should be 15-30KB with components
# If < 10KB, likely missing content paths
```

**Warning signs:**
- All styles work in development, fail in production build
- CSS bundle is unusually small (< 10KB)
- Specific shadcn component styles missing

**Source:** [Tailwind CSS Content Configuration](https://tailwindcss.com/docs/content-configuration)

### Pitfall 4: Vitest Async Server Component Limitation
**What goes wrong:** Tests fail with cryptic errors when testing async Server Components.

**Why it happens:** Vitest does not support React's async Server Component feature. This is a known limitation.

**How to avoid:**
1. Use Vitest only for synchronous components and utilities
2. Use E2E tests (Playwright) for async Server Components
3. Document this limitation in testing guide

**Test structure:**
```typescript
// ✅ GOOD - Vitest for synchronous utilities
// lib/stacks/__tests__/format-stx.test.ts
import { formatSTX } from '../format-stx'

describe('formatSTX', () => {
  it('formats microSTX to STX', () => {
    expect(formatSTX(1000000)).toBe('1.00')
  })
})

// ✅ GOOD - Vitest for Client Components
// components/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

it('renders button', () => {
  render(<Button>Click</Button>)
  expect(screen.getByRole('button')).toBeInTheDocument()
})

// ❌ BAD - Vitest for async Server Components
// This will fail - use E2E tests instead
async function ServerComponent() {
  const data = await fetch(...)
  return <div>{data}</div>
}
```

**Warning signs:**
- Errors about "async components" or "use server"
- Tests fail with "Cannot read properties of undefined"
- Server Component tests pass in isolation but fail in suite

**Source:** [Next.js Vitest Guide](https://nextjs.org/docs/app/guides/testing/vitest)

### Pitfall 5: Forgetting Lucide React Icons
**What goes wrong:** shadcn components reference Lucide icons but package not installed. Components fail to render icons or throw import errors.

**Why it happens:** shadcn CLI prompts for icon library during init but easy to skip. Developers add components later without installing dependencies.

**How to avoid:**
```bash
# Install Lucide React
pnpm add lucide-react

# Verify in components.json
cat components.json | grep iconLibrary
# Should show: "iconLibrary": "lucide"
```

**Warning signs:**
- Import errors for icons like `import { Check } from "lucide-react"`
- Components render but icons are missing
- Build fails with "Cannot find module 'lucide-react'"

**Quick fix:** `pnpm add lucide-react` - should be in Phase 1 setup checklist.

## Code Examples

Verified patterns from official sources:

### Example 1: Complete Dark Mode Setup
```typescript
// components/providers/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

```typescript
// app/layout.tsx
import { ThemeProvider } from "@/components/providers/theme-provider"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Source:** [shadcn/ui Dark Mode for Next.js](https://ui.shadcn.com/docs/dark-mode/next)

### Example 2: ESLint 9 Flat Config with Tailwind
```javascript
// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc'
import tailwind from 'eslint-plugin-tailwindcss'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...tailwind.configs['flat/recommended'],
  {
    rules: {
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'warn',
      'tailwindcss/no-contradicting-classname': 'error',
    },
  },
]

export default eslintConfig
```

**Source:** [eslint-plugin-tailwindcss GitHub](https://github.com/francoismassart/eslint-plugin-tailwindcss)

### Example 3: Vitest Configuration for Next.js
```typescript
// vitest.config.mts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
})
```

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

```json
// package.json
{
  "scripts": {
    "test": "vitest"
  }
}
```

**Source:** [Next.js Vitest Testing Guide](https://nextjs.org/docs/app/guides/testing/vitest)

### Example 4: Avoiding Dynamic Class Construction
```typescript
// ❌ BAD - Dynamic class construction (won't work in production)
const color = isPrimary ? "blue-500" : "gray-500"
<div className={`bg-${color}`} />

// ❌ BAD - Template literal interpolation
<div className={`text-${size} font-${weight}`} />

// ✅ GOOD - Complete class names
<div className={isPrimary ? "bg-blue-500" : "bg-gray-500"} />

// ✅ GOOD - Object mapping for variants
const variants = {
  primary: "bg-blue-500 text-white hover:bg-blue-600",
  secondary: "bg-gray-500 text-white hover:bg-gray-600"
}
<div className={variants[variant]} />

// ✅ GOOD - Using clsx for conditional classes
import { clsx } from 'clsx'
<div className={clsx(
  "rounded px-4 py-2",
  isPrimary && "bg-blue-500 text-white",
  !isPrimary && "bg-gray-500 text-white"
)} />
```

**Source:** [Tailwind Common Mistakes](https://heliuswork.com/blogs/tailwind-css-common-mistakes/)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ESLint 8 with .eslintrc.json | ESLint 9 with flat config (eslint.config.mjs) | Oct 2024 | ESLint 8 end-of-life. Flat config is more flexible, better TypeScript support. |
| npm as default | pnpm gaining adoption | 2024-2025 | pnpm 3-4x faster, handles peer deps better, smaller node_modules. |
| Jest for testing | Vitest for Next.js | 2023-2024 | Vitest 10-20x faster, native ESM, better Next.js 15 integration. |
| Custom dark mode implementation | next-themes | 2022-present | next-themes solves SSR hydration, prevents flash, handles system theme. |
| Tailwind v3 | Tailwind v4 available | Nov 2024 | v4 is 10x faster but requires modern browsers. v3 still recommended for starter kits. |

**Deprecated/outdated:**
- **ESLint 8 .eslintrc.json format**: End-of-life Oct 2024. Use ESLint 9 flat config.
- **npm --legacy-peer-deps as default workflow**: Use pnpm instead for native React 19 support.
- **Jest + ts-jest for Next.js testing**: Vitest is faster and has better ESM/Next.js 15 support.

## Open Questions

Things that couldn't be fully resolved:

1. **Chakra UI Removal Strategy**
   - What we know: Chakra UI should be removed after shadcn migration. User chose shadcn for better Tailwind integration.
   - What's unclear: Should removal happen all at once in Phase 1, or incrementally across phases as components migrate?
   - Recommendation: Remove Chakra in Phase 1 if no components currently use it. If existing components depend on Chakra, defer removal to later phase and document coexistence pattern.

2. **pnpm Documentation Level**
   - What we know: User wants soft recommendation for pnpm, not enforcement via `packageManager` field in package.json.
   - What's unclear: How explicitly should README guide users to pnpm vs supporting multiple package managers?
   - Recommendation: README should say "This project uses pnpm for faster installs and better React 19 compatibility. You can use npm with `--legacy-peer-deps` if needed." Include pnpm setup steps.

3. **Dark Mode Default State**
   - What we know: User marked this as "Claude's discretion"
   - What's unclear: Should default be "system" (OS preference), "light", or "dark"?
   - Recommendation: Use `defaultTheme="system"` to respect user OS preference. Most user-friendly, matches modern web standards.

4. **ESLint Rule Strictness**
   - What we know: Need `tailwindcss/no-custom-classname` to catch dynamic construction
   - What's unclear: Should this be "error" (breaks build) or "warn" (highlights but allows)?
   - Recommendation: Use "warn" during development for flexibility, document that teams can upgrade to "error" for strict enforcement. New developers learning Tailwind benefit from warnings vs hard errors.

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) - Official setup guide
- [shadcn/ui Dark Mode for Next.js](https://ui.shadcn.com/docs/dark-mode/next) - Official dark mode guide
- [shadcn/ui React 19 Compatibility](https://ui.shadcn.com/docs/react-19) - Official React 19 + Next.js 15 notes
- [Next.js Vitest Testing Guide](https://nextjs.org/docs/app/guides/testing/vitest) - Official Vitest setup
- [Tailwind CSS Content Configuration](https://tailwindcss.com/docs/content-configuration) - Official content paths guide
- [eslint-plugin-tailwindcss GitHub](https://github.com/francoismassart/eslint-plugin-tailwindcss) - Official plugin docs

### Secondary (MEDIUM confidence)
- [Transitioning from npm to pnpm in Next.js Projects](https://medium.com/@caiqinghua/transitioning-from-npm-to-pnpm-in-next-js-projects-73957b90687f) - Migration guide
- [pnpm vs npm vs yarn vs Bun: The 2026 Package Manager Showdown](https://dev.to/pockit_tools/pnpm-vs-npm-vs-yarn-vs-bun-the-2026-package-manager-showdown-51dc) - Performance benchmarks
- [Setting up Vitest for Next.js 15](https://www.wisp.blog/blog/setting-up-vitest-for-nextjs-15) - Community guide
- [Tailwind CSS Common Mistakes](https://heliuswork.com/blogs/tailwind-css-common-mistakes/) - Common pitfalls

### Tertiary (project context - from existing research)
- `.planning/research/STACK.md` - Comprehensive stack research
- `.planning/research/PITFALLS.md` - Detailed pitfall documentation
- `.planning/research/ARCHITECTURE.md` - Project structure patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation for all libraries, versions verified
- Architecture patterns: HIGH - Official Next.js and shadcn patterns, well-documented
- Pitfalls: HIGH - Verified from official docs and multiple community sources
- Implementation steps: HIGH - Tested patterns from official guides
- pnpm migration: MEDIUM - Based on community guides and benchmarks, not official Next.js docs

**Research date:** 2026-01-28
**Valid until:** 2026-03-01 (30 days - stable ecosystem, but shadcn/ui and Next.js iterate quickly)

**Note:** Most technology research already exists in `.planning/research/`. This document focuses on Phase 1 implementation specifics: setup steps, configuration examples, and integration patterns for locked decisions.
