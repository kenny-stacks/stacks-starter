# Architecture Patterns: Next.js Stacks Starter Kit

**Domain:** Web3 dApp Starter Kit / Developer Template
**Researched:** 2026-01-28
**Confidence:** HIGH

## Recommended Architecture

A starter kit must balance two competing concerns: providing enough structure to be immediately useful while remaining flexible enough for developers to extend without friction. Based on Next.js 15 App Router patterns and Web3 dApp ecosystem research, the recommended architecture follows a **server-first, clear-boundaries** approach.

### High-Level Organization

```
stacks-starter/
├── front-end/                  # Next.js App Router application
│   ├── src/
│   │   ├── app/               # App Router (routes, layouts)
│   │   ├── components/        # UI components
│   │   │   ├── ui/           # shadcn/ui primitives (atoms)
│   │   │   ├── features/     # Domain-specific components
│   │   │   └── providers/    # Context providers (Client Components)
│   │   ├── lib/              # Core integrations & infrastructure
│   │   │   ├── stacks/       # Stacks blockchain integration
│   │   │   │   ├── contract-utils.ts
│   │   │   │   ├── network-config.ts
│   │   │   │   ├── wallet-integration.ts
│   │   │   │   └── clarity-utils.ts
│   │   │   └── utils/        # Pure utility functions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── constants/        # Configuration & constants
│   │   └── types/            # TypeScript definitions
│   ├── examples/             # Reference implementations (NOT scaffolding)
│   │   └── counter/          # Simple counter example
│   │       ├── components/
│   │       ├── hooks/
│   │       └── README.md     # How to use this example
│   └── docs/                 # Developer documentation
│       ├── getting-started.md
│       ├── contract-interaction.md
│       └── extending.md
├── clarity/                   # Smart contract workspace
└── package.json              # Monorepo root
```

## Component Boundaries

