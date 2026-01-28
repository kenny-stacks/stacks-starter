# Project Research Summary

**Project:** Stacks Blockchain Starter Kit (Next.js 15 + shadcn/ui + Tailwind CSS)
**Research Date:** 2026-01-28
**Overall Confidence:** HIGH

---

## Executive Summary

The Stacks Blockchain Starter Kit should be a **minimal, well-structured Next.js 15 dApp template** that prioritizes developer experience and extensibility. The recommended tech stack (Next.js 15 + React 19 + shadcn/ui + Tailwind CSS v3) is production-ready, well-supported, and significantly more maintainable than the current Chakra UI setup. The critical decision: **migrate from Chakra UI to shadcn/ui + Tailwind CSS** to reduce bundle size, improve customization, and align with modern ecosystem patterns. However, this migration introduces 20 documented pitfalls that must be systematically addressed during implementation. Success requires clear phase sequencing, explicit scaffolding vs. example separation, and comprehensive developer documentation that assumes minimal prior knowledge of new tools.

---

## Key Findings

### From STACK.md

**Recommended Core Technologies:**
- **Next.js 15.1.7** (current stable) + **React 19.0.0** + **TypeScript 5.x** — All well-integrated, high DX
- **Tailwind CSS v3.4.x** (NOT v4) — Better browser compatibility for starter kits (v4 requires Safari 16.4+, Chrome 111+, Firefox 128+)
- **shadcn/ui (latest)** — Copy-paste components via Radix UI, zero npm dependency cruft
- **TanStack Query v5** — Perfect for blockchain API calls (caching, refetching, optimistic updates)
- **Vitest 2.x** — 10-20x faster than Jest, native ESM, excellent Next.js 15 integration
- **ESLint 9** (flat config) + **Prettier 3.x** + **prettier-plugin-tailwindcss** — Enforces consistency

**Stacks.js Stack (Keep Existing):**
- @stacks/connect 8.1.9, @stacks/network 7.0.2, @stacks/transactions 7.0.2, @stacks/wallet-sdk 7.0.4, @stacks/blockchain-api-client 7.2.2

**Critical Installation Flag:**
- npm users must use `--legacy-peer-deps` during shadcn init due to React 19 peer dependency declarations not yet updated upstream

**Starting Components (8 minimal):**
Button, Card, Input, Dialog, DropdownMenu, Toast (Sonner), Badge, Skeleton — everything else can be added later

### From FEATURES.md

**Table Stakes (must-have):**
- Wallet connection (Multi-wallet: Hiro extension + devnet selector)
- Network switching (Devnet/testnet/mainnet via environment variables)
- Counter contract demo (read + write example)
- Contract read/write patterns with React Query
- Transaction status feedback (pending/success/error)
- Basic README + working example UI
- TypeScript throughout
- Local development setup (devnet support)

**Differentiators (should-have):**
- Devnet wallet selector (6 test wallets without browser extension) — huge DX win
- Post-condition examples (Stacks-specific safety)
- Contract testing setup (Vitest + Clarinet configured)
- Environment-based configuration pattern
- TypeScript strict mode

**Anti-Features (explicitly avoid):**
- Multiple example contracts (causes confusion)
- Complex UI components (becomes component library burden)
- Built-in backend/API (out of scope)
- Token/NFT features (domain-specific, link to examples instead)
- Pre-styled marketing pages (developers will delete)
- Over-engineered abstractions (keep patterns simple and understandable)

### From ARCHITECTURE.md

**Recommended Folder Structure:**
```
stacks-starter/
├── front-end/
│   ├── src/app/               # App Router (routes developers modify)
│   ├── src/components/ui/     # shadcn primitives (reference only)
│   ├── src/components/features/  # Domain-specific components (extend)
│   ├── src/components/providers/ # Context providers (Client Components)
│   ├── src/lib/stacks/        # Blockchain integration (preserve/reference)
│   ├── src/lib/utils/         # Pure utility functions (extend)
│   ├── src/hooks/             # Custom React hooks (extend)
│   ├── src/constants/         # Configuration extension points
│   ├── examples/              # Reference implementations (DELETE after learning)
│   └── docs/                  # Developer documentation
├── clarity/                   # Smart contracts
└── package.json
```

**Critical Pattern: Scaffolding vs. Examples**
- **Scaffolding** (preserve): lib/stacks/, components/ui/, base provider architecture
- **Examples** (delete after learning): examples/counter/ folder — developers should know this is disposable
- **Developer code** (modify): app/, components/features/, custom hooks

**Key Patterns:**
1. Provider composition at root level (AppProviders wrapper)
2. lib/stacks/ abstraction layer for blockchain complexity
3. Feature-based component organization (not type-based)
4. Generic hooks (useContractRead, useContractWrite) + feature-specific hook composition
5. Clear documentation explaining what to keep, modify, and delete

