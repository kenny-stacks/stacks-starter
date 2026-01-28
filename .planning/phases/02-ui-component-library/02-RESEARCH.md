# Phase 2: UI Component Library - Research

**Researched:** 2026-01-28
**Domain:** shadcn/ui component library with Next.js, Tailwind CSS, and dark mode theming
**Confidence:** HIGH

## Summary

shadcn/ui is not a traditional component library - it's a collection of reusable components that you copy directly into your project. Components are built on Radix UI primitives (for accessibility) and styled with Tailwind CSS. Once installed via the CLI, components become your code to modify and maintain.

The research focused on three key areas: (1) the shadcn/ui installation workflow and component patterns, (2) integration with next-themes for dark mode without hydration issues, and (3) best practices for building feature components (Navbar, Counter display, Network indicator) that compose shadcn primitives.

Key findings show that shadcn/ui components work seamlessly with the existing Phase 1 setup (cssVariables: true, next-themes, Tailwind v3). The main challenges are: (a) managing hydration mismatches when using theme-dependent UI, (b) understanding that components become your maintenance responsibility after installation, and (c) properly composing Radix UI subcomponents for accessible patterns.

**Primary recommendation:** Use the shadcn CLI to install the 8 required primitives, build feature components that compose these primitives rather than duplicating code, and follow the mounted-state pattern for theme-dependent UI to avoid hydration errors.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui | 3.7.0+ (CLI) | Component installation and management | Official CLI for installing/updating components, handles dependencies |
| @radix-ui/* | Latest | Headless UI primitives | Industry standard for accessible, unstyled component primitives |
| next-themes | 0.4.6+ | Dark mode state management | Handles SSR hydration, system preference detection, localStorage persistence |
| tailwindcss | 3.4.19 | Utility-first CSS | Already configured in Phase 1 with CSS variables |
| lucide-react | 0.563.0+ | Icon library | Default icon set for shadcn/ui (already installed) |
| tailwindcss-animate | Latest | Animation utilities | Required dependency for shadcn/ui components |
| class-variance-authority | Latest | Variant management | Powers shadcn/ui variant system (cva pattern) |
| sonner | Latest | Toast notifications | Official shadcn/ui toast component (by Emil Kowalski) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | 2.1.1+ | Conditional classNames | Combining dynamic Tailwind classes (already installed) |
| tailwind-merge | 3.4.0+ | Tailwind class conflict resolution | Merging className props without conflicts (already installed) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui | Chakra UI | Chakra has runtime styles and less customization - already migrated away in Phase 1 |
| next-themes | Manual implementation | next-themes handles SSR hydration edge cases that are easy to get wrong |
| Sonner | react-hot-toast | Sonner integrates better with shadcn styling and has better defaults |
| Radix UI | Headless UI | Radix has more comprehensive accessibility and is shadcn standard |

**Installation:**
```bash
# Install individual components via CLI (auto-installs dependencies)
npx shadcn@latest add button card input dialog dropdown-menu badge skeleton

# Install Sonner toast separately
npx shadcn@latest add sonner

# All dependencies are auto-installed by the CLI
```

## Architecture Patterns

### Recommended Project Structure
```
front-end/src/
├── components/
│   ├── ui/                    # shadcn primitives (CLI-generated, do not edit manually)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   └── sonner.tsx
│   ├── providers/             # Context providers (ThemeProvider, etc.)
│   ├── navbar.tsx             # Feature components (compose ui/* primitives)
│   ├── counter-display.tsx    # Feature components
│   ├── network-indicator.tsx  # Feature components
│   └── theme-toggle.tsx       # Already exists from Phase 1
├── app/
│   └── layout.tsx             # Root layout with <Toaster /> for Sonner
└── lib/
    └── utils.ts               # cn() utility for class merging (already exists)
```

### Pattern 1: Installing shadcn/ui Components

**What:** Use the shadcn CLI to add components to your project. The CLI copies the component source code directly into `src/components/ui/` and installs required dependencies.

**When to use:** For all shadcn/ui components. Never copy-paste from the docs manually.

**Example:**
```bash
# CLI adds component to components/ui/ and installs dependencies
npx shadcn@latest add button

# Verify in components.json that paths are correct
# components/ui/ should map to @/components/ui
```

**Key insight:** Components become YOUR code after installation. Updates require re-running `npx shadcn@latest diff <component>` to check for changes.

### Pattern 2: Composing Feature Components from Primitives

**What:** Build domain-specific components (Navbar, Counter display) by composing shadcn/ui primitives rather than duplicating primitive code.

**When to use:** For all application-specific UI components. Import from `@/components/ui/*`, never copy the primitive code.

**Example:**
```typescript
// Source: shadcn/ui best practices
// components/navbar.tsx
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      <div>Logo</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Connect Wallet</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Wallet 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
```

### Pattern 3: Avoiding Hydration Mismatches with Theme-Dependent UI

**What:** Use the mounted-state pattern to prevent hydration errors when rendering theme-dependent UI (light/dark mode differences).

**When to use:** Any component that uses `useTheme()` from next-themes and renders differently based on theme.

**Example:**
```typescript
// Source: https://github.com/pacocoursey/next-themes
"use client"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

export function ThemeDependentComponent() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render placeholder with same dimensions to avoid layout shift
  if (!mounted) {
    return <div className="h-10 w-10" />
  }

  return <div>{theme === "dark" ? "🌙" : "☀️"}</div>
}
```

**Key insight:** The theme is `undefined` on the server. Rendering before mount causes hydration mismatch errors.

### Pattern 4: Radix UI Subcomponent Composition

**What:** Radix UI components use a compound component pattern with specific subcomponent hierarchies. Follow the documented structure exactly.

**When to use:** When using Dialog, DropdownMenu, NavigationMenu, or any Radix-based component.

**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/dialog
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// CORRECT - follows Radix hierarchy
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

// INCORRECT - breaks accessibility
<Dialog>
  <DialogContent>
    <h2>Title</h2>  {/* Missing DialogTitle wrapper */}
  </DialogContent>
