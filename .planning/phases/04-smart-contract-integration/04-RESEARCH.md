# Phase 4: Smart Contract Integration - Research

**Researched:** 2026-01-28
**Domain:** Stacks smart contract integration with Clarity counter contract, read-only calls, and transaction execution
**Confidence:** HIGH

## Summary

Phase 4 integrates a simple Clarity counter contract with the React frontend, demonstrating the complete pattern for blockchain state management and transaction execution on Stacks. The project already has the necessary infrastructure: `@stacks/transactions` v7.0.2 for contract calls, `@stacks/blockchain-api-client` v7.2.2 for read-only queries, React Query v5.66.0 for state management, and existing patterns in `contract-utils.ts` and `campaignQueries.ts` that can be adapted.

The standard approach uses read-only function calls (`callReadOnlyFunction`) for fetching contract state without transactions, and write operations via `@stacks/connect` v8.x's `request('stx_callContract')` method for state-changing transactions. Clarinet v2+ provides `clarinet integrate` to run a local devnet (localhost:3999) with automatic contract deployment in block 2. Transaction status tracking requires polling the Stacks API's transaction endpoint, as transactions progress through pending → confirmed/failed states.

The counter contract is simpler than the existing fundraising contract: just a single `uint` data variable with `increment`, `decrement`, and `get-count` functions. This demonstrates both read and write patterns without the complexity of token transfers, time-based logic, or multiple data structures. The existing React Query patterns from `campaignQueries.ts` provide the foundation for implementing counter queries with 10-second polling.

**Primary recommendation:** Create counter.clar with define-data-var uint, adapt existing React Query patterns for read-only calls with 10s refetchInterval, use unified WalletProvider's contract call utilities, and implement transaction status polling with API client.

## Standard Stack

The established libraries/tools for Stacks contract integration:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@stacks/transactions` | 7.0.2+ | Transaction building and read-only calls | Official library for all contract interactions; provides `callReadOnlyFunction`, `makeContractCall`, `broadcastTransaction` |
| `@stacks/blockchain-api-client` | 7.2.2+ | Blockchain data queries and transaction status | Official API client for Stacks nodes; provides `SmartContractsApi`, `TransactionsApi` for polling |
| `@stacks/connect` | 8.1.9+ | Wallet transaction signing | Already integrated in Phase 3; `request('stx_callContract')` for user-signed transactions |
| `@tanstack/react-query` | 5.66.0 | Async state management | Standard for blockchain data caching, polling, and mutation tracking |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@hirosystems/clarinet-sdk` | 3.0.1 | Contract testing with simnet | Already installed; for Vitest-based contract unit tests |
| Clarinet CLI | 2.x+ | Local devnet orchestration | Run `clarinet integrate` to spin up devnet with Docker |
| `sonner` | Already installed | Toast notifications | Transaction feedback (pending, confirmed, failed states) |
| `@stacks/wallet-sdk` | 7.0.4 | Devnet wallet key derivation | For devnet direct transaction signing (existing `executeContractCall` pattern) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Clarinet devnet | Hiro Platform devnet | Platform requires API key but avoids Docker; local devnet is free and fully controllable |
| React Query | SWR | SWR is lighter but React Query has better mutation state, retry logic, and is already integrated |
| Polling | WebSocket subscriptions | WebSockets more efficient but add complexity; polling sufficient for counter demo |
| API client | Direct fetch() | `@stacks/blockchain-api-client` provides type-safe TypeScript interfaces and is already installed |

**Installation:**
```bash
# All dependencies already installed
npm install @stacks/transactions @stacks/blockchain-api-client @stacks/connect @tanstack/react-query
```

**Note:** Project already has all required dependencies at appropriate versions.

## Architecture Patterns

### Recommended Project Structure
```
clarity/
├── contracts/
│   └── counter.clar              # NEW: Simple counter contract
├── tests/
│   └── counter.test.ts           # NEW: Simnet tests for counter
└── Clarinet.toml                 # Update: Add counter contract

front-end/src/
├── hooks/
│   ├── counterQueries.ts         # NEW: useCounterValue, useIncrementCounter, useDecrementCounter
│   ├── useTransactionStatus.ts   # NEW: Poll transaction status
│   └── chainQueries.ts           # Existing: Keep for reference
├── lib/
│   ├── contract-utils.ts         # Existing: executeContractCall, openContractCall
│   └── stacks-api.ts             # Existing: getApi, apiClients
├── constants/
│   └── contracts.ts              # Update: Add COUNTER_CONTRACT constant
├── components/
│   └── counter-display.tsx       # Update: Connect to real contract data
└── app/
    └── page.tsx                  # Update: Wire counter hooks
```

