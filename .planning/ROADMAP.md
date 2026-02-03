# Roadmap: Stacks Starter

## Milestones

- **v1 MVP** - Phases 1-5 (shipped 2026-01-29)
- **v1.1 Hiro Platform Migration** - Phase 6 (shipped 2026-01-29)
- **v1.2 Clarity 4 Update** - Phases 7-8 (shipped 2026-02-03)

## Phases

<details>
<summary>v1 MVP (Phases 1-5) - SHIPPED 2026-01-29</summary>

### Phase 1: Project Setup
**Goal**: Developers have a working Next.js 15 + Clarity development environment
**Plans**: 3 plans

Plans:
- [x] 01-01: Initialize Next.js 15 with TypeScript and shadcn/ui foundation
- [x] 01-02: Set up Clarinet with Counter smart contract and tests
- [x] 01-03: Configure network constants and environment variables

### Phase 2: Wallet Integration
**Goal**: Users can connect wallets on all networks (devnet/testnet/mainnet)
**Plans**: 3 plans

Plans:
- [x] 02-01: Build WalletProvider with Leather integration for testnet/mainnet
- [x] 02-02: Create devnet wallet selector with 6 test wallets
- [x] 02-03: Add navbar with wallet connection button and network indicator

### Phase 3: Contract Interaction
**Goal**: Users can read and write to Counter contract with real-time state updates
**Plans**: 3 plans

Plans:
- [x] 03-01: Implement useCounter hook with React Query for read-only calls
- [x] 03-02: Build increment/decrement transaction flows with status feedback
- [x] 03-03: Create Counter UI component with current value display

### Phase 4: UI Foundation
**Goal**: Application has modern, accessible UI with dark mode support
**Plans**: 3 plans

Plans:
- [x] 04-01: Set up dark mode with next-themes (SSR-safe, no flash)
- [x] 04-02: Build responsive layout with navbar and main content area
- [x] 04-03: Add loading states, error handling, and transaction feedback

### Phase 5: Documentation & Polish
**Goal**: Developers understand architecture and can extend the starter
**Plans**: 3 plans

Plans:
- [x] 05-01: Write README with setup instructions and architecture overview
- [x] 05-02: Create docs for architecture patterns and extension guide
- [x] 05-03: Polish UI, test edge cases, prepare for v1 release

</details>

<details>
<summary>v1.1 Hiro Platform Migration (Phase 6) - SHIPPED 2026-01-29</summary>

**Milestone Goal:** Remove Hiro Platform hosted devnet dependency and make local Clarinet devnet the only development path.

### Phase 6: Hiro Platform Removal
**Goal**: Local Clarinet devnet is the only development path (Hiro Platform configuration removed)
**Depends on**: Phase 5 (v1 shipped)
**Requirements**: CODE-01, CODE-02, CODE-03, CODE-04, DOCS-01, DOCS-02, DOCS-03, DOCS-04
**Plans**: 2 plans

Plans:
- [x] 06-01-PLAN.md — Remove Hiro Platform configuration from code and environment files
- [x] 06-02-PLAN.md — Update all documentation for local Clarinet devnet workflow

</details>

<details>
<summary>v1.2 Clarity 4 Update (Phases 7-8) - SHIPPED 2026-02-03</summary>

**Milestone Goal:** Update smart contracts to Clarity 4 and adopt modern language idioms.

### Phase 7: Clarity 4 Migration
**Goal**: Counter contract runs on Clarity 4 with modern idioms applied where beneficial
**Depends on**: Phase 6 (v1.1 shipped)
**Plans**: 2 plans

Plans:
- [x] 07-01-PLAN.md — Update Clarinet.toml configuration for Clarity 4 and verify tooling
- [x] 07-02-PLAN.md — Review counter contract for Clarity 4 idioms and verify behavior

### Phase 8: Validation
**Goal**: All tests pass and contract works correctly on local devnet with Clarity 4
**Depends on**: Phase 7
**Plans**: 1 plan

Plans:
- [x] 08-01-PLAN.md — Create counter tests and verify devnet deployment

</details>

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Project Setup | v1 | 3/3 | Complete | 2026-01-29 |
| 2. Wallet Integration | v1 | 3/3 | Complete | 2026-01-29 |
| 3. Contract Interaction | v1 | 3/3 | Complete | 2026-01-29 |
| 4. UI Foundation | v1 | 3/3 | Complete | 2026-01-29 |
| 5. Documentation & Polish | v1 | 3/3 | Complete | 2026-01-29 |
| 6. Hiro Platform Removal | v1.1 | 2/2 | Complete | 2026-01-29 |
| 7. Clarity 4 Migration | v1.2 | 2/2 | Complete | 2026-02-02 |
| 8. Validation | v1.2 | 1/1 | Complete | 2026-02-03 |

---
*Last updated: 2026-02-03 — v1.2 milestone complete*
