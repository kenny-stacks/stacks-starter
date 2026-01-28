---
phase: 04
plan: 02
subsystem: contract-hooks
tags: [react-query, stacks-api, mutations, polling]
dependency_graph:
  requires: [03-wallet-integration]
  provides: [counter-hooks, transaction-status]
  affects: [04-03]
tech-stack:
  added: []
  patterns: [react-query-mutations, contract-read-only-calls, transaction-polling]
key-files:
  created:
    - front-end/src/hooks/counterQueries.ts
    - front-end/src/hooks/useTransactionStatus.ts
  modified:
    - front-end/src/constants/contracts.ts
decisions:
  - id: DEC-04-02-01
    decision: "Return type normalization for openContractCall"
    rationale: "openContractCall returns result with optional txid; mutations normalize to { txid: string } for consistent onSuccess handling"
metrics:
  duration: 2.3min
  completed: 2026-01-28
---

# Phase 4 Plan 02: Counter Contract Hooks Summary

**One-liner:** React Query hooks for counter contract read/write operations with devnet/testnet branching and transaction status polling

## What Was Built

### Counter Contract Hooks (counterQueries.ts)

Created three hooks for counter contract interactions:

1. **useCounterValue** - Read-only query hook
   - Fetches counter value via `callReadOnlyFunction` API
   - Parses `(ok uint)` response structure
   - 10-second refetch interval matches existing patterns
   - `retry: 3` handles devnet block 2 deployment timing

2. **useIncrementCounter** - Mutation hook for increment
   - Checks `isConnected` before executing
   - Devnet: Direct signing via `executeContractCall`
   - Testnet/Mainnet: Leather wallet via `openContractCall`
   - Invalidates `counterValue` query on success
   - Toast feedback via Sonner

3. **useDecrementCounter** - Mutation hook for decrement
   - Same pattern as increment
   - Contract handles underflow protection

### Transaction Status Hook (useTransactionStatus.ts)

Polling hook for transaction lifecycle tracking:
- `enabled: !!txid` - only polls when transaction ID exists
- 3-second polling interval while pending
- Auto-stops on terminal states (success/abort)
- Returns structured result with `isConfirmed`/`isFailed` booleans

## Key Code Patterns

### Read-Only Contract Call
```typescript
const response = await api.callReadOnlyFunction({
  contractAddress: COUNTER_CONTRACT.address || "",
  contractName: COUNTER_CONTRACT.name,
  functionName: "get-count",
  readOnlyFunctionArgs: { sender: COUNTER_CONTRACT.address || "", arguments: [] },
})
const result = cvToJSON(hexToCV(response.result))
if (result?.success) return parseInt(result.value.value, 10)
```

### Devnet/Testnet Branching
```typescript
if (isDevnet) {
  return await executeContractCall(txOptions, devnetWallet)
} else {
  const result = await openContractCall(txOptions)
  return { txid: result.txid || "" }
}
```

### Conditional Polling Stop
```typescript
refetchInterval: (query) => {
  const data = query.state.data
  if (data?.isConfirmed || data?.isFailed) return false
  return 3000
}
```

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| DEC-04-02-01 | Normalize openContractCall return to `{ txid: string }` | openContractCall returns optional txid; mutations need consistent type for onSuccess slice |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added COUNTER_CONTRACT constant**
- **Found during:** Task 1
- **Issue:** Plan 02 depends on COUNTER_CONTRACT from Plan 01 which hasn't been executed yet
- **Fix:** Added COUNTER_CONTRACT constant to contracts.ts following existing FUNDRAISING_CONTRACT pattern
- **Files modified:** front-end/src/constants/contracts.ts
- **Commit:** 2c76e70

## Files Changed

| File | Change | Lines |
|------|--------|-------|
| front-end/src/hooks/counterQueries.ts | Created | 121 |
| front-end/src/hooks/useTransactionStatus.ts | Created | 47 |
| front-end/src/constants/contracts.ts | Modified | +9 |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 2c76e70 | feat | Add useCounterValue hook and COUNTER_CONTRACT constant |
| 58031e6 | feat | Add useIncrementCounter and useDecrementCounter mutations |
| 152a700 | feat | Create useTransactionStatus hook for transaction polling |

## Verification Results

- [x] TypeScript compiles without errors
- [x] counterQueries.ts exports useCounterValue, useIncrementCounter, useDecrementCounter
- [x] useTransactionStatus.ts exports useTransactionStatus
- [x] All hooks import from correct paths (stacks-api, contract-utils, wallet-provider)
- [x] Mutations use correct devnet vs testnet/mainnet branching
- [x] counterQueries.ts has 121 lines (min: 80)
- [x] useTransactionStatus.ts has 47 lines (min: 30)

## Next Phase Readiness

**Ready for Plan 04-03:** UI integration can now wire CounterDisplay to useCounterValue and buttons to mutation hooks.

**Dependencies satisfied:**
- useCounterValue provides counter data for display
- useIncrementCounter/useDecrementCounter provide transaction execution
- useTransactionStatus enables transaction tracking UI

**Note:** Counter contract (counter.clar) must be created by Plan 04-01 before hooks can fetch real data. COUNTER_CONTRACT constant was added as deviation to unblock this plan.