| Component | Responsibility | Extension Point | Developer Interaction |
|-----------|---------------|-----------------|---------------------|
| **app/** | Routes, layouts, pages | Add new routes/pages | PRIMARY - developers build here |
| **components/ui/** | shadcn/ui primitives | Import, compose | REFERENCE - use but don't modify |
| **components/features/** | Reusable domain components | Create new features | SECONDARY - add feature modules |
| **components/providers/** | Context providers | Add new providers | RARE - extend for global state |
| **lib/stacks/** | Blockchain integration | PRESERVE - core functionality | REFERENCE - documented API |
| **lib/utils/** | Pure helper functions | Add helpers | COMMON - extend utilities |
| **hooks/** | Custom React hooks | Add new hooks | COMMON - create custom hooks |
| **examples/** | Reference implementations | Study, copy, delete | LEARNING - not production code |
| **constants/** | Configuration | Customize for app | REQUIRED - app-specific config |

### Data Flow

```
User Interaction (Client Component)
    ↓
Custom Hook (handles state)
    ↓
lib/stacks/contract-utils.ts (abstracts blockchain complexity)
    ↓
@stacks/transactions + wallet providers
    ↓
Stacks blockchain
```

## Patterns to Follow

### Pattern 1: Clear Separation - Scaffolding vs Examples

**What:** Distinguish between production scaffolding (reusable infrastructure) and example code (reference implementations).

**Why:** Developers need to know what to keep, what to modify, and what to delete. Mixing example code with infrastructure creates confusion and bloat.

**Structure:**
```
src/
  lib/stacks/           # KEEP - core blockchain utilities
  components/ui/        # KEEP - reusable primitives
  app/                  # MODIFY - add your routes
  hooks/                # EXTEND - add your hooks

examples/
  counter/              # DELETE AFTER LEARNING - reference only
    README.md           # "This is a minimal example. Delete this folder when ready."
```

**Example:**
```typescript
// lib/stacks/contract-utils.ts (SCAFFOLDING - developers use but rarely modify)
export const executeContractCall = async (
  txOptions: ContractCallRegularOptions,
  currentWallet: DevnetWallet | null
): Promise<DirectCallResponse> => {
  // Abstracted blockchain interaction
}

// examples/counter/hooks/useCounter.ts (EXAMPLE - developers copy & adapt)
export function useCounter(contractId: string) {
  // Example implementation developers can learn from
  return useContractCall(contractId, "increment");
}

// app/counter/page.tsx (THEIR CODE - developers build here)
export default function CounterPage() {
  // Developer's own implementation
}
```

### Pattern 2: Provider Composition for Next.js 15 App Router

**What:** Centralized provider composition pattern that works with Next.js 15 Server Components while maintaining client-side context.

**When:** All apps need this pattern. Providers must be Client Components but should be composed at the root for optimal performance.

**Structure:**
```typescript
// components/providers/app-providers.tsx (Client Component)
"use client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProviders>
        {children}
      </WalletProviders>
    </QueryClientProvider>
  );
}

// app/layout.tsx (Server Component)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
```

**Best Practice:** Render providers as deep as possible in the tree. For a starter kit, demonstrate the pattern at root level but document how to move providers deeper for specific features.

**Source:** [Next.js Composition Patterns](https://nextjs.org/docs/14/app/building-your-application/rendering/composition-patterns)

### Pattern 3: lib/ Organization - Infrastructure vs Utilities

**What:** Separate external integrations (lib/) from pure utility functions (lib/utils/).

**Why:** Developers need to understand what touches external systems vs what's pure logic they can safely modify.

**Structure:**
```
lib/
  stacks/                    # External system integration
    contract-utils.ts        # Contract interaction layer
    network-config.ts        # Network configuration
    wallet-integration.ts    # Wallet provider setup
  utils/                     # Pure functions
    format-stx.ts           # Number formatting
    validation.ts           # Input validation
    date-helpers.ts         # Date utilities
```

**Guidelines:**
- **lib/stacks/**: Contains setup, configuration, SDK wrappers. Changes rarely. Developers reference but don't modify.
- **lib/utils/**: Pure functions. No side effects, no external dependencies. Developers extend frequently.

**Source:** [Understanding libs and utils in Next.js 15](https://khaisastudio.medium.com/understanding-the-role-of-libs-and-utils-in-a-next-js-15-project-b1c0368ef044)

### Pattern 4: Extensible Hook Architecture

**What:** Custom hooks that abstract blockchain complexity while exposing extension points.

**Structure:**
```typescript
// hooks/useContractRead.ts (SCAFFOLDING - generic hook)
export function useContractRead<T>(
  contractId: string,
  functionName: string,
  args?: ClarityValue[]
) {
  return useQuery({
    queryKey: ['contract', contractId, functionName, args],
    queryFn: () => callReadOnlyFunction(/* ... */)
  });
}

// hooks/useContractWrite.ts (SCAFFOLDING - generic hook)
export function useContractWrite() {
  // Generic write operation
}

// app/my-feature/hooks/useMyFeature.ts (DEVELOPER CODE)
export function useMyFeature() {
  // Developers compose generic hooks for their features
  const { data } = useContractRead(CONTRACT_ID, 'get-count');
  const { mutate } = useContractWrite();
  // Feature-specific logic
}
```

**Best Practice:** Generic hooks go in top-level `hooks/`, feature-specific hooks go in feature folders.

### Pattern 5: Feature-Based Component Organization

**What:** Organize domain components by feature, not by type.

**Structure:**
```
components/
  ui/                  # Primitives (shadcn/ui components)
    button.tsx
    card.tsx
  features/            # Feature modules
    wallet/
      wallet-connect.tsx
      wallet-balance.tsx
      wallet-switcher.tsx
    counter/           # Example feature (deletable)
      counter-display.tsx
      counter-controls.tsx
  providers/           # Context providers
    wallet-providers.tsx
    query-provider.tsx
