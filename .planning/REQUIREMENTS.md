# Requirements: Stacks Starter

**Defined:** 2026-01-28
**Core Value:** Developers can connect a wallet and interact with a smart contract within minutes of cloning

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FOUN-01**: Tailwind CSS v3 installed and configured with proper content paths
- [ ] **FOUN-02**: shadcn/ui initialized with CSS variables approach
- [ ] **FOUN-03**: ESLint 9 flat config with Tailwind plugin
- [ ] **FOUN-04**: Dark mode working without hydration flash

### UI Components

- [ ] **UICM-01**: 8 minimal shadcn components installed (Button, Card, Input, Dialog, Dropdown Menu, Sonner, Badge, Skeleton)
- [ ] **UICM-02**: Navbar component with wallet connection button
- [ ] **UICM-03**: Counter display component showing current value
- [ ] **UICM-04**: Network indicator showing current network (devnet/testnet/mainnet)

### Wallet Integration

- [ ] **WALL-01**: Hiro Wallet connection works on testnet/mainnet
- [ ] **WALL-02**: Devnet wallet selector shows 6 test wallets
- [ ] **WALL-03**: Wallet context provides address, network, connection state
- [ ] **WALL-04**: Disconnect functionality works across all networks

### Smart Contract

- [ ] **CONT-01**: Counter contract with increment, decrement, get-count functions
- [ ] **CONT-02**: Contract deploys to devnet via Clarinet
- [ ] **CONT-03**: Read-only call (get-count) works from frontend
- [ ] **CONT-04**: Transaction call (increment/decrement) works from frontend
- [ ] **CONT-05**: Transaction status shows pending/confirmed/failed

### Developer Experience

- [ ] **DEVX-01**: README with prerequisites, quick start, and project structure
- [ ] **DEVX-02**: docs/getting-started.md with detailed setup walkthrough
- [ ] **DEVX-03**: docs/patterns.md explaining wallet, contract, and query patterns
- [ ] **DEVX-04**: docs/extending.md guide for adding new contracts and features
- [ ] **DEVX-05**: Working `npm run dev` starts app connected to devnet
- [ ] **DEVX-06**: Working `npm run test` runs contract tests via Vitest

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
| FOUN-01 | Phase 1 | Pending |
| FOUN-02 | Phase 1 | Pending |
| FOUN-03 | Phase 1 | Pending |
| FOUN-04 | Phase 1 | Pending |
| UICM-01 | Phase 2 | Pending |
| UICM-02 | Phase 2 | Pending |
| UICM-03 | Phase 2 | Pending |
| UICM-04 | Phase 2 | Pending |
| WALL-01 | Phase 3 | Pending |
| WALL-02 | Phase 3 | Pending |
| WALL-03 | Phase 3 | Pending |
| WALL-04 | Phase 3 | Pending |
| CONT-01 | Phase 4 | Pending |
| CONT-02 | Phase 4 | Pending |
| CONT-03 | Phase 4 | Pending |
| CONT-04 | Phase 4 | Pending |
| CONT-05 | Phase 4 | Pending |
| DEVX-01 | Phase 5 | Pending |
| DEVX-02 | Phase 5 | Pending |
| DEVX-03 | Phase 5 | Pending |
| DEVX-04 | Phase 5 | Pending |
| DEVX-05 | Phase 1 | Pending |
| DEVX-06 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after research completion*
