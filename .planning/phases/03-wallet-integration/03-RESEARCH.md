# Phase 3: Wallet Integration - Research

**Researched:** 2026-01-28
**Domain:** Stacks wallet integration with Leather wallet and devnet selector
**Confidence:** HIGH

## Summary

Stacks wallet integration uses `@stacks/connect` v8.x, which has undergone a major API modernization replacing callback-based methods with Promise-based `request()` API following JSON RPC 2.0 standards (SIP-030 and WBIPs). The project already has `@stacks/connect` v8.1.9 installed with deprecated Chakra-based wallet providers that need to be rebuilt for shadcn/ui.

The standard pattern uses React Context for wallet state management with `"use client"` directive in Next.js App Router. Leather wallet (formerly Hiro) is detected via `window.LeatherProvider` and supports Chromium/Firefox browsers. For devnet, the project has 6 pre-configured test wallets with mnemonics ready for local development without browser extensions.

Key architectural decision: Connection state managed through React Context (not custom hooks anymore), with localStorage persistence built into `@stacks/connect`. Address truncation uses middle truncation pattern (e.g., ST1P...3X2A), though 2025 security incidents recommend showing full addresses with copy functionality as safer alternative.

**Primary recommendation:** Use `@stacks/connect` v8.x Promise-based API with React Context pattern, `"use client"` directives, and network-based conditional rendering (Leather for testnet/mainnet, dropdown selector for devnet).

## Standard Stack

The established libraries/tools for Stacks wallet integration:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@stacks/connect` | 8.2.2 (latest: Oct 2025) | Wallet connection and transaction signing | Official Stacks library for dapp-to-wallet communication using modern standards (SIP-030, WBIPs) |
| `@stacks/network` | 7.0.2 | Network configuration (mainnet/testnet/devnet) | Official network abstraction for Stacks blockchain environments |
| `@stacks/transactions` | 7.0.2 | Transaction construction and signing | Official transaction builder for Stacks operations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@stacks/wallet-sdk` | 7.0.4 | Wallet utilities and key management | Already installed; useful for devnet wallet key derivation |
| React Context API | Built-in | Wallet state management | For connection state, user address, network tracking |
| `navigator.clipboard.writeText()` | Built-in | Copy address functionality | Modern browser API for clipboard operations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@stacks/connect` | micro-stacks | micro-stacks is lighter but less officially supported; `@stacks/connect` is the official standard |
| React Context | Zustand/Jotai | Lightweight state libraries add dependency but avoid Context performance issues; Context sufficient for wallet state |
| Custom hooks | `@stacks/connect-react` | The React wrapper is deprecated (v8.x); manual Context management now recommended |

**Installation:**
```bash
npm install @stacks/connect @stacks/network @stacks/transactions
```

**Note:** Project already has these dependencies installed at appropriate versions.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── providers/
│   │   ├── app-providers.tsx       # Root provider composition
│   │   ├── wallet-provider.tsx     # NEW: Unified wallet context
│   │   └── theme-provider.tsx      # Existing
│   ├── wallet/
│   │   ├── connect-button.tsx      # NEW: Network-aware connect button
│   │   ├── wallet-dropdown.tsx     # NEW: Connected wallet dropdown
│   │   └── devnet-wallet-selector.tsx  # NEW: Devnet wallet picker
│   └── navbar.tsx                  # Update with wallet components
├── lib/
│   ├── devnet-wallet-context.ts    # Existing: 6 test wallets
│   ├── networks.ts                 # Existing: NetworkType union
│   ├── address-utils.ts            # Existing: formatStxAddress
│   └── wallet/
│       └── hooks.ts                # NEW: useWallet custom hook
```

