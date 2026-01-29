# Stacks Starter

## What This Is

A minimal starter kit for building dApps on the Stacks blockchain. Provides wallet integration, multi-network support (devnet/testnet/mainnet), and contract interaction patterns out of the box. Developers clone this and start building their own Stacks applications without wiring up the basics.

## Core Value

Developers can connect a wallet and interact with a smart contract within minutes of cloning — the architecture just works.

## Current Milestone: v1.1 Hiro Platform Migration

**Goal:** Remove Hiro Platform hosted devnet dependency and make local Clarinet devnet the only development path.

**Target changes:**
- Remove Hiro Platform API configuration and conditional logic
- Simplify devnet setup to local-only (`clarinet devnet start`)
- Update all documentation to reflect local devnet workflow
- Clean up environment variables (remove platform-specific vars)

## Current State

**Version:** v1 MVP shipped 2026-01-29

**Tech Stack:**
- Next.js 15, React 19, TypeScript
- shadcn/ui + Tailwind CSS (replaced Chakra UI)
- Clarity smart contracts with Clarinet
- @stacks/connect for wallet integration
- React Query for blockchain state management

**Codebase:**
- 3,477 lines TypeScript + Clarity
- Counter contract demonstrating read/write patterns
- Unified WalletProvider supporting Leather + devnet
- 4 documentation files (README, getting-started, patterns, extending)

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

### Active

- [ ] Remove Hiro Platform hosted devnet configuration — v1.1
- [ ] Simplify devnet constants to local-only — v1.1
- [ ] Update environment variable configuration — v1.1
- [ ] Update README with local devnet instructions — v1.1
- [ ] Update getting-started guide for Clarinet workflow — v1.1
- [ ] Update extending guide to remove platform references — v1.1

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

---
*Last updated: 2026-01-29 after v1.1 milestone start*