</Dialog>
```

### Pattern 5: Sonner Toast Integration

**What:** Add the `<Toaster />` component to your root layout once. Use `toast()` function anywhere in your app.

**When to use:** For all toast notifications (success, error, info, loading states).

**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/sonner

// app/layout.tsx - Add once
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

// Any component - Use anywhere
import { toast } from "sonner"

function handleClick() {
  toast.success("Transaction submitted!")
  toast.error("Failed to connect wallet")
  toast.loading("Processing...")
}
```

### Anti-Patterns to Avoid

- **Editing `components/ui/*` files manually:** These are generated by CLI. Use `npx shadcn@latest diff <component>` to update, not manual edits.
- **Copying primitive code into feature components:** Import from `@/components/ui/*` instead. Duplication breaks updates.
- **Using theme before mounted:** Causes hydration errors. Always check `mounted` state first.
- **Breaking Radix subcomponent hierarchy:** Accessibility depends on proper nesting (DialogTitle inside DialogHeader, etc.).
- **Dynamic Tailwind class construction:** `className={\`bg-\${color}\`}` doesn't work. Use clsx/tailwind-merge for conditional classes.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast system with z-index, animations, queuing | Sonner via shadcn | Handles stacking, animations, dismiss behavior, promise states, accessibility |
| Dark mode state | Manual localStorage + CSS class toggling | next-themes | SSR hydration safety, system preference detection, no flash of wrong theme |
| Dialog/Modal | Custom overlay + focus trap + scroll lock | shadcn Dialog (Radix) | Focus management, escape key, click outside, scroll lock, ARIA attributes |
| Dropdown menus | Custom popover with click handling | shadcn DropdownMenu (Radix) | Keyboard navigation, arrow keys, escape, focus trap, positioning |
| Accessible form inputs | Custom input with validation UI | shadcn Input + Field components | ARIA attributes, error states, label associations, disabled states |
| Loading skeletons | Custom gray boxes with animations | shadcn Skeleton | Consistent sizing, no layout shift, proper opacity |
| CSS class merging | Manual string concatenation | tailwind-merge (already installed) | Handles Tailwind class conflicts (e.g., "p-4 p-6" → "p-6") |
| Conditional classes | Template literals with ternaries | clsx (already installed) | Clean API for conditional class logic |