### Pattern 1: Unified Wallet Context Provider
**What:** Single context managing both Leather and devnet wallets with network detection
**When to use:** Root of application, wrapping all components that need wallet access
**Example:**
```typescript
// Source: @stacks/connect GitHub examples + existing deprecated providers
"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect"
import { NetworkType } from "@/lib/networks"

interface WalletContextType {
  // Connection state
  isConnected: boolean
  isConnecting: boolean

  // User data
  address: string | null
  network: NetworkType | null

  // Actions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void

  // Devnet specific
  isDevnet: boolean
  devnetWallet: DevnetWallet | null
  setDevnetWallet: (wallet: DevnetWallet) => void
}

export const WalletContext = createContext<WalletContextType>(null!)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  // Network detection: Check environment or user selection
  const network = process.env.NEXT_PUBLIC_NETWORK || "devnet"
  const isDevnet = network === "devnet"

  // Leather wallet connection
  const connectWallet = useCallback(async () => {
    if (isDevnet) return // Devnet uses selector, not Leather

    try {
      await connect()
      setIsConnected(isConnected())

      // Get address from localStorage
      const data = getLocalStorage()
      const stxAddress = data?.addresses?.stx?.[0]?.address
      setAddress(stxAddress || null)
    } catch (error) {
      console.error("Connection failed:", error)
    }
  }, [isDevnet])

  // Implementation details...

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
```

### Pattern 2: Network-Aware Connect Button
**What:** Button component that conditionally renders Leather connection or devnet selector
**When to use:** In navbar or anywhere wallet connection is triggered
**Example:**
```typescript
// Source: Next.js App Router patterns + deprecated ConnectWallet.tsx
"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/wallet/hooks"

export function ConnectButton() {
  const { isConnected, isConnecting, connectWallet, isDevnet } = useWallet()

  if (isDevnet) {
    return <DevnetWalletSelector />
  }

  // Leather extension flow
  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      variant="outline"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
```

### Pattern 3: Connected Wallet Dropdown
**What:** Dropdown showing truncated address with full address copy and disconnect actions
**When to use:** When wallet is connected, replacing connect button
**Example:**
```typescript
// Source: shadcn/ui DropdownMenu + Web3 patterns
"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatStxAddress } from "@/lib/address-utils"
import { useWallet } from "@/lib/wallet/hooks"
import { toast } from "sonner"

export function WalletDropdown() {
  const { address, disconnectWallet } = useWallet()

  const copyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {formatStxAddress(address || "")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyAddress}>
          <span className="font-mono text-xs">{address}</span>
          <span className="ml-2">Copy</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={disconnectWallet}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Pattern 4: Devnet Wallet Selector
**What:** Dropdown menu showing 6 pre-configured devnet test wallets
**When to use:** On devnet network, replacing Leather connect button
**Example:**
```typescript
// Source: Existing devnet-wallet-context.ts + shadcn/ui Select
"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { devnetWallets } from "@/lib/devnet-wallet-context"
import { useWallet } from "@/lib/wallet/hooks"
import { formatStxAddress } from "@/lib/address-utils"

