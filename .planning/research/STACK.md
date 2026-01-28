# Technology Stack

**Project:** Stacks Blockchain Starter Kit (Next.js 15 + shadcn + Tailwind)
**Researched:** 2026-01-28
**Overall Confidence:** HIGH

## Executive Summary

The 2026 standard stack for a Next.js 15 + shadcn/ui + Tailwind CSS starter kit is well-established with mature tooling. Key decision: **Use Tailwind CSS v3** (not v4) due to browser compatibility requirements for a starter kit, despite v4's performance improvements. shadcn/ui integrates seamlessly with Next.js 15 App Router but requires `--legacy-peer-deps` with npm due to React 19 peer dependency handling.

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 15.1.7 (current) | React framework with App Router | Industry standard for React SSR/SSG, excellent DX, built-in optimization | HIGH |
| React | 19.0.0 (current) | UI library | Latest stable, required by Next.js 15, new hooks (useActionState, useOptimistic) | HIGH |
| TypeScript | 5.x (5.7.3 latest) | Type safety | Essential for maintainability, excellent IDE support, catches errors at compile time | HIGH |

**Rationale:** Next.js 15.1.7 is the current stable version with full React 19 support. Already in use in the project. Keep current versions.

### UI & Styling
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | **v3.4.x** | Utility-first CSS framework | Better browser compatibility for starter kit users. v4 requires Safari 16.4+, Chrome 111+, Firefox 128+ | HIGH |
| shadcn/ui | latest | Customizable component library | Copy-paste components (not npm dependency), built on Radix UI, full control over code | HIGH |
| Radix UI | (via shadcn) | Headless UI primitives | Accessibility-first, keyboard navigation, ARIA attributes built-in | HIGH |
| Lucide React | latest | Icon library | Default for shadcn/ui, tree-shakeable, 1000+ icons | MEDIUM |

**Tailwind v3 vs v4 Decision:**

**Use Tailwind CSS v3.4.x** for a starter kit because:
- **Browser compatibility:** v4 requires modern browsers (Safari 16.4+, Chrome 111+, Firefox 128+). Starter kits should support wider audience
- **Ecosystem stability:** v3 has mature plugin ecosystem. v4 plugins still catching up
- **Migration friction:** v4 requires CSS-first configuration (@theme in CSS), breaking change for developers familiar with tailwind.config.js
- **Starter kit philosophy:** Minimize surprises. Most developers know v3 patterns

**When to use v4:** New greenfield projects with modern browser requirements, teams wanting 10x faster builds, projects needing container queries or 3D transforms out of the box.

**Migration path:** Document how to upgrade to v4 in README. It's a straightforward upgrade when users are ready.

### State Management & Data Fetching
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| TanStack Query | v5 (5.90.x) | Server state management | Already in project, v5 has better RSC support, excellent for Stacks blockchain API calls | HIGH |
| React Context | (built-in) | Client state (auth, wallet) | Built-in, sufficient for wallet connection state | HIGH |

**Rationale:** TanStack Query v5 is perfect for blockchain API calls (caching, refetching, optimistic updates). React 19 compatible. Keep existing @tanstack/react-query.

### Testing
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vitest | latest (2.x) | Unit testing | 10-20x faster than Jest, native ESM support, excellent DX with Next.js 15 | HIGH |
| @testing-library/react | latest | Component testing | User-focused testing, works with React 19 | HIGH |
| @testing-library/dom | latest | DOM testing utilities | Required peer dependency | HIGH |
| jsdom | latest | DOM environment for tests | Vitest needs DOM environment for React components | HIGH |

**Note:** Vitest does not support async Server Components. Use E2E tests (Playwright) for RSC testing. Document this limitation.

### Code Quality
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ESLint | 9.x | Linting | Next.js 15 supports ESLint 9 (flat config), end-of-life for ESLint 8 was Oct 2024 | HIGH |
| eslint-config-next | 15.1.7 | Next.js rules | Includes React Hooks rules, Core Web Vitals rules, TypeScript support | HIGH |
| Prettier | 3.x | Code formatting | Industry standard, works with ESLint | HIGH |
| prettier-plugin-tailwindcss | latest | Tailwind class sorting | Automatically sorts classes in recommended order, improves consistency | HIGH |