**Provider Nesting Order (critical):**
```
<ThemeProvider>           # Outer - UI theming
  <ConnectProvider>       # Inner - Wallet context
    <QueryClientProvider>
      <App />
    </QueryClientProvider>
  </ConnectProvider>
</ThemeProvider>
```

### From PITFALLS.md

**Critical Pitfalls (cause rewrites/major debt):**

1. **Dynamic Tailwind Class Construction** — Cannot use template literals for class names. Must use complete class names.
   - Prevention: `className={isPrimary ? "bg-blue-500" : "bg-gray-500"}` not `className={`bg-${color}`}`

2. **Provider Architecture Over-Engineering** — Avoid multiple theme providers. Use only ThemeProvider from next-themes.

3. **Component State Pattern Mismatch** — Trust Radix UI's built-in state management, don't duplicate it.

4. **Peer Dependency Conflicts (React 19 + Next.js 15)** — Must use `--legacy-peer-deps` with npm until peer deps update.

5. **Tailwind Content Path Misconfiguration** — If shadcn components aren't in content paths, styles purge in production.

**Moderate Pitfalls (delays/technical debt):**

6. **CSS Variable vs Utility Class Confusion** — Must consistently choose CSS variables approach (`cssVariables: true` in components.json).

7. **Dark Mode Hydration Flashing** — Need `suppressHydrationWarning` on html element and `disableTransitionOnChange` on ThemeProvider.

8. **Component Ownership/Maintenance** — Document which shadcn components are vanilla vs. customized; track updates.

9. **Over-Customization Breaking Patterns** — Don't hardcode colors, break Radix accessibility, or ignore Tailwind conventions.

10. **Chakra-to-Tailwind Responsive Props** — Chakra's `fontSize={{ base: "sm", md: "lg" }}` → Tailwind's `text-sm md:text-lg` (mobile-first).

**Minor Pitfalls (annoyances but fixable):**

11. Forgetting to install lucide-react
12. Missing PostCSS configuration (required for Tailwind v4, good practice for v3)
13. CLI version out of date (use `npx shadcn@latest` always)
14. Searching for Chakra's `useColorModeValue` equivalent (just use CSS: `dark:bg-gray-800`)
15. Documentation becoming stale immediately after migration

**Stacks-Specific Pitfalls:**

16. **Provider Nesting Order** — Stacks Connect + ThemeProvider conflicts if wrong nesting
17. **Wallet Modal Styling Lost** — Connect modal may lose theming post-migration (requires testing)

---

## Critical Decisions Needed

1. **Tailwind v3 vs v4** — Recommendation: USE v3 (browser compat matters for starter kits)
2. **Component library exit** — Chakra UI → shadcn/ui is non-negotiable for customization + maintenance
3. **Monorepo structure** — clarity/ + front-end/ is correct (contracts at bottom, frontend depends on contracts)
4. **Testing strategy** — Vitest for unit tests, E2E for React Server Components (Vitest limitation)
5. **Example organization** — Separate examples/ folder makes it crystal clear these are deletable reference implementations
6. **Provider composition** — Minimal approach: only add providers when needed, not upfront

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Peer dependency conflicts block npm install | HIGH | CRITICAL | Document --legacy-peer-deps in setup guide; recommend pnpm; test installation in CI |
| Tailwind content paths misconfigured | HIGH | CRITICAL | Test production build immediately; validate CSS bundle size; add to Phase 1 checklist |
| Dynamic class construction silently fails | MEDIUM | HIGH | ESLint rule + code review focus + developer training in Phase 1 |
| Developers over-customize components | MEDIUM | MEDIUM | Document that shadcn components have clear ownership guidelines; code review enforcement |
| Dark mode flashing on page load | MEDIUM | MEDIUM | suppressHydrationWarning + disableTransitionOnChange required in setup |
| Developers unclear what to delete | MEDIUM | MEDIUM | Explicit examples/ folder + inline comments saying "DELETE THIS AFTER LEARNING" |
| Stacks Connect modal breaks after migration | MEDIUM | HIGH | Requires hands-on testing; may need separate Connect theming strategy |
| Documentation outdated immediately | LOW | MEDIUM | Add version numbers to key docs; set up dependency update alerts |

---

## Recommended Approach

### Phase Structure (Suggested)

**Phase 1: Foundation & Setup**
- Initialize monorepo workspace
- Install Tailwind CSS v3 + shadcn/ui with proper configs
- Setup provider composition pattern (AppProviders wrapper)
- Configure ESLint 9, Prettier, Vitest, TypeScript
- Create folders: lib/stacks, lib/utils, components/ui, components/features, examples/
- Document: tech choices, known issues (peer deps), setup checklist

**Phase 2: Core Blockchain Integration**
- Implement lib/stacks/ abstraction layer (network config, wallet integration, contract utils)
- Add React Query setup
- Create generic hooks (useContractRead, useContractWrite)
- Add minimal wallet connection UI
- Document: blockchain patterns, how to extend lib/stacks/