### Pattern 1: Read-Only Contract Call with React Query
**What:** Fetch contract state without transactions using `callReadOnlyFunction` wrapped in `useQuery`
**When to use:** Reading counter value, campaign info, or any view-only data
**Example:**
```typescript
// Source: Existing campaignQueries.ts pattern adapted for counter
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { getApi, getStacksUrl } from "@/lib/stacks-api"
import { cvToJSON, hexToCV } from "@stacks/transactions"
import { COUNTER_CONTRACT } from "@/constants/contracts"

export const useCounterValue = (): UseQueryResult<number> => {
  const api = getApi(getStacksUrl()).smartContractsApi

  return useQuery<number>({
    queryKey: ["counterValue"],
    queryFn: async () => {
      const response = await api.callReadOnlyFunction({
        contractAddress: COUNTER_CONTRACT.address || "",
        contractName: COUNTER_CONTRACT.name,
        functionName: "get-count",
        readOnlyFunctionArgs: {
          sender: COUNTER_CONTRACT.address || "",
          arguments: [],
        },
      })

      if (response?.okay && response?.result) {
        const result = cvToJSON(hexToCV(response.result))
        if (result?.success) {
          return parseInt(result.value.value, 10)
        } else {
          throw new Error("Error fetching counter value from blockchain")
        }
      } else {
        throw new Error(response?.cause || "Error fetching counter value")
      }
    },
    refetchInterval: 10000, // Poll every 10 seconds for new values
    retry: false,
  })
}
```

### Pattern 2: Transaction-Based Contract Call with Mutation
**What:** Execute state-changing function (increment/decrement) via wallet signature
**When to use:** Any operation that modifies blockchain state
**Example:**
```typescript
// Source: Existing contract-utils.ts + @stacks/connect v8.x pattern
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { request } from "@stacks/connect"
import { uintCV, PostConditionMode } from "@stacks/transactions"
import { useWallet } from "@/components/providers/wallet-provider"
import { COUNTER_CONTRACT } from "@/constants/contracts"
import { executeContractCall } from "@/lib/contract-utils"
import { toast } from "sonner"

export const useIncrementCounter = () => {
  const { isDevnet, devnetWallet } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const txOptions = {
        contractAddress: COUNTER_CONTRACT.address || "",
        contractName: COUNTER_CONTRACT.name,
        functionName: "increment",
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
      }

      if (isDevnet) {
        // Devnet: Direct signing with wallet-sdk
        return await executeContractCall(txOptions, devnetWallet)
      } else {
        // Testnet/Mainnet: Leather wallet signature
        const contract = `${txOptions.contractAddress}.${txOptions.contractName}`
        const result = await request({}, 'stx_callContract', {
          contract,
          functionName: txOptions.functionName,
          functionArgs: txOptions.functionArgs,
          postConditionMode: 'allow',
        })
        return { txid: result.txid }
      }
    },
    onSuccess: (data) => {
      toast.success(`Transaction submitted: ${data.txid}`)
      // Invalidate counter query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["counterValue"] })
    },
    onError: (error) => {
      toast.error(`Transaction failed: ${error.message}`)
    },
  })
}
```

### Pattern 3: Transaction Status Polling
**What:** Poll Stacks API to track transaction from pending → confirmed/failed
**When to use:** After submitting transaction, show status updates to user
**Example:**
```typescript
// Source: @stacks/blockchain-api-client TransactionsApi
import { useQuery } from "@tanstack/react-query"
import { getApi, getStacksUrl } from "@/lib/stacks-api"

type TxStatus = "pending" | "success" | "abort_by_response" | "abort_by_post_condition"

export const useTransactionStatus = (txid: string | null) => {
  const api = getApi(getStacksUrl()).transactionsApi

  return useQuery({
    queryKey: ["transactionStatus", txid],
    queryFn: async () => {
      if (!txid) throw new Error("No transaction ID")

      const tx = await api.getTransactionById({ txId: txid })
      return {
        status: tx.tx_status as TxStatus,
        blockHeight: tx.block_height,
        error: tx.tx_status.includes("abort") ? "Transaction aborted" : null,
      }
    },
    enabled: !!txid,
    refetchInterval: (query) => {
      // Stop polling once confirmed or failed
      const status = query.state.data?.status
      return status === "success" || status?.includes("abort") ? false : 3000
    },
    retry: false,
  })
}
```

