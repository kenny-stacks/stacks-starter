# Phase 3: Wallet Integration - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect wallets (Leather extension or devnet selector) and manage connection state. Users can connect, see their address, and disconnect. Transaction execution is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Wallet Provider Update
- **CRITICAL:** Hiro Wallet is now Leather Wallet (leather.io)
- Use `@stacks/connect` package for wallet integration
- Update all references from "Hiro" to "Leather"

### Connect Flow
- Direct extension prompt: clicking Connect immediately triggers Leather extension (no intermediate modal)
- Devnet uses dropdown menu showing 6 test wallets
- Network detection determines which flow (Leather extension vs devnet selector)

### Connected State Display
- Truncated address only in navbar (e.g., ST1P...3X2A)
- No network badge in address display (network indicator is separate component from Phase 2)
- Clicking connected address shows dropdown with: full address, copy button, disconnect option

### Claude's Discretion
- Exact truncation length for addresses
- Dropdown styling and positioning
- Error handling for extension not installed
- Loading states during connection

</decisions>

<specifics>
## Specific Ideas

No specific requirements — standard Web3 wallet connection patterns apply.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-wallet-integration*
*Context gathered: 2026-01-28*