**Important:** Prettier plugin must be **last** in plugins array. For Tailwind v4, you'd need `tailwindStylesheet` option (but we're using v3).

### Stacks Blockchain (Keep Existing)
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @stacks/connect | 8.1.9 (current) | Wallet connection | Standard for Hiro Wallet integration | HIGH |
| @stacks/network | 7.0.2 | Network configuration | Mainnet/testnet switching | HIGH |
| @stacks/transactions | 7.0.2 | Transaction building | Contract calls, token transfers | HIGH |
| @stacks/wallet-sdk | 7.0.4 | Wallet utilities | Additional wallet functionality | HIGH |
| @stacks/blockchain-api-client | 7.2.2 | API client | Type-safe API calls to Stacks API | HIGH |

**Rationale:** These are the standard Stacks.js libraries. Keep existing versions unless breaking changes require updates.

## shadcn/ui Setup for Next.js 15 App Router

### Installation Commands

**Step 1: Initialize shadcn/ui**
```bash
npx shadcn@latest init
```

**During initialization, choose:**
- Style: Default or New York (recommend Default for starter)
- Base color: Slate or Zinc (recommend Slate for neutral feel)
- CSS variables: Yes (enables theming)
- TypeScript: Yes

**With npm (React 19 peer dependency handling):**
```bash
# If npm install fails with peer dependency errors, use:
npm install --legacy-peer-deps
```

**Why --legacy-peer-deps?** React 19 is stable, but many dependencies haven't updated their peer dependency declarations. npm enforces peer deps strictly; pnpm/yarn/bun are more lenient.

**Step 2: Add components**
```bash
# Add individual components as needed
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

### Minimal Starter Kit Components

**Essential components (recommend including in starter):**

| Component | Purpose | Why Include | Installation |
|-----------|---------|-------------|--------------|
| Button | Primary actions | Universal UI element | `npx shadcn@latest add button` |
| Card | Content containers | Common for dApp UI (proposal cards, etc.) | `npx shadcn@latest add card` |
| Input | Form inputs | Essential for forms | `npx shadcn@latest add input` |
| Dialog | Modals | Transaction confirmations, wallet connection | `npx shadcn@latest add dialog` |
| Dropdown Menu | Navigation/actions | User menu, settings | `npx shadcn@latest add dropdown-menu` |
| Toast/Sonner | Notifications | Transaction status feedback | `npx shadcn@latest add sonner` |
| Badge | Status indicators | Transaction status, labels | `npx shadcn@latest add badge` |
| Skeleton | Loading states | Blockchain data loading | `npx shadcn@latest add skeleton` |

**Total: 8 components** (minimal, extendable)

**Defer to user addition:**
- Table/Data Table (complex, not all apps need)
- Calendar/Date Picker (specific use case)
- Charts (add if analytics needed)
- Form primitives (add when building forms)
- Tabs, Accordion, etc. (add as needed)

**Rationale:** Start minimal. shadcn/ui components are copy-pasted into the project, so adding more later is trivial. Don't bloat starter with unused code.

### shadcn/ui Configuration

**File structure after init:**
```
front-end/
├── components/
│   └── ui/           # shadcn components go here
├── lib/
│   └── utils.ts      # cn() utility for className merging
├── tailwind.config.ts # Updated with shadcn colors
└── components.json    # shadcn configuration
```

**components.json example:**
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
- `"rsc": true` - Enables React Server Components support (App Router)
- `"cssVariables": true` - CSS variables for theming (light/dark mode)
- `"baseColor": "slate"` - Neutral gray palette

## Tailwind CSS v3 Configuration

### Installation (Already Installed)

Tailwind should already be installed. If starting fresh:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### tailwind.config.ts (Updated for shadcn)

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui colors (CSS variables)
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
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
export default config
```

**Note:** shadcn/ui uses CSS variables for theming. All colors reference `hsl(var(--color-name))` which are defined in `globals.css`.

