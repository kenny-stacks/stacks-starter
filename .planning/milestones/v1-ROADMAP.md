# Milestone v1: Stacks Starter MVP

**Status:** SHIPPED 2026-01-29
**Phases:** 1-5
**Total Plans:** 15

## Overview

Transform the existing Stacks fundraising dApp into a minimal developer starter kit. Strip out domain-specific complexity (fundraising logic, complex UI), replace Chakra UI with shadcn/Tailwind, swap fundraising contract with simple counter, and document the core patterns. The result: developers clone, connect a wallet, and interact with a smart contract within minutes.

## Phases

### Phase 1: Foundation & Developer Setup

**Goal**: Developers can run the project locally with modern UI foundation and development tools
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, DEVX-05, DEVX-06
**Success Criteria** (what must be TRUE):
  1. Developer runs `pnpm install` successfully
  2. Developer runs `pnpm dev` and sees app start on localhost with Tailwind styles applied
  3. Developer sees dark mode toggle work without hydration flash
  4. Developer runs `pnpm test` and sees contract tests execute via Vitest
  5. ESLint catches Tailwind dynamic class construction errors during development
**Plans:** 4 plans

Plans:
- [x] 01-01-PLAN.md — pnpm migration (remove npm, install pnpm)
- [x] 01-02-PLAN.md — Tailwind CSS + shadcn/ui foundation
- [x] 01-03-PLAN.md — Dev tooling (ESLint Tailwind plugin, Prettier, Vitest)
- [x] 01-04-PLAN.md — Dark mode + Chakra UI removal

**Completed:** 2026-01-28

### Phase 2: UI Component Library

**Goal**: Developers have working shadcn components and feature UI ready for wallet/contract integration
**Depends on**: Phase 1
**Requirements**: UICM-01, UICM-02, UICM-03, UICM-04
**Success Criteria** (what must be TRUE):
  1. Navbar renders with placeholder wallet button
  2. Counter display component shows mock value (0)
  3. Network indicator displays current network (devnet/testnet/mainnet)
  4. All 8 shadcn primitives (Button, Card, Input, Dialog, Dropdown Menu, Sonner, Badge, Skeleton) render correctly
  5. UI adapts to dark/light mode using CSS variables
**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Install shadcn/ui primitives and configure Toaster
- [x] 02-02-PLAN.md — Create feature components (Navbar, Counter Display, Network Indicator)
- [x] 02-03-PLAN.md — Page integration and visual verification

**Completed:** 2026-01-28

### Phase 3: Wallet Integration

**Goal**: Developers can connect wallets (Leather extension or devnet selector) and manage connection state
**Depends on**: Phase 2
**Requirements**: WALL-01, WALL-02, WALL-03, WALL-04
**Success Criteria** (what must be TRUE):
  1. Developer clicks "Connect Wallet" and sees Leather extension prompt (testnet/mainnet)
  2. Developer on devnet sees wallet selector with 6 test wallets
  3. Developer selects wallet and sees address displayed in navbar
  4. Wallet context provides current address, network, and connection state to child components
  5. Developer clicks "Disconnect" and wallet connection clears
**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Wallet context foundation (WalletProvider, AppProviders integration)
- [x] 03-02-PLAN.md — Wallet UI components (DevnetWalletSelector, ConnectButton, WalletDropdown)
- [x] 03-03-PLAN.md — Navbar integration and visual verification

**Completed:** 2026-01-28

### Phase 4: Smart Contract Integration

**Goal**: Developers can read counter value and execute increment/decrement transactions
**Depends on**: Phase 3
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05
**Success Criteria** (what must be TRUE):
  1. Counter contract deploys to devnet via `clarinet integrate`
  2. Developer loads app and sees current counter value fetched from contract
  3. Developer clicks "Increment" and sees transaction pending state
  4. Developer sees transaction confirm and counter value update on-chain
  5. Transaction status shows pending/confirmed/failed states clearly
  6. Developer clicks "Decrement" and sees counter decrease by 1
**Plans:** 3 plans

Plans:
- [x] 04-01-PLAN.md — Counter contract and Clarinet configuration
- [x] 04-02-PLAN.md — React Query hooks for contract interaction
- [x] 04-03-PLAN.md — UI integration and end-to-end verification

**Completed:** 2026-01-28

### Phase 5: Documentation & Polish

**Goal**: Developers understand architecture, patterns, and how to extend the starter kit
**Depends on**: Phase 4
**Requirements**: DEVX-01, DEVX-02, DEVX-03, DEVX-04
**Success Criteria** (what must be TRUE):
  1. Developer reads README and understands prerequisites, quick start, and project structure within 5 minutes
  2. Developer follows docs/getting-started.md and completes full setup walkthrough
  3. Developer reads docs/patterns.md and understands wallet integration, contract interaction, and React Query patterns
  4. Developer reads docs/extending.md and knows how to add new contract functions or replace counter with their own contract
  5. Documentation explains what code is scaffolding (keep), examples (delete after learning), and developer code (modify)
**Plans:** 2 plans

Plans:
- [x] 05-01-PLAN.md — README and getting-started.md (entry point documentation)
- [x] 05-02-PLAN.md — patterns.md and extending.md (deep-dive documentation)

**Completed:** 2026-01-29

---

## Milestone Summary

**Key Decisions:**
- shadcn/Tailwind over Chakra UI for customization and DX
- Tailwind v3 over v4 for browser compatibility (starter kit priority)
- Counter contract as simplest example showing read + write patterns
- Unified WalletProvider over separate Leather/Devnet providers
- next-themes for dark mode (SSR-safe, no hydration flash)
- Promise-based @stacks/connect v8.x API (modern async/await)
- Link to source files in docs instead of inline code (maintainability)

**Issues Resolved:**
- Chakra UI completely removed (62 packages)
- Hydration flash eliminated with next-themes + mounted state pattern
- React Query hooks established for contract interaction
- Documentation structure established (README → getting-started → patterns → extending)

**Issues Deferred:**
- Input, Dialog shadcn components included but unused (for extension)
- Legacy useDevnetWallet hook export (minor cleanup)

**Technical Debt Incurred:**
- 8 Chakra components in _deprecated-chakra folders (can be deleted)
- ESLint warnings about Tailwind shorthand (cosmetic only)

---

_For current project status, see .planning/ROADMAP.md (next milestone)_