```

**Rationale:** Features encapsulate related components. Easy to understand, easy to delete, easy to extend.

**Source:** [Next.js Folder Structure Best Practices 2026](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)

### Pattern 6: Atomic Design for UI Components

**What:** Organize UI primitives using Atomic Design methodology - atoms, molecules, organisms.

**Implementation for shadcn/ui:**
```
components/
  ui/                    # Atoms (shadcn/ui components)
    button.tsx
    input.tsx
    card.tsx
  composed/              # Molecules (composed UI patterns)
    form-field.tsx       # Label + Input + Error
    search-bar.tsx       # Input + Button
    stat-card.tsx        # Card + Heading + Value
```

**Guideline:** Treat all shadcn/ui components as atoms. Configure shadcn to install to `components/ui/`. Developers build molecules and organisms by composing atoms.

**Source:** [shadcn/ui Installation](https://ui.shadcn.com/docs/installation)

### Pattern 7: Configuration as Extension Points

**What:** Centralize configuration in constants/ folder to make customization obvious.

**Structure:**
```
constants/
  contracts.ts         # Contract addresses per network
  network.ts          # Network configurations
  app-config.ts       # App-specific settings
```

**Example:**
```typescript
// constants/contracts.ts
export const CONTRACTS = {
  devnet: {
    deployer: process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER_DEVNET_ADDRESS,
    counter: 'counter', // Example contract
  },
  testnet: {
    deployer: process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER_TESTNET_ADDRESS,
    counter: 'counter',
  },
  mainnet: {
    deployer: process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER_MAINNET_ADDRESS,
    counter: 'counter',
  },
};

// Developers modify this file for their contracts
```

**Best Practice:** Include inline comments explaining what developers need to change.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Mixing Example Code with Scaffolding

**What:** Putting example features (like fundraising logic) in the same directories as core infrastructure.

**Why bad:** Developers don't know what to delete. They spend time ripping out example code from production files, potentially breaking core functionality.

**Current state:** The fundraising dApp has campaign-specific logic mixed with wallet utilities in `lib/`.

**Instead:**
- Core utilities stay in `lib/stacks/`
- Example features go in `examples/` folder
- Developers build in `app/` and `components/features/`

**Impact:** Makes the starter 10x easier to extend. Developers know "delete examples/, build in app/" vs "what do I delete? what do I keep?"

### Anti-Pattern 2: Monolithic Providers Component

**What:** A single Providers component that developers must modify to add new providers.

**Why bad:** Creates merge conflicts, requires understanding the entire provider hierarchy.

**Current state:** `components/ui/Providers.tsx` contains all providers in one file.

**Instead:**
```typescript
// components/providers/wallet-providers.tsx
export function WalletProviders({ children }) {
  return (
    <HiroWalletProvider>
      <DevnetWalletProvider>
        {children}
      </DevnetWalletProvider>
    </HiroWalletProvider>
  );
}

// components/providers/app-providers.tsx
export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProviders>
        {children}
      </WalletProviders>
    </QueryClientProvider>
  );
}

// Developers add their own:
// components/providers/my-feature-provider.tsx
```

### Anti-Pattern 3: utils.ts Kitchen Sink

**What:** A single `utils.ts` file that grows to 1000+ lines with unrelated functions.

**Why bad:** Hard to navigate, hard to tree-shake, unclear ownership.

**Instead:** Break utilities into focused files:
```
lib/utils/
  format-stx.ts       # Currency formatting
  validation.ts       # Input validation
  date-helpers.ts     # Date operations
  string-helpers.ts   # String operations
```

**Source:** [Next.js Folder Structure Guide](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)

### Anti-Pattern 4: Deep Component Hierarchies

**What:** Nesting components 5-6 levels deep: `components/features/campaign/donation/modal/form/`.

**Why bad:** Hard to import, unclear dependencies, difficult to refactor.

**Instead:** Flatten to 2-3 levels max:
```
components/
  features/
    campaign/
      campaign-form.tsx
      campaign-card.tsx
      donation-modal.tsx