### Pattern 4: Simple Counter Contract
**What:** Clarity contract with uint data-var and increment/decrement/get-count functions
**When to use:** Reference implementation for counter.clar
**Example:**
```clarity
;; Source: https://github.com/clarity-lang/overview/blob/master/tutorial-counter.md
;; Simple Counter Contract

(define-data-var counter uint u0)

(define-read-only (get-count)
  (ok (var-get counter)))

(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))))

(define-public (decrement)
  (begin
    (asserts! (> (var-get counter) u0) (err u1)) ;; Prevent underflow
    (var-set counter (- (var-get counter) u1))
    (ok (var-get counter))))
```

### Pattern 5: Contract Deployment with Clarinet
**What:** Deploy counter contract to devnet via Clarinet
**When to use:** Initial setup, contract updates, local testing
**Example:**
```bash
# 1. Add contract to Clarinet.toml
# [contracts.counter]
# path = 'contracts/counter.clar'
# clarity_version = 3
# epoch = 3.0

# 2. Generate devnet deployment plan
clarinet deployment generate --devnet

# 3. Start devnet (runs Docker containers)
clarinet integrate

# 4. Contract deploys automatically in block 2
# Frontend can connect to http://localhost:3999
```

### Anti-Patterns to Avoid
- **Calling read-only functions as transactions:** Use `callReadOnlyFunction` directly, not `makeContractCall`, to avoid unnecessary fees
- **Not handling transaction errors:** Always wrap contract calls in try/catch and show user-friendly error toasts
- **Hardcoding contract addresses:** Use environment-based constants from `contracts.ts` for network-specific addresses
- **Polling indefinitely:** Stop refetching once transaction reaches terminal state (success/abort)
- **Not invalidating queries after mutations:** Call `queryClient.invalidateQueries()` after successful transaction to refresh UI
- **Using callback-based API:** v8.x removed `showConnect({ onFinish })` pattern; use Promise-based `request()` method

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Clarity value encoding | Custom string builders | `Cl` helpers from `@stacks/transactions` (e.g., `Cl.uint(5)`, `Cl.principal(address)`) | Handles type encoding, validation, edge cases automatically |
| Transaction broadcasting | Direct HTTP POST to node | `broadcastTransaction()` (devnet) or `request('stx_callContract')` (wallet) | Handles serialization, error responses, network routing |
| Devnet wallet signing | Manual key derivation | Existing `executeContractCall` in `contract-utils.ts` | Already uses `generateWallet` and `makeContractCall` pattern |
| API client configuration | Raw fetch() calls | Existing `getApi()` from `stacks-api.ts` | Configures base URL, headers, network-aware client instances |
| Transaction status UI | Custom status component | Sonner toasts + React Query status flags | Toast system already installed; `isPending`, `isSuccess`, `isError` built-in |
| Contract response parsing | Manual hex decoding | `cvToJSON(hexToCV(response.result))` | Official Clarity value deserialization; handles all types |

**Key insight:** The project already has well-architected patterns from the fundraising contract. The counter contract is a simplification, not a new pattern. Reuse `contract-utils.ts` utilities, `campaignQueries.ts` structure, and existing API client setup rather than rewriting contract interaction logic.

## Common Pitfalls

### Pitfall 1: Reading Contract Before Devnet Block 2
**What goes wrong:** Frontend queries counter contract immediately after `clarinet integrate` starts, gets "contract not found" error
**Why it happens:** Clarinet deploys contracts in block 2, but devnet starts at block 1; 10-20 second delay until block 2 mines
**How to avoid:** Wait for 3rd block before starting frontend development, or add retry logic to contract queries with `retry: 3`
**Warning signs:** "Contract not found" or 404 errors only on fresh devnet start; works after waiting

