# External Integrations

**Analysis Date:** 2026-01-28

## APIs & External Services

**Blockchain Query APIs:**
- Stacks Blockchain API - For querying blockchain state and contract data
  - SDK/Client: `@stacks/blockchain-api-client`
  - Base URLs:
    - Devnet (Platform): `https://api.platform.hiro.so/v1/ext/{NEXT_PUBLIC_PLATFORM_HIRO_API_KEY}/stacks-blockchain-api`
    - Devnet (Local): `http://localhost:3999`
    - Testnet: `https://api.testnet.hiro.so`
    - Mainnet: `https://api.mainnet.hiro.so`
  - API Key: `NEXT_PUBLIC_PLATFORM_HIRO_API_KEY` (for platform-hosted devnet)
  - Usage: `src/lib/stacks-api.ts` - Creates configuration and client instances
  - Uses multiple API endpoints:
    - SmartContractsApi - Call read-only functions, query contract state
    - BlocksApi - Query block height and chain tip
    - AccountsApi - Account information
    - TransactionsApi - Transaction queries
    - FaucetsApi - Devnet faucet functionality
    - Other APIs: InfoApi, MicroblocksApi, FeesApi, SearchApi, RosettaApi, FungibleTokensApi, NonFungibleTokensApi

**Price Data API:**
- CoinGecko API - For current cryptocurrency prices
  - Endpoint: `https://api.coingecko.com/api/v3/simple/price?ids=blockstack,bitcoin&vs_currencies=usd`
  - No authentication required
  - Usage: `src/lib/currency-utils.ts` - `getCurrentPrices()` function
  - Data: STX (blockstack) and sBTC (bitcoin) prices in USD
  - Cache: 30 minutes (via TanStack React Query staleTime)

## Data Storage

**Blockchain State:**
- Stacks Blockchain - Primary data store for fundraising campaign state
  - Contract Address: Environment-dependent via `NEXT_PUBLIC_CONTRACT_DEPLOYER_*_ADDRESS`
  - Contract Name: Configured in `src/constants/contracts.ts`
  - Contract Location: `clarity/contracts/fundraising.clar`
  - Smart Contract Dependencies:
    - `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token` - sBTC token contract
    - `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-deposit` - sBTC deposit contract

**Local Storage:**
- Browser localStorage - Used for wallet connection state via `@stacks/connect`
  - Accessed in: `src/components/HiroWalletProvider.tsx` via `getLocalStorage()`
  - Stores: STX address data after wallet connection

**Client-Side Caching:**
- TanStack React Query (v5) - In-memory query caching
  - Configuration: `src/components/ui/Providers.tsx`
  - Query keys: `currentBlock`, `campaignInfo`, `campaignDonations`, `current-stx-price`
  - Default refetch interval: 10 seconds for blockchain queries, 30 minutes for price data

**File Storage:**
- Not detected - No server-side file storage configured

## Authentication & Identity

**Wallet Authentication:**

**Hiro Wallet (Mainnet/Testnet):**
- Provider: Hiro Labs
- Implementation: `src/components/HiroWalletProvider.tsx`
- SDK: `@stacks/connect`
- Flow:
  - `connect()` - Opens Hiro Wallet extension for user approval
  - `isConnected()` - Checks connection status
  - `getLocalStorage()` - Retrieves stored address data
  - Supported Networks: Testnet (ST* prefix) and Mainnet (SP* prefix)

**Devnet Wallet (Development):**
- Implementation: `src/lib/devnet-wallet-context.ts` and `src/components/DevnetWalletProvider.tsx`
- Hardcoded Test Wallets: 6 development wallets with mnemonics
  - Deployer: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`
  - Wallet 1-5: Additional test accounts
- SDK: `@stacks/wallet-sdk`
- Flow:
  - `generateWallet()` - Creates wallet from mnemonic
  - Private key extraction for transaction signing
  - Direct transaction execution via `executeContractCall()`

**No Traditional OAuth/Session Auth** - Wallet-based authentication only

## Monitoring & Observability

**Error Tracking:**
- Not detected - No external error tracking service configured

**Logs:**
- Browser console logging only
  - Example: `src/hooks/useTransactionExecuter.tsx` uses `console.log()` and `console.error()`
  - Toast notifications via Chakra UI for user feedback

**Debugging:**
- Network environment selection via environment variables
- Environment-aware contract execution (devnet vs. testnet/mainnet)

## CI/CD & Deployment

**Hosting:**
- Not detected - Deployment target/hosting platform not configured

**CI Pipeline:**
- Not detected - No CI/CD configuration found

**Test Execution:**
- Local: `npm run test` in `clarity/` directory runs Vitest
- Watch mode: `npm run test:watch` with file watching
- Coverage: `npm run test:report` generates coverage and cost analysis

## Environment Configuration

**Required env vars for Frontend:**
```
NEXT_PUBLIC_STACKS_NETWORK=devnet|testnet|mainnet
NEXT_PUBLIC_DEVNET_HOST=platform|local
NEXT_PUBLIC_PLATFORM_HIRO_API_KEY=<api-key>
NEXT_PUBLIC_CONTRACT_DEPLOYER_TESTNET_ADDRESS=<contract-address>
NEXT_PUBLIC_CONTRACT_DEPLOYER_MAINNET_ADDRESS=<contract-address>
```

**Secrets Location:**
- Frontend: `.env.local` (gitignored)
- Devnet wallets: Hardcoded in `src/lib/devnet-wallet-context.ts` (development only)

**Network Selection Logic:**
- `src/lib/stacks-api.ts` - `getStacksUrl()` selects API endpoint based on `NEXT_PUBLIC_STACKS_NETWORK`
- `src/lib/contract-utils.ts` - `isDevnetEnvironment()`, `isTestnetEnvironment()`, `isMainnetEnvironment()` helper functions

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints configured

**Outgoing:**
- Transaction callbacks via `@stacks/connect`:
  - `onFinish` - Called when transaction broadcast succeeds
  - `onCancel` - Called when user cancels transaction signing
- Example usage: `src/lib/contract-utils.ts` - `openContractCall()`

**Contract Events:**
- Clarity contract emits events via `print` statements in `clarity/contracts/fundraising.clar`
- Events are queryable but not pushed via webhooks

## Smart Contract Interaction

**Contract Reading (Read-Only):**
- `useCampaignInfo()` - Calls `get-campaign-info` read-only function in fundraising contract
  - Returns: campaign start/end times, goal, total donations (STX/sBTC), expiration status
  - Location: `src/hooks/campaignQueries.ts`

- `useExistingDonation()` - Calls `get-stx-donation` and `get-sbtc-donation` for user donations
  - Location: `src/hooks/campaignQueries.ts`

- `useCurrentBtcBlock()` - Queries current burn block height
  - Location: `src/hooks/chainQueries.ts`

**Contract Writing (State Changes):**
- Via `executeContractCall()` for devnet (direct execution)
- Via `openContractCall()` or `request()` for testnet/mainnet (wallet approval required)
- Implementation: `src/lib/contract-utils.ts`
- Transaction signing: Private key for devnet, wallet extension for testnet/mainnet
- Post-conditions: Supported for safety verification

---

*Integration audit: 2026-01-28*