```

### Anti-Pattern 5: Unclear Server/Client Boundaries

**What:** No clear indication which components are Server vs Client Components.

**Why bad:** Developers accidentally import server-only code in client components, or add "use client" unnecessarily, bloating the bundle.

**Instead:**
- Default to Server Components
- Mark Client Components with "use client" directive
- Document which patterns require client vs server
- Keep interactive components small ("client islands")

**Best Practice:** In docs, include a decision tree: "Use Server Component unless you need: state, effects, browser APIs, or event handlers."

**Source:** [Next.js 15 App Router Complete Guide](https://dev.to/devjordan/nextjs-15-app-router-complete-guide-to-server-and-client-components-5h6k)

### Anti-Pattern 6: No Clear Entry Points

**What:** Developers don't know where to start building their feature.

**Why bad:** Cognitive overload. They spend hours exploring the codebase instead of building.

**Instead:** Provide clear entry points in documentation:
1. Start here: `app/page.tsx` (main page)
2. Add routes: Create files in `app/`
3. Add features: Create folder in `components/features/`
4. Add utilities: Add files to `lib/utils/`

Include a "Quick Start" that gets developers to "hello world" in 5 minutes.

## Documentation Strategy

### Critical Documentation Files

| File | Purpose | Location |
|------|---------|----------|
| `README.md` | Quick start (< 10 min to running app) | Root |
| `docs/getting-started.md` | Detailed setup, environment config | docs/ |
| `docs/architecture.md` | This file - system overview | docs/ |
| `docs/contract-interaction.md` | How to interact with smart contracts | docs/ |
| `docs/extending.md` | How to add features, customize | docs/ |
| `examples/counter/README.md` | Example walkthrough | examples/ |

### README Structure

Based on best practices, a starter kit README should include:

1. **One-sentence description** - What is this?
2. **Quick start** - Run in < 10 minutes
3. **What's included** - Feature list
4. **Project structure** - High-level overview
5. **Examples** - Link to examples/
6. **Customization** - How to make it yours
7. **Deployment** - Testnet/Mainnet deployment
8. **Resources** - Links to docs, Stacks resources

**Source:** [How to Structure Your README](https://www.freecodecamp.org/news/how-to-structure-your-readme-file/)

### Inline Documentation

Add comments to critical files explaining their role:

```typescript
// lib/stacks/contract-utils.ts
/**
 * Contract Interaction Utilities
 *
 * This module provides low-level utilities for interacting with Clarity smart contracts.
 * Developers typically don't modify this file - instead, use these functions in your
 * custom hooks.
 *
 * @example
 * // In your custom hook:
 * import { executeContractCall } from '@/lib/stacks/contract-utils';
 *
 * export function useMyContract() {
 *   const result = await executeContractCall({ ... });
 * }
 */