**Key insight:** shadcn/ui components solve accessibility, keyboard navigation, focus management, and ARIA attributes. Custom implementations miss edge cases (screen readers, keyboard-only users, mobile touch).

## Common Pitfalls

### Pitfall 1: Hydration Mismatch from Theme-Dependent Rendering

**What goes wrong:** Components that use `useTheme()` render different content on server (theme is `undefined`) vs. client (theme is "light" or "dark"), causing React hydration errors.

**Why it happens:** next-themes can't know the theme on the server - it's stored in localStorage (client-only) and depends on system preferences.

**How to avoid:**
1. Use the mounted-state pattern (check `mounted` before rendering theme-dependent UI)
2. Return a placeholder with identical dimensions during SSR to prevent layout shift
3. Add `suppressHydrationWarning` to `<html>` tag in root layout

**Warning signs:** Console errors like "Text content does not match server-rendered HTML" or "Hydration failed because the initial UI does not match what was rendered on the server."

**Example from codebase:** `front-end/src/components/theme-toggle.tsx` already implements this correctly (lines 11-26).

### Pitfall 2: Treating shadcn/ui Like a Package Dependency

**What goes wrong:** Developers expect `npm update` to update components, or report bugs to shadcn/ui repo expecting fixes to auto-propagate.

**Why it happens:** shadcn/ui copies source code to your project. It's NOT a node_modules dependency.

**How to avoid:**
1. Understand that components become YOUR code after `shadcn add`
2. Use `npx shadcn@latest diff <component>` to check for updates
3. Review changes before applying (may conflict with customizations)
4. Keep customizations documented so you can re-apply after updates

**Warning signs:** Expecting automatic bug fixes, not understanding why component changes don't appear after `npm install`.

### Pitfall 3: Breaking Radix UI Accessibility by Incorrect Nesting

**What goes wrong:** Components lose keyboard navigation, screen reader support, or ARIA attributes when subcomponents are nested incorrectly.

**Why it happens:** Radix UI uses React Context to wire up ARIA relationships between parent/child components. Breaking the hierarchy breaks accessibility.

**How to avoid:**
1. Always follow official shadcn/ui documentation for component structure
2. Never skip wrapper components (e.g., DialogHeader is required, not optional)
3. Test with keyboard navigation (Tab, Enter, Escape) and screen readers
4. Check browser dev tools for ARIA attributes (aria-labelledby, aria-describedby)

**Warning signs:** Components that work visually but fail keyboard navigation, missing ARIA attributes in DOM inspector.

**Example:**
```typescript
// WRONG - breaks accessibility
<Dialog>
  <DialogContent>
    <h2>Title</h2>
    <p>Description</p>
  </DialogContent>
</Dialog>

// CORRECT - preserves accessibility
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Pitfall 4: Dynamic Tailwind Class Construction

**What goes wrong:** Classes constructed with template literals (`className={\`bg-\${color}\`}`) don't appear in production builds.

**Why it happens:** Tailwind's PurgeCSS scans source files for complete class strings at build time. Dynamic strings aren't detected and get purged.

**How to avoid:**
1. Use complete class strings, even in conditionals: `className={isActive ? "bg-blue-500" : "bg-gray-500"}`
2. Use `clsx()` for conditional logic: `className={clsx("base-class", { "bg-blue-500": isActive })}`
3. Enable ESLint rule `tailwindcss/no-custom-classname` to catch violations (already enabled in Phase 1)

**Warning signs:** Classes work in dev but disappear in production build, Tailwind IntelliSense doesn't autocomplete.

### Pitfall 5: Missing Sonner Toaster in Layout

**What goes wrong:** `toast()` function is called but nothing appears on screen.

**Why it happens:** Sonner requires `<Toaster />` component in the React tree to render toasts. The `toast()` function just queues notifications.

**How to avoid:**
1. Add `<Toaster />` to root layout once (app/layout.tsx)
2. Place it at the end of `<body>` so it renders on top
3. Configure position prop if needed: `<Toaster position="top-right" />`

**Warning signs:** `toast()` calls don't throw errors but nothing renders, console shows no warnings.

### Pitfall 6: Component Version Drift from Registry Updates

**What goes wrong:** shadcn/ui components in the registry get updated (new features, bug fixes), but your local components don't change.

