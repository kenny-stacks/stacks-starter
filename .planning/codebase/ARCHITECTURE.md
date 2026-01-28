# Architecture

**Analysis Date:** 2026-01-28

## Pattern Overview

**Overall:** Layered Monolithic with Blockchain Integration

**Key Characteristics:**
- Client-side Next.js application with server-side rendering for initial page load
- Separated frontend (React/Next.js) and smart contract (Clarity) layers
- Query-based data fetching from Stacks blockchain via REST API
- Multi-network support (devnet, testnet, mainnet) abstracted through environment configuration
- Wallet integration with multi-network strategy (devnet native, testnet/mainnet Hiro extension)

## Layers

**Presentation Layer:**
- Purpose: Render UI components and handle user interactions
- Location: `front-end/src/components/`, `front-end/src/app/`
- Contains: React components using Chakra UI, page templates
- Depends on: Hooks layer (for data), utilities (contract/currency), providers (wallet/query)
- Used by: End users via Next.js routes

**Hooks & Data Fetching Layer:**
- Purpose: Encapsulate data queries and server-side calls using React Query
- Location: `front-end/src/hooks/`
- Contains: Custom hooks using `@tanstack/react-query` for campaign data and chain queries
- Depends on: Stacks API client, contract utilities
- Used by: Presentation components for reactive data updates

**Contract Interaction Layer:**
- Purpose: Build and execute transactions against Stacks smart contracts
- Location: `front-end/src/lib/contract-utils.ts`, `front-end/src/lib/campaign-utils.ts`
- Contains: Transaction builders, contract call executors, network detection
- Depends on: Stacks transactions library, wallet providers, network configuration
- Used by: Hooks and components for contract interactions

**Utilities Layer:**
- Purpose: Provide shared logic for currency conversion, address handling, API clients
- Location: `front-end/src/lib/`
- Contains: Helper functions and configuration (currency, addresses, Clarity parsing, Stacks API setup)
- Depends on: Stacks libraries, external APIs (CoinGecko)
- Used by: Contract layer, hooks, presentation components

**Provider & Context Layer:**
- Purpose: Manage global state for wallets, theme, and query client
- Location: `front-end/src/components/ui/Providers.tsx`, `front-end/src/components/HiroWalletProvider.tsx`, `front-end/src/components/DevnetWalletProvider.tsx`, `front-end/src/lib/devnet-wallet-context.ts`
- Contains: React Context providers for wallet management, Chakra theme, React Query client
- Depends on: Chakra UI, React Query, Stacks Connect
- Used by: Root layout and all child components

**Smart Contract Layer:**
- Purpose: Define campaign logic on Stacks blockchain
- Location: `clarity/contracts/fundraising.clar`
- Contains: Clarity smart contract with donation, refund, and withdrawal logic
- Depends on: sBTC token contract for transfers
- Used by: Frontend contract interaction layer

**Configuration Layer:**
- Purpose: Centralize environment-specific configuration
- Location: `front-end/src/constants/`
- Contains: Network-dependent URLs, contract addresses, campaign details
- Depends on: Environment variables
- Used by: Contract, API, and utility layers

## Data Flow

**Campaign Initialization Flow:**
1. Admin connects wallet via Navbar
2. Clicks "Initialize Campaign" in CampaignAdminControls
3. `getInitializeTx()` builds transaction with goal and duration
4. Transaction executor (devnet: direct call, testnet/mainnet: browser extension prompt)
5. Stacks network broadcasts transaction
6. Contract state updated: campaign-start, campaign-goal, campaign-duration

**Donation Flow:**
1. User opens DonationModal via "Contribute Now" button
2. Selects payment method (STX or sBTC) and amount in USD
3. Currency conversion: USD → STX/sBTC amount via CoinGecko prices
4. `getContributeStxTx()` or `getContributeSbtcTx()` builds transaction
5. Transaction executor routes to:
   - **Devnet:** Wallet SDK generates tx, broadcasts to local network
   - **Testnet/Mainnet:** Prompts browser wallet extension with stx_callContract
6. Contract records donation in stx-donations or sbtc-donations map
7. Campaign totals updated (total-stx, total-sbtc, donation-count)
8. Frontend refetches campaign info every 10 seconds via `useCampaignInfo`

