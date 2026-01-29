# Architecture Patterns

This document explains the recurring patterns in this starter kit. Understand these and you can build any Stacks dApp.

## Wallet Integration Pattern

**Context:** Stacks dApps need wallet connection for transaction signing.

**The Pattern:**

- **Devnet:** WalletProvider auto-connects with pre-funded test wallets (no browser extension needed)
- **Testnet/Mainnet:** Leather wallet extension handles connection and signing

**Implementation:** [front-end/src/components/providers/wallet-provider.tsx](../front-end/src/components/providers/wallet-provider.tsx)

**Network Detection:**

- `NEXT_PUBLIC_NETWORK` environment variable controls network (defaults to `devnet`)
- Devnet shows wallet selector dropdown with pre-funded wallets
- Testnet/Mainnet shows Leather connect button

**Implementation:** [front-end/src/components/wallet/connect-button.tsx](../front-end/src/components/wallet/connect-button.tsx)

**When to use which:**

| Network | Use case | Wallet behavior |
|---------|----------|-----------------|
| Devnet | Fast iteration during development | Auto-sign with test wallets |
| Testnet | Test with real wallet extension before mainnet | Leather prompts for signature |
| Mainnet | Production | Leather prompts for signature |

## Contract Read Pattern (Queries)

**Context:** Reading contract state without signing transactions.

**The Pattern:**

- Use React Query's `useQuery` for read-only contract calls
- `cvToJSON` and `hexToCV` convert Clarity values to JavaScript
- Automatic refetching, caching, and error handling built in

**Implementation:** [front-end/src/hooks/counterQueries.ts](../front-end/src/hooks/counterQueries.ts) - see `useCounterValue`

**Key concepts:**

- `callReadOnlyFunction` from Stacks API client
- Contract address and name from constants file
- Sender principal (doesn't need to be connected wallet for reads)
- Query key enables cache invalidation after writes

**Why use React Query for reads:**

- Automatic caching prevents redundant API calls
- Built-in loading and error states
- `refetchInterval` enables polling for fresh data
- `retry` handles transient network failures

## Contract Write Pattern (Mutations)

**Context:** Executing contract functions that change state.

**The Pattern:**

- Use React Query's `useMutation` for state-changing calls
- Devnet: `executeContractCall` signs directly with test wallet keys
- Testnet/Mainnet: `openContractCall` prompts Leather to sign
- Invalidate queries after successful mutation to refetch updated state

**Implementation:** [front-end/src/hooks/counterQueries.ts](../front-end/src/hooks/counterQueries.ts) - see `useIncrementCounter` and `useDecrementCounter`

**Key concepts:**

- Transaction options: `contractAddress`, `contractName`, `functionName`, `functionArgs`
- `PostConditionMode` controls asset transfer restrictions
- `queryClient.invalidateQueries` triggers refetch after mutation succeeds
- Toast notifications provide user feedback

**Why the dual code path:**

- Devnet skips wallet extension popup for faster iteration
- Same mutation hook works on all networks via `isDevnet` check

## React Query Integration

**Context:** Managing async state (loading, error, data) for contract interactions.

**The Pattern:**

- `QueryClientProvider` wraps app at root
- `useQuery` for reads (GET-like operations)
- `useMutation` for writes (POST-like operations)
- `queryClient.invalidateQueries` refetches after mutations

**Implementation:** [front-end/src/components/providers/app-providers.tsx](../front-end/src/components/providers/app-providers.tsx) for QueryClient setup

**Why React Query:**

| Feature | Benefit |
|---------|---------|
| Automatic caching | Reduces redundant API calls |
| Loading/error states | Built-in, no manual tracking |
| Cache invalidation | Fresh data after mutations |
| Stale-while-revalidate | Show cached data while refetching |
| Retry logic | Handle transient failures |

## Transaction Status Pattern

**Context:** Users need feedback while transactions are pending on the blockchain.

**The Pattern:**

- Track `pendingTxId` in component state after mutation succeeds
- Show pending UI (spinner, disabled buttons) while transaction confirms
- Clear pending state when transaction is confirmed or failed
- React Query handles refetch timing via cache invalidation

**Implementation:** [front-end/src/components/counter-display.tsx](../front-end/src/components/counter-display.tsx) - see pending state handling

**Why separate pending state:**

- Mutation `isPending` is true only during the initial call
- Transaction confirmation takes additional time (blocks must be mined)
- `pendingTxId` tracks the full lifecycle: submission -> confirmation

**User feedback flow:**

1. User clicks button -> mutation fires -> `isPending` true
2. Mutation completes -> `isPending` false, `pendingTxId` set
3. Transaction confirms -> query refetches -> `pendingTxId` cleared
4. UI shows updated value

## Contract Configuration Pattern

**Context:** Contract addresses differ between networks.

**The Pattern:**

- Contract name is constant (e.g., `counter`)
- Deployer address varies by network
- Devnet uses first wallet from `devnetWallets` array
- Testnet/Mainnet uses environment variables

**Implementation:** [front-end/src/constants/contracts.ts](../front-end/src/constants/contracts.ts)

**Why this pattern:**

- Same contract name across networks
- Only deployer address changes
- Environment variables for non-devnet addresses
- Type-safe contract reference object