```

## Monorepo Organization

The current monorepo structure (clarity/ + front-end/) is appropriate for a Stacks dApp starter.

### Workspace Structure

```
stacks-starter/
├── clarity/              # Smart contract workspace
│   ├── contracts/
│   ├── tests/
│   └── deployments/
├── front-end/           # Next.js application
├── package.json         # Workspace root
└── README.md
```

**Rationale:**
- Smart contracts are at the bottom of the dependency chain
- Front-end imports contract artifacts
- Clear separation of concerns
- Matches Stacks ecosystem patterns

**Source:** [Web3 Monorepo Patterns](https://dev.to/apperside/creating-a-web3-dapp-with-a-nx-monorepo-56e)

## Build Order and Dependencies

### Phase 1: Foundation
1. Configure monorepo workspace
2. Set up Next.js 15 with TypeScript
3. Configure path aliases (@/ for src/)
4. Add ESLint, Prettier, TypeScript configs

### Phase 2: Core Infrastructure
1. Implement `lib/stacks/` integration layer
   - Network configuration
   - Wallet integration
   - Contract utilities
2. Set up provider composition pattern
3. Add React Query for data fetching

### Phase 3: UI Scaffolding
1. Install shadcn/ui to `components/ui/`
2. Create `components/providers/` structure
3. Build basic layout components

### Phase 4: Example Implementation
1. Create `examples/counter/` with complete feature
2. Write example documentation
3. Demonstrate hook composition, component patterns

### Phase 5: Developer Experience
1. Write comprehensive documentation
2. Create developer-friendly README
3. Add inline comments to critical files
4. Include troubleshooting guide

**Critical Ordering:**
- Foundation before infrastructure (config before code)
- Core infrastructure before UI (data layer before presentation)
- Scaffolding before examples (structure before reference implementations)
- Implementation before docs (code before documentation)

## Extension Points Summary

### Primary Extension Points (developers build here)
1. **app/** - Add routes, pages, layouts
2. **components/features/** - Add feature modules
3. **hooks/** - Create custom React hooks
4. **lib/utils/** - Add utility functions
5. **constants/** - Configure for your app

### Secondary Extension Points (advanced usage)
1. **components/providers/** - Add new context providers
2. **lib/stacks/** - Extend blockchain integration (rare)
3. **clarity/** - Add smart contracts

### Reference Only (don't modify)
1. **components/ui/** - shadcn/ui primitives (copy don't modify)
2. **examples/** - Study, then delete

## Scalability Considerations

| Concern | Starter Kit Approach | When to Evolve |
|---------|---------------------|----------------|
| State management | React Query + Context | > 10 routes with complex shared state → Consider Zustand |
| Component library | shadcn/ui (copy-paste) | > 50 components → Consider design system |
| Data fetching | React Query | Always sufficient for dApps |
| Authentication | Wallet-based auth | Adding email/social → Add NextAuth.js |
| File structure | Feature-based | > 100 components → Consider atomic design |
| Monorepo | npm workspaces | > 3 packages → Consider Turborepo |

## Confidence Assessment

**Overall confidence: HIGH**

- **Folder structure patterns:** HIGH - Well-documented Next.js 15 conventions
- **Provider composition:** HIGH - Official Next.js documentation
- **lib/ organization:** HIGH - Multiple authoritative sources agree
- **Examples vs scaffolding:** MEDIUM - Based on general best practices, less Web3-specific documentation
- **shadcn/ui integration:** HIGH - Official documentation
- **Monorepo structure:** HIGH - Common Web3 dApp pattern

## Sources

### Primary Sources (HIGH confidence)
- [Next.js Composition Patterns (Official)](https://nextjs.org/docs/14/app/building-your-application/rendering/composition-patterns)
- [shadcn/ui Installation (Official)](https://ui.shadcn.com/docs/installation)
- [Next.js Project Structure (Official)](https://nextjs.org/docs/app/getting-started/project-structure)

### Secondary Sources (MEDIUM confidence)
- [Next.js Folder Structure Best Practices 2026](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)
- [How to Build Scalable Next.js Architecture](https://dev.to/alexeagleson/how-to-build-scalable-architecture-for-your-nextjs-project-2pb7)
- [Next.js Architecture 2026 - Server-First Patterns](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [Next.js 15 App Router Complete Guide](https://dev.to/devjordan/nextjs-15-app-router-complete-guide-to-server-and-client-components-5h6k)
- [Creating Web3 DApp with NX Monorepo](https://dev.to/apperside/creating-a-web3-dapp-with-a-nx-monorepo-56e)
- [Understanding libs and utils in Next.js 15](https://khaisastudio.medium.com/understanding-the-role-of-libs-and-utils-in-a-next-js-15-project-b1c0368ef044)
- [How to Structure Your README](https://www.freecodecamp.org/news/how-to-structure-your-readme-file/)

### Tertiary Sources (context only)
- [useWeb3.xyz Starter Kits](https://www.useweb3.xyz/starter-kits)
- [Next.js Best Practices 2026](https://www.serviots.com/blog/nextjs-development-best-practices)
- [Developer Experience Guide 2026](https://getdx.com/blog/developer-experience/)
