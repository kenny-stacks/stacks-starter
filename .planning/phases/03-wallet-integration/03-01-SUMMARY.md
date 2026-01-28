---
phase: 03
plan: 01
subsystem: wallet
tags: [wallet, context, stacks-connect, devnet, providers]

requires:
  - 01-04: AppProviders established with ThemeProvider
  - 02-02: NetworkType and network configuration utilities

provides:
  - WalletProvider context managing Leather and devnet connections
  - useWallet hook accessible from any client component
  - Unified wallet state management (connection, address, network)

affects:
  - 03-02: Connect wallet button will use connectWallet action
  - 03-03: Wallet display components will read from useWallet hook
  - 04-*: Contract interactions will use wallet address from context

tech-stack:
  added:
    - "@stacks/connect v8.x Promise-based API"
  patterns:
    - "Unified provider pattern (Leather + devnet in single context)"
    - "Network-aware connection (isDevnet flag switches behavior)"
    - "Mounted state pattern for hydration safety"

key-files:
  created:
    - front-end/src/components/providers/wallet-provider.tsx
  modified:
    - front-end/src/components/providers/app-providers.tsx

decisions:
  - title: "Unified WalletProvider over separate Leather/Devnet providers"
    rationale: "Single context simplifies consumption - components just useWallet() regardless of network"
    alternatives: "Separate providers like deprecated HiroWalletProvider + DevnetWalletProvider"
    impact: "Cleaner API for wallet UI components, network switching handled internally"

  - title: "Promise-based @stacks/connect v8.x API"
    rationale: "Deprecated callback-based showConnect() removed, connect() returns Promise"
    alternatives: "Use deprecated v7.x callback API"
    impact: "Modern async/await patterns, but requires error handling with try/catch"

  - title: "Network from environment variable with devnet default"
    rationale: "NEXT_PUBLIC_NETWORK sets network at build time, defaults to devnet for local development"
    alternatives: "Runtime network switching via UI"
    impact: "Simpler implementation, network determined at startup"

metrics:
  duration: "1.6 minutes"
  completed: "2026-01-28"
---

# Phase 03 Plan 01: Unified Wallet Provider Summary

**One-liner:** JWT-free wallet context managing Leather (testnet/mainnet) and devnet connections via @stacks/connect v8.x Promise API

## What Was Built

Created a unified WalletProvider that manages wallet connections for both Leather (testnet/mainnet) and devnet environments through a single context API.

**Key components:**

1. **WalletProvider context** (`wallet-provider.tsx`)
   - Supports Leather wallet via @stacks/connect Promise-based API
   - Supports devnet wallet selection via DevnetWallet state
   - Exposes connection state (isConnected, isConnecting)
   - Provides wallet data (address, network)
   - Offers actions (connectWallet, disconnectWallet)
   - Restores Leather connection on mount from localStorage
   - Prevents hydration issues with mounted state pattern

2. **Provider integration** (`app-providers.tsx`)
   - Added WalletProvider to provider tree
   - Provider nesting: QueryClientProvider > ThemeProvider > WalletProvider
   - Removed Phase 3 TODO comments

**Interface (WalletContextType):**
```typescript
interface WalletContextType {
  isConnected: boolean
  isConnecting: boolean
  address: string | null
  network: NetworkType
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isDevnet: boolean
  devnetWallet: DevnetWallet | null
  setDevnetWallet: (wallet: DevnetWallet | null) => void
}
```

## Technical Implementation

**Leather Connection (testnet/mainnet):**
- Uses `connect()` from @stacks/connect (Promise-based, not deprecated callback API)
- Verifies connection with `isConnected()` after connect
- Retrieves address from `getLocalStorage()?.addresses?.stx?.[0]?.address`
- Handles errors with try/catch, logs to console
- Restores connection state on mount via useEffect

**Devnet Connection:**
- Stores selected DevnetWallet in state
- When devnetWallet set: isConnected = true, address = devnetWallet.stxAddress
- On disconnect: sets devnetWallet to null

**Network Detection:**
- Reads `process.env.NEXT_PUBLIC_NETWORK || "devnet"` as NetworkType
- isDevnet flag switches between Leather and devnet behavior
- Network prop exposed in context for components

**Hydration Safety:**
- Uses mounted state pattern (useState + useEffect)
- Prevents SSR/client mismatch by checking mounted before accessing wallet state
- All computed values (address, isConnected) check mounted flag

## Deviations from Plan

None - plan executed exactly as written.

## Testing Evidence

1. **TypeScript compilation:** `pnpm tsc --noEmit` passes without errors
2. **Dev server:** Starts successfully on localhost:3001 (port 3000 in use)
3. **Exports verified:** WalletProvider component and useWallet hook exported
4. **Context fields:** All required fields present (isConnected, isConnecting, address, network, connectWallet, disconnectWallet, isDevnet, devnetWallet, setDevnetWallet)

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Create unified WalletProvider context | a1105b5 | wallet-provider.tsx |
| 2 | Integrate WalletProvider into AppProviders | bc2d9aa | app-providers.tsx |

## Next Phase Readiness

**Blockers:** None

**Enables:**
- **Plan 03-02:** Connect wallet button can call `connectWallet()` action
- **Plan 03-03:** Wallet display components can read `address` and `isConnected` from `useWallet()`
- **Plan 03-04:** Devnet wallet selector can use `setDevnetWallet()` and `devnetWallet` state

**Considerations:**
- Stacks Connect modal theming still needs hands-on verification (Chakra removed)
- Connection persistence relies on @stacks/connect localStorage (browser-dependent)
- Network switching requires app restart (determined by env var at build time)

## Dependencies Graph

**Built upon:**
- 01-04: AppProviders provider tree structure
- 02-02: NetworkType definition and network utilities

**Consumed by:**
- 03-02: Connect wallet button (uses connectWallet action)
- 03-03: Wallet display (uses address, isConnected, network)
- 03-04: Devnet selector (uses devnetWallet, setDevnetWallet)
- Phase 04: Contract interactions (uses address for transactions)

**Architecture:**
```
QueryClientProvider (data layer)
  └─ ThemeProvider (theming)
      └─ WalletProvider (wallet state) ← NEW
          └─ App components (can useWallet hook)
```