### Pitfall 2: Not Handling Contract Error Responses
**What goes wrong:** Contract function returns `(err u1)` for underflow, but frontend doesn't parse error response
**Why it happens:** Read-only calls and transactions both return Response type `(ok value)` or `(err value)`; need to check success field
**How to avoid:** Always check `result?.success` in query parsing; show specific error message from `result.value` on failure
**Warning signs:** Frontend shows generic "Error fetching" message instead of specific validation error from contract

### Pitfall 3: Using Wrong Network Object for Devnet
**What goes wrong:** Transactions fail with "Invalid network" error despite correct localhost:3999 URL
**Why it happens:** `@stacks/network` doesn't have STACKS_DEVNET export; need custom network object with testnet base + custom API URL
**How to avoid:** Use existing `DEVNET_NETWORK` from `constants/devnet.ts` which extends STACKS_TESTNET with localhost client
**Warning signs:** Contract calls work in Clarinet console but fail from frontend; network configuration errors

### Pitfall 4: Race Condition Between Transaction Broadcast and Query Refetch
**What goes wrong:** User clicks increment, transaction succeeds, but UI still shows old counter value
**Why it happens:** Query refetch happens before transaction is mined into block; 10-second polling interval too slow
**How to avoid:** Use optimistic updates with `onMutate`, or reduce refetch interval temporarily after mutation success
**Warning signs:** Counter updates after 10+ seconds; manual refresh shows correct value immediately

### Pitfall 5: Not Stopping Transaction Status Polling
**What goes wrong:** Transaction status query continues polling after confirmation, wasting API requests
**Why it happens:** `refetchInterval` runs indefinitely if not conditionally disabled based on terminal states
**How to avoid:** Return `false` from `refetchInterval` function when `tx_status === "success"` or includes "abort"
**Warning signs:** DevTools shows continuous API requests to transaction endpoint long after confirmation

### Pitfall 6: Using String Network Instead of Network Object
**What goes wrong:** `makeContractCall` accepts `network: 'testnet'` but devnet isn't a valid string option
**Why it happens:** Modern @stacks/transactions supports string shortcuts ('mainnet', 'testnet') but not 'devnet'
**How to avoid:** Always pass network object for devnet: `network: DEVNET_NETWORK` (not string)
**Warning signs:** TypeScript errors about invalid network string; runtime "Unknown network" errors

### Pitfall 7: Forgetting Post-Conditions for Token Transfers
**What goes wrong:** Not applicable for counter contract, but important for token operations
**Why it happens:** Counter only modifies data-var (no asset transfers), so PostConditionMode.Allow is safe
**How to avoid:** For any contract involving STX or token transfers, define explicit post-conditions or user could lose assets
**Warning signs:** This is a security pitfall; counter is safe, but document the pattern for future contracts

## Code Examples

Verified patterns from official sources:

### Clarity Counter Contract with Error Handling
```clarity
;; Source: https://github.com/clarity-lang/overview/blob/master/tutorial-counter.md
;; Counter with underflow protection

(define-data-var counter uint u0)

(define-constant err-underflow (err u1))

(define-read-only (get-count)
  (ok (var-get counter)))

(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))))

(define-public (decrement)
  (begin
    ;; Prevent underflow by checking counter > 0
    (asserts! (> (var-get counter) u0) err-underflow)
    (var-set counter (- (var-get counter) u1))
    (ok (var-get counter))))
```

### Read-Only Call with API Client
```typescript
// Source: Existing campaignQueries.ts + @stacks/blockchain-api-client docs
import { getApi, getStacksUrl } from "@/lib/stacks-api"
import { cvToJSON, hexToCV } from "@stacks/transactions"

const api = getApi(getStacksUrl()).smartContractsApi

const response = await api.callReadOnlyFunction({
  contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  contractName: "counter",
  functionName: "get-count",
  readOnlyFunctionArgs: {
    sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    arguments: [],
  },
})

if (response?.okay && response?.result) {
  const result = cvToJSON(hexToCV(response.result))
  if (result?.success) {
    const count = parseInt(result.value.value, 10)
    console.log("Counter value:", count)
  }
}
```

### Contract Call via Leather Wallet
```typescript
// Source: @stacks/connect v8.x + existing openContractCall pattern
import { request } from "@stacks/connect"
import { PostConditionMode } from "@stacks/transactions"

const contract = `${contractAddress}.${contractName}`

const result = await request({}, 'stx_callContract', {
  contract: contract,
  functionName: 'increment',
  functionArgs: [],
  network: 'testnet', // or 'mainnet'
  postConditionMode: 'allow',
})

console.log("Transaction ID:", result.txid)
// Returns: { txid: "0x1234..." }
```