### globals.css (shadcn base styles)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Rationale:** This provides light/dark mode theming via CSS variables. Toggle dark mode by adding/removing `dark` class on `<html>` element.

## Vitest Configuration

### Installation

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
})
```

### vitest.setup.ts

```typescript
import '@testing-library/jest-dom'
```

### package.json script

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Limitation:** Vitest does not support async Server Components (React 19 feature). Use E2E tests for RSCs.

## ESLint 9 Configuration

### Installation (Already Installed)

ESLint 9 and eslint-config-next are already in the project.

### eslint.config.mjs (Flat Config Format)

```javascript
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
]

export default eslintConfig
```

**Or with TypeScript support:**

```typescript
import { defineConfig } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['.next/**', 'out/**', 'build/**'],
  },
])

export default eslintConfig
```

**Key Points:**
- ESLint 9 uses flat config format (no .eslintrc.json)
- Next.js 15 supports both ESLint 8 and 9
- `eslint-config-next/typescript` includes TypeScript-specific rules
- `eslint-config-next/core-web-vitals` includes performance rules

## Prettier Configuration

### Installation

```bash
npm install -D prettier prettier-plugin-tailwindcss
```

### .prettierrc

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**CRITICAL:** `prettier-plugin-tailwindcss` must be **last** in the plugins array if using multiple plugins.

### .prettierignore

```
.next
node_modules
out
build
*.md
```

### package.json scripts

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**Rationale:** Automatic Tailwind class sorting improves consistency across the codebase. No manual sorting needed.

## Supporting Libraries (Optional, Add as Needed)

| Library | Version | Purpose | When to Add |
|---------|---------|---------|-------------|
| clsx | latest | Conditional className building | When using conditional styling |
| tailwind-merge | latest | Merge Tailwind classes without conflicts | Included in shadcn's `cn()` utility |
| react-hook-form | latest | Form state management | When building complex forms |
| zod | latest | Schema validation | Pair with react-hook-form for validation |
| date-fns | latest | Date utilities | When working with dates |

**Note:** shadcn/ui components often include these as peer dependencies. Install when prompted.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| UI Library | shadcn/ui | Chakra UI (current) | Chakra is moving to Ark UI (v3), shadcn has better DX (own the code), stronger Tailwind integration |
| UI Library | shadcn/ui | Material UI | Heavy bundle, opinionated styling, harder to customize |
| UI Library | shadcn/ui | Mantine | Good library, but shadcn's copy-paste model gives more control |
| CSS Framework | Tailwind v3 | Tailwind v4 | Browser compatibility for starter kit (v4 requires modern browsers) |
| CSS Framework | Tailwind | CSS Modules | Tailwind's utility-first approach is more productive for component-based UI |
| State | TanStack Query | SWR | TanStack Query has more features (mutations, optimistic updates), better docs |
| State | React Context | Zustand | Context is sufficient for wallet state. Add Zustand if complex state emerges |
| Testing | Vitest | Jest | Vitest is 10-20x faster, native ESM support, better Next.js 15 integration |
| Formatting | Prettier | ESLint formatting | Separate concerns: ESLint for logic, Prettier for formatting |

## Migration Strategy (Chakra → shadcn)

### Phase 1: Setup
1. Install Tailwind CSS v3 (if not already)
2. Run `npx shadcn@latest init` with `--legacy-peer-deps`
3. Configure Vitest, ESLint 9, Prettier
4. Add minimal shadcn components (8 components listed above)

### Phase 2: Component Replacement
Replace Chakra components incrementally:
- `<Button>` → shadcn `<Button>`
- `<Box>`, `<Flex>`, `<Stack>` → Tailwind utilities + native divs
- `<Input>` → shadcn `<Input>`
- `<Modal>` → shadcn `<Dialog>`
- `<Menu>` → shadcn `<DropdownMenu>`
- `<Toast>` → shadcn `<Sonner>`
- `<Badge>` → shadcn `<Badge>`
- `<Skeleton>` → shadcn `<Skeleton>`

### Phase 3: Cleanup
1. Remove Chakra UI dependencies
2. Remove Chakra provider from layout
3. Clean up unused Chakra imports
4. Update global styles (remove Chakra's CSS reset)

## Installation Checklist

**For a new starter from scratch:**

```bash
# 1. Initialize Next.js 15 with TypeScript
npx create-next-app@latest my-stacks-app --typescript --app --tailwind