**Campaign Display Flow:**
1. Home page async server component calls `getData()`
2. Reads markdown from `public/campaign-details.md` and images from `public/campaign/`
3. Passes to CampaignDetails component (client-side)
4. `useCampaignInfo` and `useCurrentBtcBlock` hooks poll blockchain state
5. `useCurrentPrices` fetches STX/sBTC prices from CoinGecko
6. Component calculates campaign status (expired, cancelled, goal progress)
7. Renders carousel, stats, progress bar, donation button

**State Management:**
- **Wallet State:** React Context via DevnetWalletProvider (devnet) / HiroWalletProvider (testnet/mainnet)
- **Query State:** React Query manages campaign data, block height, prices with 10-second refetch intervals
- **Component State:** Local useState for UI state (modal open/close, donation amount, carousel index)
- **Server State:** Smart contract state (campaign-info, donations) fetched via read-only contract calls

## Key Abstractions

**Contract Call Pattern:**
- Purpose: Unified approach to signing and broadcasting transactions across networks
- Examples: `executeContractCall()` (devnet), `openContractCall()` (testnet/mainnet), `useTransactionExecuter()` (hook)
- Pattern: Build tx options with `campaign-utils.ts` builders → executor routes to network → callback on finish

**Wallet Abstraction:**
- Purpose: Hide network-specific wallet implementations
- Examples: `DevnetWallet`, Hiro extension context, address resolution in `CampaignDetails`
- Pattern: Environment detection via `isDevnetEnvironment()` → routes to correct wallet provider/storage

**Price Conversion Pipeline:**
- Purpose: Convert user input (USD) → on-chain amounts (ustx, sats)
- Examples: `usdToStx()` → `stxToUstx()`, `usdToSbtc()` → `btcToSats()`
- Pattern: Single source of truth for prices from CoinGecko, conversion functions used consistently

**Network Detection:**
- Purpose: Route logic based on NEXT_PUBLIC_STACKS_NETWORK environment variable
- Examples: `isDevnetEnvironment()`, `getStacksNetworkString()`, contract address selection
- Pattern: Conditional logic in contract constants, transaction builders, and executors

## Entry Points

**Server Entry:**
- Location: `front-end/src/app/page.tsx`
- Triggers: HTTP request to `/`
- Responsibilities: Async server component; reads campaign markdown and images from file system; passes to CampaignDetails

**Client Entry:**
- Location: `front-end/src/app/layout.tsx`
- Triggers: Page load
- Responsibilities: Root layout wraps app in Providers (theme, React Query, wallet contexts); renders Navbar and children

**Blockchain Queries:**
- Location: `front-end/src/hooks/campaignQueries.ts`, `front-end/src/hooks/chainQueries.ts`
- Triggers: Component mount or query key changes
- Responsibilities: Use React Query to call Stacks blockchain API for campaign state and block height

**Smart Contract (No direct entry, triggered by frontend):**
- Location: `clarity/contracts/fundraising.clar`
- Triggers: Transaction execution via Stacks network
- Responsibilities: Execute public functions (initialize-campaign, donate-stx, donate-sbtc, withdraw, refund, cancel-campaign)

## Error Handling

**Strategy:** Multi-layer error capturing with user-facing feedback via toast notifications

**Patterns:**
- **Contract Calls:** Try/catch in `useTransactionExecuter`, `executeTx` with error toast showing generic message
- **Blockchain Queries:** React Query retry: false; error state passed to component which shows Alert with fallback UI
- **Currency Conversions:** Input validation before conversion; stxToUstx throws on NaN
- **Wallet Operations:** Network errors during wallet selection handled silently; transaction cancellation detected via error message matching
- **Post-Conditions:** Stacks transaction builder enforces post-conditions; violations cause transaction rejection before submission

## Cross-Cutting Concerns

**Logging:** console.log/error used for debugging; no structured logging framework

**Validation:**
- Donation amount validation: > 0 and parseable as number
- Address validation: relies on Stacks library; devnet addresses hardcoded
- Contract calls: post-conditions validate amounts in transaction headers

**Authentication:**
- Devnet: No auth; mnemonics stored in plaintext in client (development only)
- Testnet/Mainnet: Browser wallet extension handles key management; frontend only sees public address
- Admin functions: Contract checks `tx-sender === contract-owner` for initialize/cancel/withdraw

**Network Abstraction:**
- Three network modes configured via NEXT_PUBLIC_STACKS_NETWORK env var
- API endpoints, network objects, contract addresses switched per network
- Transaction execution paths diverge: devnet uses Stacks SDK directly; testnet/mainnet delegate to browser extension

---

*Architecture analysis: 2026-01-28*