**Why it happens:** Components are copied once. Updates don't auto-apply.

**How to avoid:**
1. Periodically run `npx shadcn@latest diff <component>` to check for updates
2. Before major features, check if components have updates
3. Document customizations so you can re-apply after updating
4. Consider the [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) resources for update strategies

**Warning signs:** Community reports bugs you still experience, features in docs don't work in your components.

## Code Examples

Verified patterns from official sources:

### Adding Components via CLI
```bash
# Source: https://ui.shadcn.com/docs
# Install single component
npx shadcn@latest add button

# Install multiple components
npx shadcn@latest add card input dialog

# Check for updates
npx shadcn@latest diff button
```

### Button Variants and Sizes
```typescript
// Source: https://ui.shadcn.com/docs/components/button
import { Button } from "@/components/ui/button"

// Variants
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link Style</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Card with All Subcomponents
```typescript
// Source: https://ui.shadcn.com/docs/components/card
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Counter Value</CardTitle>
    <CardDescription>Current counter state from contract</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-4xl font-bold">42</p>
  </CardContent>
  <CardFooter>
    <p className="text-sm text-muted-foreground">Last updated: 2 min ago</p>
  </CardFooter>
</Card>
```

### Dialog with Trigger and Content
```typescript
// Source: https://ui.shadcn.com/docs/components/dialog
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action will increment the counter on-chain.
      </DialogDescription>
    </DialogHeader>
    {/* Dialog body content */}
  </DialogContent>
</Dialog>
```

### Dropdown Menu for Wallet Selection
```typescript
// Source: https://ui.shadcn.com/docs/components/dropdown-menu
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Select Wallet</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Devnet Wallets</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Wallet 1</DropdownMenuItem>
    <DropdownMenuItem>Wallet 2</DropdownMenuItem>
    <DropdownMenuItem>Wallet 3</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Badge for Network Indicator
```typescript
// Source: https://ui.shadcn.com/docs/components/badge
import { Badge } from "@/components/ui/badge"

// Network indicator with variants
<Badge variant="default">Mainnet</Badge>
<Badge variant="secondary">Testnet</Badge>
<Badge variant="outline">Devnet</Badge>
<Badge variant="destructive">Disconnected</Badge>
```

### Skeleton for Loading States
```typescript
// Source: https://ui.shadcn.com/docs/components/skeleton
import { Skeleton } from "@/components/ui/skeleton"

// Loading state for counter display
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-32" />  {/* Title */}
    <Skeleton className="h-4 w-48" />  {/* Description */}
  </CardHeader>
  <CardContent>
    <Skeleton className="h-16 w-24" />  {/* Counter value */}
  </CardContent>
</Card>
```

### Sonner Toast Usage
```typescript
// Source: https://ui.shadcn.com/docs/components/sonner
import { toast } from "sonner"

// Success
toast.success("Transaction confirmed!")

// Error
toast.error("Failed to connect wallet")

// Loading with promise
toast.promise(
  submitTransaction(),
  {
    loading: "Submitting transaction...",
    success: "Transaction submitted!",
    error: "Transaction failed",
  }
)

// Custom with action
toast("Counter updated", {
  action: {
    label: "View",
    onClick: () => console.log("View transaction"),
  },
})
```

