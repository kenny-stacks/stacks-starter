# Stacks Starter

## What This Is

A minimal starter kit for building dApps on the Stacks blockchain. Provides wallet integration, multi-network support (devnet/testnet/mainnet), and contract interaction patterns out of the box. Developers clone this and start building their own Stacks applications without wiring up the basics.

## Core Value

Developers can connect a wallet and interact with a smart contract within minutes of cloning — the architecture just works.

## Current State

**Version:** v1.2 shipped 2026-02-03

All contracts running on Clarity 4 (clarity_version=4, epoch=3.3).
16 tests passing (11 fundraising + 5 counter).
Devnet deployment verified.

## Current State

**Version:** v1.1 shipped 2026-01-29

**Tech Stack:**
- Next.js 15, React 19, TypeScript
- shadcn/ui + Tailwind CSS
- Clarity smart contracts with Clarinet
- @stacks/connect for wallet integration
- React Query for blockchain state management

**Codebase:**
- 3,477 lines TypeScript + Clarity
- Counter contract demonstrating read/write patterns
- Unified WalletProvider supporting Leather + devnet
- 4 documentation files (README, getting-started, patterns, extending)
- Local-only devnet configuration (Docker + Clarinet)

## Requirements

### Validated

- ✓ Multi-network support (devnet/testnet/mainnet) — v1
- ✓ Leather Wallet integration for testnet/mainnet — v1
- ✓ Devnet wallet selector (6 test wallets) — v1
- ✓ Contract interaction patterns (read-only + transactions) — v1
- ✓ Network-aware configuration via environment variables — v1
- ✓ React Query for blockchain state management — v1
- ✓ Vitest setup for Clarity contract testing — v1
- ✓ shadcn/Tailwind UI foundation with dark mode — v1
- ✓ Counter contract with increment/decrement/get-count — v1
- ✓ Navbar with wallet connection + network indicator — v1
- ✓ Counter display with transaction status — v1
- ✓ README with setup instructions and architecture overview — v1
- ✓ Docs folder with patterns and extension guide — v1
- ✓ Local-only devnet configuration (Hiro Platform removed) — v1.1
- ✓ Simplified environment variables (no platform keys) — v1.1
- ✓ Docker as documented prerequisite — v1.1
- ✓ Clarinet devnet workflow in all documentation — v1.1
- ✓ Clarity 4 version specifier in all contracts — v1.2
- ✓ Counter contract assessed for Clarity 4 idioms (deferred - too minimal) — v1.2
- ✓ Contract tests pass with Clarity 4 (16 tests) — v1.2

### Active

(None — start next milestone to define requirements)

### Out of Scope

- Complex UI components — this is a starter, not a component library
- Multiple example contracts — one counter is enough to demonstrate patterns
- Backend/API — frontend + smart contract only
- Authentication beyond wallet — wallet IS the auth
- Price feeds/currency conversion — not needed for a counter demo
- Mobile app — web-first starter kit
- Real-time subscriptions — beyond starter scope

## Constraints

- **Tech stack**: Next.js 15, React 19, TypeScript, shadcn/Tailwind, Clarity
- **Compatibility**: Must work with Leather Wallet browser extension
- **Networks**: Must support devnet, testnet, and mainnet configurations
- **Testing**: Vitest + Clarinet SDK for contract tests
- **Development**: Docker required for local devnet

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| shadcn/Tailwind over Chakra | More popular, flexible, better DX for customization | ✓ Good — clean foundation |
| Counter as demo contract | Simplest possible example that shows read + write | ✓ Good — clear patterns |
| Keep devnet wallet selector | Essential for local development without browser extension | ✓ Good — great DX |
| Docs folder for patterns | README alone insufficient for architecture explanation | ✓ Good — progressive disclosure |
| Unified WalletProvider | Single context simplifies consumption regardless of network | ✓ Good — cleaner API |
| next-themes for dark mode | SSR-safe, handles hydration, system theme detection | ✓ Good — no flash |
| Link to source in docs | Inline code goes stale; links encourage exploring actual code | ✓ Good — maintainable |
| Local-only devnet | Removes external dependency, simplifies onboarding | ✓ Good — 4 steps vs 6 |
| Docker as prerequisite | Required for Clarinet devnet, worth the trade-off | ✓ Good — industry standard |

---
*Last updated: 2026-02-03 after v1.2 milestone shipped*