### Devnet Direct Transaction (Without Wallet)
```typescript
// Source: Existing executeContractCall from contract-utils.ts
import { makeContractCall, broadcastTransaction, PostConditionMode } from "@stacks/transactions"
import { generateWallet } from "@stacks/wallet-sdk"
import { DEVNET_NETWORK } from "@/constants/devnet"

const wallet = await generateWallet({
  secretKey: devnetWallet.mnemonic,
  password: "password",
})

const transaction = await makeContractCall({
  contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  contractName: "counter",
  functionName: "increment",
  functionArgs: [],
  network: DEVNET_NETWORK,
  senderKey: wallet.accounts[0].stxPrivateKey,
  postConditionMode: PostConditionMode.Allow,
  fee: 1000,
})

const response = await broadcastTransaction({
  transaction,
  network: DEVNET_NETWORK,
})

if ("error" in response) {
  throw new Error(response.error)
}

console.log("Transaction ID:", response.txid)
```

### Transaction Status Polling with Auto-Stop
```typescript
// Source: @stacks/blockchain-api-client + React Query patterns
import { useQuery } from "@tanstack/react-query"
import { getApi, getStacksUrl } from "@/lib/stacks-api"

const api = getApi(getStacksUrl()).transactionsApi

const { data: txStatus } = useQuery({
  queryKey: ["transaction", txid],
  queryFn: async () => {
    const tx = await api.getTransactionById({ txId: txid })
    return tx.tx_status // "pending" | "success" | "abort_by_response" | "abort_by_post_condition"
  },
  enabled: !!txid,
  refetchInterval: (query) => {
    const status = query.state.data
    // Stop polling once terminal state reached
    if (status === "success" || status?.includes("abort")) {
      return false
    }
    return 3000 // Poll every 3 seconds while pending
  },
})
```