### Using asChild for Custom Components
```typescript
// Source: Radix UI documentation
// The asChild prop allows rendering a child component with the parent's props
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Button styled as link (for navigation)
<Button asChild variant="ghost">
  <Link href="/about">About</Link>
</Button>

// DialogTrigger with custom button
<DialogTrigger asChild>
  <button className="custom-button">Open</button>
</DialogTrigger>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Component libraries as npm packages | Copy components to your codebase (shadcn/ui) | ~2023 | More customization control, but you own maintenance |
| Manual dark mode with CSS + localStorage | next-themes with SSR hydration handling | ~2022 | Eliminates theme flash and hydration errors |
| Tailwind v4 | Tailwind v3.4.19 (for this project) | 2024 | v3 has better browser compatibility for starter kits (Phase 1 decision) |
| Chakra UI for blockchain dApps | shadcn/ui + Tailwind | 2024 | Better performance, no runtime CSS-in-JS overhead (Phase 1 decision) |
| react-hot-toast | Sonner | ~2023 | Better defaults, cleaner API, better shadcn integration |
| Manual toast systems | Sonner with promise support | ~2023 | Built-in loading states for async operations |

**Deprecated/outdated:**
- **Chakra UI toast:** Replaced with Sonner (Phase 1 decision, needs replacement in useTransactionExecuter hook)
- **Manual theme providers:** next-themes is standard for Next.js + Tailwind
- **Accessibility DIY:** Radix UI primitives handle ARIA, keyboard nav, focus management better than manual implementations

## Open Questions

Things that couldn't be fully resolved:

1. **How does Stacks Connect modal handle theming after Chakra removal?**
   - What we know: Stacks Connect (@stacks/connect) modal styling may depend on Chakra theme
   - What's unclear: Whether modal breaks visually after Chakra removal, needs hands-on testing
   - Recommendation: Test wallet connection in Phase 3, may need custom CSS overrides for modal

2. **Should we use NavigationMenu primitive or build custom navbar?**
   - What we know: shadcn has NavigationMenu component for complex navigation with dropdowns
   - What's unclear: Whether simple navbar (logo + wallet button) needs full NavigationMenu primitive
   - Recommendation: Start with simple custom navbar (flex layout), only add NavigationMenu if dropdown menus are needed

3. **How to handle network indicator state (devnet/testnet/mainnet)?**
   - What we know: Network state comes from Stacks connection, needs to display in navbar
   - What's unclear: Whether this is a Badge component, a DropdownMenu, or custom component
   - Recommendation: Use Badge variant for simple indicator, upgrade to DropdownMenu if network switching is added

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Official Documentation](https://ui.shadcn.com/docs) - Component APIs, installation, theming
- [next-themes GitHub Repository](https://github.com/pacocoursey/next-themes) - API, hydration handling, best practices
- [Radix UI Primitives Documentation](https://www.radix-ui.com/primitives/docs/overview/accessibility) - Accessibility, keyboard navigation, ARIA
- shadcn/ui component docs (Button, Card, Input, Dialog, Dropdown Menu, Badge, Skeleton, Sonner, Navigation Menu) - Component-specific APIs and examples
- [shadcn/ui Dark Mode Guide](https://ui.shadcn.com/docs/dark-mode/next) - next-themes integration for Next.js
- [shadcn/ui Theming Guide](https://ui.shadcn.com/docs/theming) - CSS variables, color system

### Secondary (MEDIUM confidence)
- [Shadcn UI Best Practices - Cursor Rules](https://cursorrules.org/article/shadcn-cursor-mdc-file) - Common mistakes: edge cases, overcomplicated components, accessibility, performance
- [Fixing Hydration Mismatch in Next.js (next-themes)](https://medium.com/@pavan1419/fixing-hydration-mismatch-in-next-js-next-themes-issue-8017c43dfef9) - Hydration error solutions
- [Responsive Navbar with shadcn/ui](https://dev.to/shaikathaque/responsive-navbar-in-react-using-shadcnui-and-tailwind-css-4jc9) - Navbar patterns
- [React Component Composition Patterns](https://www.patterns.dev/react/react-2026/) - 2026 composition patterns
- [Radix UI Accessibility Best Practices](https://www.radix-ui.com/primitives/docs/overview/accessibility) - WAI-ARIA authoring practices, keyboard support

### Tertiary (LOW confidence)
- [What I DON'T Like About shadcn/ui](https://dev.to/this-is-learning/what-i-dont-like-about-shadcnui-3amf) - Community concerns about maintenance ownership
- [Awesome shadcn/ui](https://github.com/birobirobiro/awesome-shadcn-ui) - Community resources and tools
- Various shadcn/ui navbar examples (shadcnstudio.com, shadcnblocks.com, shuffle.dev) - Pattern references (not verified)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official shadcn/ui docs, next-themes repo, Radix UI docs, package.json verification
- Architecture patterns: HIGH - Official docs, verified in existing codebase (theme-toggle.tsx), Next.js 15 standards
- Pitfalls: MEDIUM-HIGH - Mix of official docs (hydration) and community experience (maintenance ownership)

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - shadcn/ui is stable, Radix UI is mature, next-themes is stable)
