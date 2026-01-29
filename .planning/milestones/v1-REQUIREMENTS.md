# Requirements Archive: v1 Stacks Starter

**Archived:** 2026-01-29
**Status:** SHIPPED

This is the archived requirements specification for v1.
For current requirements, see `.planning/REQUIREMENTS.md` (created for next milestone).

---

# Requirements: Stacks Starter

**Defined:** 2026-01-28
**Core Value:** Developers can connect a wallet and interact with a smart contract within minutes of cloning

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: Tailwind CSS v3 installed and configured with proper content paths
- [x] **FOUN-02**: shadcn/ui initialized with CSS variables approach
- [x] **FOUN-03**: ESLint 9 flat config with Tailwind plugin
- [x] **FOUN-04**: Dark mode working without hydration flash

### UI Components

- [x] **UICM-01**: 8 minimal shadcn components installed (Button, Card, Input, Dialog, Dropdown Menu, Sonner, Badge, Skeleton)
- [x] **UICM-02**: Navbar component with wallet connection button
- [x] **UICM-03**: Counter display component showing current value
- [x] **UICM-04**: Network indicator showing current network (devnet/testnet/mainnet)

### Wallet Integration

- [x] **WALL-01**: Hiro Wallet connection works on testnet/mainnet
- [x] **WALL-02**: Devnet wallet selector shows 6 test wallets
- [x] **WALL-03**: Wallet context provides address, network, connection state
- [x] **WALL-04**: Disconnect functionality works across all networks

### Smart Contract

- [x] **CONT-01**: Counter contract with increment, decrement, get-count functions
- [x] **CONT-02**: Contract deploys to devnet via Clarinet
- [x] **CONT-03**: Read-only call (get-count) works from frontend
- [x] **CONT-04**: Transaction call (increment/decrement) works from frontend
- [x] **CONT-05**: Transaction status shows pending/confirmed/failed

### Developer Experience

- [x] **DEVX-01**: README with prerequisites, quick start, and project structure
- [x] **DEVX-02**: docs/getting-started.md with detailed setup walkthrough
- [x] **DEVX-03**: docs/patterns.md explaining wallet, contract, and query patterns
- [x] **DEVX-04**: docs/extending.md guide for adding new contracts and features
- [x] **DEVX-05**: Working `pnpm dev` starts app connected to devnet
- [x] **DEVX-06**: Working `pnpm test` runs contract tests via Vitest

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Examples

- **EXAM-01**: Additional example contract (e.g., NFT or token)
- **EXAM-02**: Example of contract-to-contract calls
- **EXAM-03**: Example of post-conditions

### Tooling

- **TOOL-01**: GitHub Actions CI workflow for tests
- **TOOL-02**: Deployment guide for Vercel/Netlify
- **TOOL-03**: Docker setup for local development

### Advanced Patterns

- **ADVN-01**: Optimistic updates for transactions
- **ADVN-02**: Transaction history component
- **ADVN-03**: Error boundary patterns

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multiple example contracts | One counter is enough to demonstrate patterns |
| Complex UI components | This is a starter, not a component library |
| Backend/API | Frontend + smart contract only |
| Authentication beyond wallet | Wallet IS the auth |
| Price feeds/currency conversion | Not needed for counter demo |
| Mobile app | Web-first starter kit |
| Real-time subscriptions | Beyond starter scope, add-on pattern |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| UICM-01 | Phase 2 | Complete |
| UICM-02 | Phase 2 | Complete |
| UICM-03 | Phase 2 | Complete |
| UICM-04 | Phase 2 | Complete |
| WALL-01 | Phase 3 | Complete |
| WALL-02 | Phase 3 | Complete |
| WALL-03 | Phase 3 | Complete |
| WALL-04 | Phase 3 | Complete |
| CONT-01 | Phase 4 | Complete |
| CONT-02 | Phase 4 | Complete |
| CONT-03 | Phase 4 | Complete |
| CONT-04 | Phase 4 | Complete |
| CONT-05 | Phase 4 | Complete |
| DEVX-01 | Phase 5 | Complete |
| DEVX-02 | Phase 5 | Complete |
| DEVX-03 | Phase 5 | Complete |
| DEVX-04 | Phase 5 | Complete |
| DEVX-05 | Phase 1 | Complete |
| DEVX-06 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---

## Milestone Summary

**Shipped:** 23 of 23 v1 requirements
**Adjusted:** None — all requirements implemented as specified
**Dropped:** None

---
*Archived: 2026-01-29 as part of v1 milestone completion*