### Clarinet Devnet Configuration
```toml
# Source: Existing clarity/Clarinet.toml
[contracts.counter]
path = 'contracts/counter.clar'
clarity_version = 3
epoch = 3.0

# Devnet deploys contracts automatically in block 2
# Stacks API: http://localhost:3999
# Stacks Node RPC: http://localhost:20443
# Stacks Explorer: http://localhost:8000
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `openContractCall({ onFinish, onCancel })` | `request('stx_callContract')` | @stacks/connect v8.0 (2025) | Callback-based deprecated; use Promise-based API |
| `callReadOnlyFunction` (transactions package) | `fetchCallReadOnlyFunction` (modern alias) | @stacks/transactions v7.x (2025) | Both work; `fetch*` prefix indicates modern API style |
| Clarinet v1 `clarinet devnet start` | Clarinet v2+ `clarinet integrate` | Clarinet v2.0 (2024) | New command name; improved Docker orchestration |
| Manual deployment plans | `clarinet deployment generate` | Clarinet v2.0 (2024) | Automated deployment plan generation for all networks |
| Callback-based mutation handling | React Query v5 with Promise mutations | @tanstack/react-query v5 (2024) | Better TypeScript support, simpler async patterns |

**Deprecated/outdated:**
- `showConnect()`: Use `connect()` from @stacks/connect v8.x
- `openContractCall()`: Still works but use `request('stx_callContract')` for consistency with v8.x patterns
- Clarinet v1 commands: `devnet start` → `integrate`, `check` → `test` (some renamed)
- React Query v4 APIs: v5 changed some type signatures and mutation patterns

## Open Questions

Things that couldn't be fully resolved:

1. **Transaction Confirmation Speed on Devnet**
   - What we know: Devnet blocks mine every ~30 seconds by default (configurable in Devnet.toml)
   - What's unclear: Whether 10-second polling for counter value is too aggressive or should match block time
   - Recommendation: Start with 10s polling (matches existing `campaignQueries.ts`); can reduce to 5s for better UX or increase to 15s to reduce API load

2. **Optimistic Updates vs. Polling**
   - What we know: React Query supports optimistic updates via `onMutate`, but blockchain requires confirmation
   - What's unclear: Whether to show optimistic counter increment immediately (better UX) or wait for confirmation (accurate)
   - Recommendation: Use polling without optimistic updates for counter (simpler, accurate); document optimistic pattern for advanced implementations

3. **Transaction Failure Handling in UI**
   - What we know: Transactions can abort due to runtime errors, post-conditions, or network issues
   - What's unclear: Best UX for showing "Transaction aborted" vs. "Contract returned error" vs. "Network failure"
   - Recommendation: Parse `tx_status` for abort types; show contract error messages from response; generic message for network failures

4. **Counter Overflow Protection**
   - What we know: Clarity uint is unbounded (arbitrary precision), can't overflow in practice
   - What's unclear: Whether to add artificial limit (e.g., max u1000) for demo purposes or leave unbounded
   - Recommendation: Leave unbounded (simpler contract); overflow protection is important for real apps but unnecessary for counter demo

5. **Multiple Simultaneous Transactions**
   - What we know: User could click increment multiple times rapidly, creating multiple pending transactions
   - What's unclear: Whether to disable button during pending state (standard) or allow queueing (advanced)
   - Recommendation: Disable increment/decrement buttons while `isPending` from useMutation; document queueing pattern for future reference

## Sources

### Primary (HIGH confidence)
- [Clarity Counter Tutorial](https://github.com/clarity-lang/overview/blob/master/tutorial-counter.md) - Official counter contract example
- [Stacks.co Contract Deployment](https://docs.stacks.co/clarinet/contract-deployment) - Clarinet integrate and devnet deployment
- [@stacks/transactions Documentation](https://stacks.js.org/modules/_stacks_transactions) - callReadOnlyFunction, makeContractCall patterns
- [@stacks/blockchain-api-client npm](https://www.npmjs.com/package/@stacks/blockchain-api-client) - SmartContractsApi, TransactionsApi interfaces
- [Stacks Blockchain API Reference](https://hirosystems.github.io/stacks-blockchain-api/) - Transaction status endpoints
- [TanStack Query Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) - useMutation retry and status patterns
- Existing codebase: `front-end/src/hooks/campaignQueries.ts` - React Query patterns for contract read-only calls
- Existing codebase: `front-end/src/lib/contract-utils.ts` - executeContractCall and openContractCall implementations
- Existing codebase: `clarity/settings/Devnet.toml` - Devnet wallet configuration and API ports

### Secondary (MEDIUM confidence)
- [Clarinet Deployment Guide](https://cuddleofdeath.hashnode.dev/guide-to-deploying-a-stacks-contract-w-clarinet-cli) - Practical deployment walkthrough
- [Syvita Guild Devnet Frontend](https://docs.syvita.org/write-smart-contracts/devnet) - Frontend integration with devnet
- [Stacks Transaction Concepts](https://docs.stacks.co/concepts/transactions/transactions) - Transaction lifecycle and states
- [Xverse stx_callContract docs](https://docs.xverse.app/sats-connect/stacks-methods/stx_callcontract) - Contract call parameters and responses
- [React Query Retry Patterns](https://github.com/TanStack/query/issues/374) - Retry configuration discussions

### Tertiary (LOW confidence)
- [Stacks Forum: Pending Transactions](https://forum.stacks.org/t/pending-transaction/11604) - Community discussions on transaction status (2020-2021 era, may be outdated)
- [Clarinet GitHub Issues](https://github.com/hirosystems/clarinet/issues/145) - Historical integration deployment issues (v0.18, likely resolved)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries installed at correct versions, existing patterns in codebase
- Architecture: HIGH - Can directly adapt existing campaignQueries.ts and contract-utils.ts patterns for counter
- Pitfalls: HIGH - Devnet block timing, network configuration, and polling patterns verified from official docs and existing code
- Counter contract: HIGH - Official Clarity tutorial provides canonical counter implementation

**Research date:** 2026-01-28
**Valid until:** 2026-03-28 (60 days) - Stable Stacks.js v7 API; Clarinet v2 mature; counter pattern timeless

**Notes:**
- Existing codebase provides 80% of patterns needed; counter is simplification of fundraising contract
- All required dependencies already installed; no new packages needed
- Clarinet devnet already configured in Devnet.toml with correct wallet mnemonics
- React Query v5 already integrated and working in Phase 3 wallet components
- Main work is writing counter.clar, adapting queries, and connecting UI components