export function DevnetWalletSelector() {
  const { devnetWallet, setDevnetWallet } = useWallet()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {devnetWallet ? formatStxAddress(devnetWallet.stxAddress) : "Select Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {devnetWallets.map((wallet) => (
          <DropdownMenuItem
            key={wallet.stxAddress}
            onClick={() => setDevnetWallet(wallet)}
          >
            <div className="flex flex-col">
              <span className="font-medium">{wallet.label}</span>
              <span className="text-xs text-muted-foreground">
                {formatStxAddress(wallet.stxAddress)}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Anti-Patterns to Avoid
- **Using deprecated `showConnect()` method:** Version 8.x replaced this with Promise-based `connect()`. Old method won't work with modern wallets.
- **Returning both mainnet and testnet addresses:** Security change in v8.x only returns current network's address. Don't expect both.
- **Missing `"use client"` directive:** Wallet providers use browser APIs (localStorage, window) and must be client components in Next.js App Router.
- **Assuming wallet is installed:** Check for `window.LeatherProvider` before attempting connection; show install prompt if missing.
- **Hand-rolling address truncation:** Use existing `formatStxAddress` from `address-utils.ts` for consistency.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Wallet connection flow | Custom WebSocket or API polling | `@stacks/connect` `connect()` method | Handles wallet detection, user approval, localStorage persistence, and network selection automatically |
| Address truncation logic | Custom string slicing | Existing `formatStxAddress` utility | Already implemented with configurable start/end characters; consistent across app |
| Network configuration | Hardcoded strings | `NetworkType` union from `networks.ts` | Type-safe, already integrated with NetworkIndicator component |
| Devnet test wallets | New wallet generation | Existing `devnetWallets` array | 6 pre-configured wallets with mnemonics from Clarinet default setup |
| Clipboard operations | `document.execCommand('copy')` | `navigator.clipboard.writeText()` | Modern API with better security, Promise-based, already supported in target browsers |
| Connection state persistence | Custom localStorage hooks | `@stacks/connect` built-in persistence | Library handles state automatically via `getLocalStorage()` |

**Key insight:** `@stacks/connect` v8.x handles most complexity internally. The deprecated `@stacks/connect-react` hooks encouraged over-abstraction. Current best practice is thin Context wrapper around library primitives, not custom state management.

## Common Pitfalls

### Pitfall 1: Using Callback-Based API (v7.x pattern)
**What goes wrong:** Using `onFinish` and `onCancel` callbacks with `showConnect()` results in runtime errors
**Why it happens:** v8.x replaced callback-based API with Promise-based `request()` method following JSON RPC 2.0 standards
**How to avoid:** Use `await connect()` with try/catch instead of `showConnect({ onFinish, onCancel })`
**Warning signs:** TypeScript errors about missing methods; deprecated function warnings in console

### Pitfall 2: Expecting Both Mainnet and Testnet Addresses
**What goes wrong:** Code expects `data.addresses.stx` to return both mainnet and testnet addresses, but only gets one
**Why it happens:** Security change in v8.x: "For security reasons, the 8.x.x release only returns the current network's address"
**How to avoid:** Check address prefix (ST = testnet, SP = mainnet) to determine network, don't rely on multiple addresses
**Warning signs:** Address is null when switching networks; can't detect user's other addresses

### Pitfall 3: Missing "use client" Directive in Next.js App Router
**What goes wrong:** Server-side rendering errors about `window is not defined` or `localStorage is not defined`
**Why it happens:** Wallet providers use browser-only APIs; Next.js App Router defaults to server components
**How to avoid:** Add `"use client"` at top of any component using wallet context, connect methods, or browser APIs
**Warning signs:** Hydration mismatches; errors only in production builds; works in development but fails in deployment

### Pitfall 4: Not Checking for Leather Extension Installation
**What goes wrong:** `connect()` call hangs or fails silently when Leather extension isn't installed
**Why it happens:** `@stacks/connect` doesn't provide built-in detection UI; assumes wallet exists
**How to avoid:** Check `if (window.LeatherProvider)` before calling `connect()`; show install link if false
**Warning signs:** Loading state never resolves; users confused why nothing happens on connect click

### Pitfall 5: Network Mismatch Between App and Wallet
**What goes wrong:** User's Leather wallet is on mainnet but app expects testnet addresses, connection succeeds but operations fail
**Why it happens:** Wallet network is user-controlled; app network is developer-configured; no automatic sync
**How to avoid:** Display current network from `getLocalStorage()` after connection; warn if mismatch with expected network
**Warning signs:** Transactions fail with "wrong network" errors; address format seems wrong (SP vs ST)

### Pitfall 6: Forgetting to Update Component State After Connect
**What goes wrong:** User connects wallet but UI doesn't update; still shows "Connect Wallet" button
**Why it happens:** v8.x removed auto-reload hooks; manual state management required
**How to avoid:** After `await connect()`, call `setIsConnected(isConnected())` and fetch address from `getLocalStorage()`
**Warning signs:** Need to refresh page to see connected state; wallet is connected but app doesn't know

### Pitfall 7: Address Truncation Security Trade-off
**What goes wrong:** Users copy wrong address due to truncated display; phishing attacks exploit similar-looking truncated strings
**Why it happens:** UX prefers short strings, but blockchain addresses are long and have no structure for secure middle truncation
**How to avoid:** Show full address in dropdown/tooltip; use copy button instead of letting users manually copy truncated string
**Warning signs:** User reports sending to wrong address; copied address doesn't match displayed truncation

## Code Examples

Verified patterns from official sources:

### Basic Wallet Connection (v8.x Pattern)
```typescript
// Source: https://github.com/hirosystems/connect/tree/main/packages/connect
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';

// Check if already connected
if (isConnected()) {
  console.log('Already authenticated');
} else {
  // Connect and authenticate
  const response = await connect();
  console.log('Connected:', isConnected()); // true
}

// Get user's address
const data = getLocalStorage();
const stxAddress = data?.addresses?.stx?.[0]?.address;
console.log('User address:', stxAddress);

// Disconnect
disconnect();
console.log('Connected:', isConnected()); // false
```

### Making Transaction Requests
```typescript
// Source: https://docs.stacks.co/stacks-connect/connect-wallet
import { request } from '@stacks/connect';

// Transfer STX
const response = await request('stx_transferStx', {
  amount: '1000',
  recipient: 'SP2MF04VAGYHGAZWGTEDW5VYCPDWWSY08Z1QFNDSN',
  network: 'mainnet', // optional, defaults to mainnet
});

// Call contract
const contractResponse = await request('stx_callContract', {
  contract: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.my-contract',
  function: 'transfer',
  arguments: ['u100', 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'],
});
```

### Leather Extension Detection
```typescript
// Source: https://leather.io/posts/api-overview
if (window.LeatherProvider) {
  // Leather extension is installed
  console.log('Leather wallet detected');
  await connect();
} else {
  // Show install prompt
  window.open('https://leather.io/install', '_blank');
}
```

### Address Truncation (Existing Utility)
```typescript
// Source: Existing front-end/src/lib/address-utils.ts
export const formatStxAddress = (
  address: string,
  chars = { start: 6, end: 4 }
): string => {
  if (!address) return '';
  if (address.length <= chars.start + chars.end) return address;

  return `${address.slice(0, chars.start)}...${address.slice(-chars.end)}`;
};

// Usage
formatStxAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')
// Returns: "ST1PQH...ZGZGM"
```

### Copy to Clipboard with Toast Feedback
```typescript
// Source: Modern browser API + sonner toast
import { toast } from "sonner"

const copyAddress = async (address: string) => {
  try {
    await navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
  } catch (error) {
    toast.error("Failed to copy address")
  }
}
```

### Network Detection from Address
```typescript
// Source: Deprecated HiroWalletProvider.tsx pattern
const detectNetwork = (address: string): NetworkType => {
  if (address.startsWith('ST')) return 'testnet'
  if (address.startsWith('SP')) return 'mainnet'
  // Devnet addresses look like testnet (ST prefix) but require local chain
  return 'devnet'
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `showConnect({ onFinish, onCancel })` | `await connect()` | v8.0.0 (2025) | Migration required: All callback-based code must convert to Promise-based |
| `@stacks/connect-react` hooks | Manual React Context | v8.0.0 (2025) | React wrapper deprecated; developers now manage state directly |
| `UserSession` class | `getLocalStorage()` function | v8.0.0 (2025) | Simpler API; less OOP boilerplate |
| Returns both mainnet/testnet addresses | Returns only current network address | v8.0.0 (2025) | Security improvement; requires network detection logic |
| "Hiro Wallet" branding | "Leather Wallet" branding | 2024-2025 | Update all user-facing text and documentation |
| WalletConnect v1 | WalletConnect v2 with project ID | v8.0.0 (2025) | WalletConnect now requires `walletConnectProjectId` parameter |

**Deprecated/outdated:**
- `@stacks/connect-react` package: Marked as deprecated in v8.x; use plain `@stacks/connect` with custom React Context
- `openSTXTransfer()`, `openContractCall()`: Replaced by `request('stx_transferStx')`, `request('stx_callContract')` following JSON RPC standards
- "Hiro" naming: Wallet rebranded to "Leather" (leather.io); check `window.LeatherProvider` not `window.HiroProvider`

## Open Questions

Things that couldn't be fully resolved:

1. **Address Truncation Length vs. Security**
   - What we know: 50M USDT phishing attack (Dec 2025) prompted Ethereum community to recommend full addresses
   - What's unclear: Optimal truncation for Stacks addresses (42 chars vs Ethereum's 40 chars)
   - Recommendation: Use existing `formatStxAddress` default (6 start + 4 end) for navbar; show full address in dropdown with prominent copy button

2. **Chakra UI Modal Theme Breaking**
   - What we know: CONTEXT.md mentions "Stacks Connect modal theming may break after Chakra removal (needs hands-on testing)"
   - What's unclear: Whether v8.x still uses Chakra for wallet modal UI, or if that's been decoupled
   - Recommendation: Test wallet connection modal appearance after implementation; may need custom CSS to restyle if Chakra styles are missing

3. **Network Environment Variable vs. Runtime Detection**
   - What we know: Network can be set via `NEXT_PUBLIC_NETWORK` env var; user's wallet has its own network setting
   - What's unclear: Should app auto-detect network from wallet after connection, or strictly enforce env var network?
   - Recommendation: Start with env var as source of truth; show warning if wallet network doesn't match; Phase 4 can add network switching

4. **WalletConnect Integration Timeline**
   - What we know: `@stacks/connect` v8.x supports WalletConnect v2 with project ID parameter
   - What's unclear: Is WalletConnect needed for this phase, or only for mobile wallet support (future phase)?
   - Recommendation: Skip WalletConnect for Phase 3; focus on Leather extension and devnet selector; defer mobile wallets to later phase

5. **Devnet Wallet Key Management**
   - What we know: 6 devnet wallets have mnemonics stored in plaintext in `devnet-wallet-context.ts`
   - What's unclear: Should mnemonics be hidden in production builds? Is this a security concern for devnet-only?
   - Recommendation: Keep current approach (plaintext mnemonics) since devnet never touches real assets; add comment warning not to use these wallets on mainnet

## Sources

### Primary (HIGH confidence)
- [@stacks/connect GitHub repository](https://github.com/hirosystems/connect) - Current version 8.2.2, API patterns, migration guide
- [@stacks/connect package documentation](https://github.com/hirosystems/connect/tree/main/packages/connect) - Installation, usage examples, v8.x changes
- [Stacks Connect official docs](https://connect.stacks.js.org/) - RPC methods, wallet provider interface
- [Stacks.co Connect Wallet guide](https://docs.stacks.co/stacks-connect/connect-wallet) - Connection patterns, best practices
- [Leather wallet API overview](https://leather.io/posts/api-overview) - Extension detection, LeatherProvider interface
- Existing codebase: `front-end/src/components/_deprecated-chakra/HiroWalletProvider.tsx` - v8.x implementation patterns
- Existing codebase: `front-end/src/lib/devnet-wallet-context.ts` - Clarinet default wallet configuration

### Secondary (MEDIUM confidence)
- [Next.js App Router docs - Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - "use client" directive usage
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - React Context for wallet state
- [truncate-eth-address npm package](https://www.npmjs.com/package/truncate-eth-address/v/1.0.2) - Address truncation patterns (Ethereum context)
- [PatternFly Truncation UX guidelines](https://www.patternfly.org/ux-writing/truncation/) - Middle truncation best practices
- [Clarinet devnet configuration docs](https://docs.syvita.org/write-smart-contracts/devnet) - Devnet wallet setup

### Tertiary (LOW confidence)
- [50 Million USDT phishing attack article](https://bitcoinethereumnews.com/ethereum/50-million-usdt-phishing-attack-triggers-ethereum-community-to-end-ellipsis-address-truncation-and-show-full-wallet-addresses/) - Address truncation security concerns (Ethereum ecosystem, Dec 2025)
- [useCopyToClipboard hook](https://usehooks-ts.com/react-hook/use-copy-to-clipboard) - React clipboard patterns (general, not Stacks-specific)
- [React Stack Patterns 2026](https://www.patterns.dev/react/react-2026/) - General React patterns (not wallet-specific)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Stacks libraries well-documented, project already has correct versions installed
- Architecture: HIGH - Clear patterns from deprecated codebase, Next.js App Router docs, and `@stacks/connect` examples
- Pitfalls: HIGH - v8.x migration documented in official sources; existing codebase shows v7.x patterns to avoid

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days) - Stable domain, but Stacks ecosystem moves quickly; revalidate before major version changes

**Notes:**
- Project is well-positioned: Already has correct dependencies, deprecated providers show patterns to follow
- Major risk: Chakra UI modal styling needs testing; can't verify until hands-on implementation
- Recommendation: Prioritize Leather + devnet flows; defer WalletConnect/mobile wallets to future phase