# 2. Navigate to project
cd my-stacks-app

# 3. Install Stacks libraries
npm install @stacks/connect @stacks/network @stacks/transactions @stacks/wallet-sdk @stacks/blockchain-api-client

# 4. Install TanStack Query
npm install @tanstack/react-query

# 5. Initialize shadcn/ui
npx shadcn@latest init
# (use --legacy-peer-deps if npm complains)

# 6. Add essential shadcn components
npx shadcn@latest add button card input dialog dropdown-menu sonner badge skeleton

# 7. Install testing dependencies
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths @testing-library/jest-dom

# 8. Install Prettier with Tailwind plugin
npm install -D prettier prettier-plugin-tailwindcss

# 9. Create vitest.config.ts, vitest.setup.ts, .prettierrc, .prettierignore

# 10. Update eslint.config.mjs to ESLint 9 flat config
```

**For this project (migration):**

```bash
# 1. Install Tailwind CSS v3 (if not already)
cd front-end
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 2. Initialize shadcn/ui
npx shadcn@latest init --legacy-peer-deps

# 3. Add minimal components
npx shadcn@latest add button card input dialog dropdown-menu sonner badge skeleton

# 4. Install Vitest
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths @testing-library/jest-dom

# 5. Install Prettier with Tailwind plugin
npm install -D prettier prettier-plugin-tailwindcss

# 6. Create configuration files (vitest.config.ts, .prettierrc, etc.)

# 7. Incrementally replace Chakra components with shadcn

# 8. Remove Chakra UI when done
npm uninstall @chakra-ui/react @chakra-ui/icons
```

## Sources

**Official Documentation (HIGH confidence):**
- [Next.js - shadcn/ui](https://ui.shadcn.com/docs/installation/next)
- [Next.js 15 + React 19 - shadcn/ui](https://ui.shadcn.com/docs/react-19)
- [Tailwind CSS v4.0 Blog](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Configuration: ESLint | Next.js](https://nextjs.org/docs/app/api-reference/config/eslint)
- [Testing: Vitest | Next.js](https://nextjs.org/docs/app/guides/testing/vitest)
- [prettier-plugin-tailwindcss GitHub](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)

**Community Resources (MEDIUM confidence):**
- [Next.js 15: Starter with Tailwind 4.0 & Shadcn](https://medium.com/@rikunaru/nextjs-starter-with-tailwind-shadcn-6e0eda2dd520)
- [How to Set Up a Modern Next.js 15 Project with Tailwind CSS v4, React 18 & ShadCN UI](https://medium.com/@nurmhm/how-to-set-up-a-modern-next-js-15-project-with-tailwind-css-v4-react-18-shadcn-ui-ec94f33bb651)
- [Tailwind 4 vs Tailwind 3: Key Differences and Improvements](https://staticmania.com/blog/tailwind-v4-vs-v3-comparison)
- [React 19 and TypeScript Best Practices Guide (2025)](https://medium.com/@CodersWorld99/react-19-typescript-best-practices-the-new-rules-every-developer-must-follow-in-2025-3a74f63a0baf)
- [TanStack Query & Next.js 15: The Ultimate Guide (2024)](https://www.danielolawoyin.com/blog/the-ultimate-guide-to-tanstack-query-in-next-js-15-1)
- [Setting up Vitest for Next.js 15](https://www.wisp.blog/blog/setting-up-vitest-for-nextjs-15)

**Package Registries (MEDIUM confidence for versions):**
- [@tanstack/react-query on npm](https://www.npmjs.com/package/@tanstack/react-query) - v5.90.19 latest
- [eslint-config-next on npm](https://www.npmjs.com/package/eslint-config-next) - v16.1.2 latest
