# Stacks Starter

## What This Is

A minimal starter kit for building dApps on the Stacks blockchain. Provides wallet integration, multi-network support (devnet/testnet/mainnet), and contract interaction patterns out of the box. Developers clone this and start building their own Stacks applications without wiring up the basics.

## Core Value

Developers can connect a wallet and interact with a smart contract within minutes of cloning — the architecture just works.

## Requirements

### Validated

<!-- Existing architecture being preserved -->

- ✓ Multi-network support (devnet/testnet/mainnet) — existing
- ✓ Hiro Wallet integration for testnet/mainnet — existing
- ✓ Devnet wallet selector (6 test wallets) — existing
- ✓ Contract interaction patterns (read-only + transactions) — existing
- ✓ Network-aware configuration via environment variables — existing
- ✓ React Query for blockchain state management — existing
- ✓ Vitest setup for Clarity contract testing — existing

### Active

<!-- What we're building in this transformation -->

- [ ] Replace Chakra UI with shadcn/Tailwind
- [ ] Replace fundraising contract with simple counter contract
- [ ] Minimal shell UI (navbar with wallet connection + counter display)
- [ ] README with setup instructions and architecture overview
- [ ] Docs folder with patterns and extension guide

### Out of Scope

- Complex UI components — this is a starter, not a component library
- Multiple example contracts — one counter is enough to demonstrate patterns
- Backend/API — frontend + smart contract only
- Authentication beyond wallet — wallet IS the auth
- Price feeds/currency conversion — not needed for a counter demo

## Context

**Current state:** Fully functional fundraising dApp with Chakra UI, complex campaign logic, donation flows, admin controls.

**Transformation goal:** Strip down to essential architecture, swap UI framework, replace domain-specific logic with generic counter example.

**Codebase mapping:** `.planning/codebase/` contains detailed analysis of current architecture, patterns, and structure.

**Key files to preserve patterns from:**
- `front-end/src/lib/contract-utils.ts` — transaction execution
- `front-end/src/lib/stacks-api.ts` — API client setup
- `front-end/src/components/HiroWalletProvider.tsx` — wallet context
- `front-end/src/components/DevnetWalletProvider.tsx` — devnet wallets
- `front-end/src/hooks/` — React Query patterns

## Constraints

- **Tech stack**: Next.js 15, React 19, TypeScript, shadcn/Tailwind, Clarity
- **Compatibility**: Must work with Hiro Wallet browser extension
- **Networks**: Must support devnet, testnet, and mainnet configurations
- **Testing**: Vitest + Clarinet SDK for contract tests

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| shadcn/Tailwind over Chakra | More popular, flexible, better DX for customization | — Pending |
| Counter as demo contract | Simplest possible example that shows read + write | — Pending |
| Keep devnet wallet selector | Essential for local development without browser extension | — Pending |
| Docs folder for patterns | README alone insufficient for architecture explanation | — Pending |

---
*Last updated: 2026-01-28 after initialization*