**Phase 3: Example Implementation**
- Build examples/counter/ (complete working counter feature)
- Demonstrate hook composition + contract interaction
- Add transaction status feedback
- Document counter example walkthrough

**Phase 4: UI & Components**
- Add shadcn/ui components (8 minimal: Button, Card, Input, Dialog, etc.)
- Build feature components (WalletConnect, CounterDisplay, etc.)
- Implement dark mode with CSS variables
- Add Lucide icons

**Phase 5: Documentation & Polish**
- Write comprehensive README (quick start < 10 min)
- Create docs/getting-started.md, architecture.md, contract-interaction.md, extending.md
- Add troubleshooting guide (migration pitfalls reference)
- Document Chakra → shadcn migration path for existing projects
- Add developer guidelines (extensibility patterns, customization rules)

### Research Flags

**Needs deeper research during planning:**
- Phase 1: Exact peer dependency resolution strategy (document npm vs pnpm behavior)
- Phase 2: Stacks Connect modal theming post-migration (hands-on testing required)
- Phase 3: Post-condition examples for different contract patterns
- Phase 4: Devnet wallet selector implementation details (6 test wallets integration)

**Well-documented patterns (skip detailed research):**
- Next.js 15 App Router folder structure
- shadcn/ui installation and component usage
- Tailwind CSS v3 configuration
- React 19 + TypeScript best practices
- TanStack Query setup and usage

### Gaps to Address

1. **Specific Stacks Connect styling after migration** — Will discover during Phase 4 implementation
2. **Performance benchmarks** — Chakra vs shadcn in Stacks context (nice-to-have, not blocking)
3. **Breaking changes in rapid iterations** — shadcn and Tailwind evolve quickly; keep CLI/versions current
4. **Exact devnet wallet selector UX** — Needs design phase during Phase 3

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| **Technology Stack** | HIGH | Verified against official docs; versions current; dependencies stable |
| **Architecture Patterns** | HIGH | Multiple authoritative sources; Next.js 15 conventions well-established; shadcn integration proven |
| **Feature Priorities** | HIGH | Aligned with Web3 starter kit research; Stacks-specific features verified against docs.stacks.co |
| **Pitfalls** | HIGH | Community experience reports + official docs; 20 pitfalls documented with prevention strategies |
| **Provider/Theming Setup** | HIGH | Official shadcn and next-themes documentation |
| **Stacks-Specific Issues** | MEDIUM | Connect modal styling needs hands-on testing; provider ordering verified but not exhaustively tested |
| **Devnet Wallet Selector** | MEDIUM | Pattern known; implementation details require code review |
| **Phase Sequencing** | HIGH | Dependency order logical; follows build-up from infrastructure to examples to polish |

---

## Success Metrics

Starter kit succeeds when developers can:

1. Clone repo and run locally within 5 minutes
2. Connect wallet (devnet or extension) within 1 minute of app loading
3. Read contract state and see counter value immediately
4. Increment counter and see transaction confirm within 30 seconds (devnet)
5. Understand transaction flow by reading contract-utils.ts patterns
6. Write their own contract function by following counter example
7. Switch networks by changing environment variable
8. Run contract tests with single command (npm test)
9. Delete examples/ folder and build their own features without confusion

---

## Sources Aggregated

### Official Documentation (HIGH confidence)
- Next.js 15, React 19, TypeScript 5.x: Official Next.js docs
- shadcn/ui: ui.shadcn.com installation, dark mode, React 19, theming
- Tailwind CSS: tailwindcss.com v3/v4 upgrade guide
- Stacks: docs.stacks.co, Hiro documentation
- Testing: Vitest official docs, @testing-library docs
- Vercel Academy: shadcn ownership model, component maintenance

### Community Resources (MEDIUM confidence)
- DEV Community: Chakra → Tailwind migration experiences
- GitHub Issues: React 19 peer dependency conflicts, shadcn setup
- Medium/blogs: Next.js folder structure patterns, dApp architecture

### Web3 Research (MEDIUM confidence)
- useWeb3.xyz starter kits survey
- Stacks.js starters and official examples
- Hiro Platform devnet documentation
- Clarity smart contract examples

---

## Next Steps

1. **Create Phase 1 Detailed Requirements** — Using this SUMMARY as input to gsd-roadmapper
2. **Validate Peer Dependency Strategy** — Test npm vs pnpm with React 19 + shadcn
3. **Hands-On Stacks Integration Testing** — Verify Connect modal theming post-migration
4. **Developer Survey** (post-Phase 5) — Gather feedback on documentation clarity and example quality

---

**Recommendation:** Proceed with Phase 1 Foundation & Setup immediately. All critical decisions documented, pitfalls identified, architecture patterns chosen. Implementation can begin with high confidence.
