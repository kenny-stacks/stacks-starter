# Codebase Concerns

**Analysis Date:** 2026-01-28

## Tech Debt

**Incomplete sBTC Testing:**
- Issue: sBTC donation functionality is not fully tested; tests are commented out with TODO marker
- Files: `clarity/tests/fundraising.test.ts` (lines 55-86)
- Impact: sBTC donations cannot be verified to work properly; no test coverage means regressions could occur undetected
- Fix approach: Remove blocker preventing simnet sBTC funding, implement full test suite for sBTC donation flows including minting, donating, and refunding

**Type Safety with `any` Casting:**
- Issue: Type safety bypassed with explicit `any` casts in transaction parameter conversion
- Files: `front-end/src/hooks/useTransactionExecuter.tsx` (lines 44-45), `front-end/src/lib/contract-utils.ts` (lines 70-71)
- Impact: Potential runtime errors from type mismatches not caught at compile time; makes refactoring risky
- Fix approach: Create properly typed interfaces for transaction parameters rather than using `any`; add type guards to validate network object structure

**Hardcoded Devnet Wallet Mnemonic:**
- Issue: Devnet wallet mnemonic is hardcoded in source code
- Files: `front-end/src/lib/devnet-wallet-context.ts` (line 27)
- Impact: Security risk if private keys are ever derived from this seed; not suitable for production; bad practice even for development
- Fix approach: Move to environment variable or secure configuration; document devnet-only usage clearly; never use pattern in production code

## Known Bugs

**Block Time Calculation Inaccuracy:**
- Symptoms: Remaining time display shows inaccurate countdown using hardcoded 10-minute block assumption
- Files: `front-end/src/components/CampaignDetails.tsx` (lines 97-98)
- Trigger: Any campaign with remaining blocks; time estimate will drift from actual countdown
- Workaround: Display block numbers only, not time estimates; or fetch actual block times from network
- Impact: User confusion about actual campaign deadline; could lead to missed donations

**Loose Error Message Matching:**
- Symptoms: Transaction cancellations not properly detected; user sees generic error instead of friendly cancellation message
- Files: `front-end/src/hooks/useTransactionExecuter.tsx` (line 73), `front-end/src/lib/contract-utils.ts` (line 97)
- Trigger: User cancels wallet transaction prompt
- Cause: String matching on `error.message?.includes('cancelled')` is fragile and not standardized across wallet implementations
- Fix approach: Use error codes or wallet-standard cancellation error types instead of string matching

## Security Considerations

**Unvalidated Network Configuration:**
- Risk: Network type casting from generic `options.network` parameter without proper type checking could accept invalid network values
- Files: `front-end/src/lib/contract-utils.ts` (lines 75-82), `front-end/src/hooks/useTransactionExecuter.tsx` (lines 49-53)
- Current mitigation: Conditional checks for `chainId === 1`, but fragile and incomplete
- Recommendations: Create strict TypeScript type for network parameter; validate against whitelist of allowed networks (devnet, testnet, mainnet); throw on unknown values

**Unvalidated Price Data:**
- Risk: Price data from external API (CoinGecko) not validated before use in calculations
- Files: `front-end/src/lib/currency-utils.ts` (lines 90-95)
- Current mitigation: None; assumes API returns expected structure
- Recommendations: Add schema validation for price response; default to safe fallback values; add error boundaries around price-dependent calculations

**XSS Risk in Markdown Content:**
- Risk: Campaign markdown content rendered without sanitization
- Files: `front-end/src/components/CampaignDetails.tsx` (line 370), `front-end/src/components/StyledMarkdown.tsx`
- Current mitigation: react-markdown used (which has some built-in safety), but no explicit sanitizer configured
- Recommendations: Configure react-markdown with `sanitizeUrl` handler; use DOMPurify library; validate all markdown input server-side before storing

**Contract Address Fallback to Empty String:**
- Risk: Missing contract addresses silently fallback to empty string rather than failing fast
- Files: `front-end/src/lib/campaign-utils.ts` (lines 26, 45, 52, 69, 85, 101, 117), `front-end/src/hooks/campaignQueries.ts` (lines 29, 93, 103)
- Current mitigation: None; relies on contract calls failing downstream
- Recommendations: Validate contract addresses at initialization; throw on missing config; add explicit error messages for misconfiguration

## Performance Bottlenecks

**Frequent Refetch of Static Campaign Info:**
- Problem: Campaign info refetched every 10 seconds regardless of whether campaign has ended
- Files: `front-end/src/hooks/campaignQueries.ts` (line 72)
- Cause: Fixed `refetchInterval: 10000` with no logic to stop polling after campaign expires
- Improvement path: Disable refetch when campaign status is expired/cancelled; use exponential backoff during active campaign

**Multiple API Calls for Single Data Point:**
- Problem: Existing donation requires two separate blockchain calls (STX and sBTC) that could be combined
- Files: `front-end/src/hooks/campaignQueries.ts` (lines 92-110)
- Cause: Separate smart contract functions for STX vs sBTC donations
- Improvement path: Consider contract optimization to return both values in single call; add caching layer; batch requests

**Price API Called on Every Page Load:**
- Problem: CoinGecko price API called without caching when prices are stale, causes waterfall requests
- Files: `front-end/src/lib/currency-utils.ts` (lines 90-104)
- Cause: `staleTime: 30 * 60 * 1000` means price refreshes every 30 minutes, but initial load always fetches fresh
- Improvement path: Implement persistent cache layer (IndexedDB/sessionStorage); preload prices during app initialization

## Fragile Areas

**Campaign Admin Controls Permissions:**
- Files: `front-end/src/components/CampaignDetails.tsx` (lines 181-187)
- Why fragile: Admin controls shown if `currentWalletAddress === FUNDRAISING_CONTRACT.address`, meaning admin features depend entirely on wallet address comparison with a hardcoded contract address
- Safe modification: Verify address comparison is case-insensitive; add explicit type guards; consider blockchain-based permission checks instead
- Test coverage: No tests for admin authorization logic; missing test cases for scenarios where admin address changes

**Donation Amount Conversion Chain:**
- Files: `front-end/src/components/DonationModal.tsx` (lines 112-124)
- Why fragile: Multiple conversions in sequence (USD → currency units → sats/microstacks) with no validation at intermediate steps
- Safe modification: Add validation after each conversion step; use decimal.js or BigNumber for precision; log intermediate values during testing
- Test coverage: No unit tests for conversion logic; only integration tests at component level

**Devnet Wallet Context with No Persistence:**
- Files: `front-end/src/lib/devnet-wallet-context.ts` (lines 1-70)
- Why fragile: Wallet state stored in memory only; selecting different wallet requires click, no automatic recovery; current wallet could be null unexpectedly
- Safe modification: Add null checks at all wallet access points; persist selected wallet to localStorage; add loading states during wallet initialization
- Test coverage: No tests for wallet selection logic or error states

**Error String Matching for UX:**
- Files: `front-end/src/hooks/useTransactionExecuter.tsx` (line 73), `front-end/src/lib/contract-utils.ts` (line 97)
- Why fragile: String matching on error messages (`error.message?.includes('cancelled')`) varies across wallet implementations
- Safe modification: Implement wallet-specific error handling; use error codes/types instead of messages; test with multiple wallets
- Test coverage: No tests for different wallet cancellation scenarios

## Scaling Limits

**Hardcoded Block Time Assumption:**
- Current capacity: Assumes 10-minute blocks universally (line 97 in CampaignDetails.tsx)
- Limit: Block time varies by network; assumption breaks on networks with different block intervals
- Scaling path: Fetch actual block time from network; calculate time estimates dynamically; add block time to campaign info smart contract

**Price Data Single Source:**
- Current capacity: CoinGecko API is single source of truth for STX and BTC prices
- Limit: API rate limits, service outages, or data staleness affect entire app
- Scaling path: Add fallback price providers; implement local price cache; add circuit breaker pattern

## Dependencies at Risk

**External Price API Dependency:**
- Risk: Hard dependency on CoinGecko API with no fallback; app shows broken USD conversions if API is down
- Impact: Users cannot see donation values in USD; reduced ability to make informed donation decisions
- Migration plan: Implement fallback price sources; cache prices aggressively; show prices in crypto-only mode when API unavailable

**Stacks Connect Library Type Safety:**
- Risk: Type casting required to use wallet library; limited type definitions force use of `any`
- Impact: Developer errors from incorrect parameter structures; difficult to maintain compatibility with wallet updates
- Migration plan: Create wrapper types for wallet operations; consider protocol-level fixes with library maintainers

## Missing Critical Features

**No Input Validation on Donation Amounts:**
- Problem: Donation amount validation only checks if greater than zero; no maximum amount check, no precision validation
- Files: `front-end/src/components/DonationModal.tsx` (lines 98-107)
- Blocks: Users could enter extremely large amounts leading to failed transactions; floating-point precision issues with currency conversions

**No Network Switching UI:**
- Problem: Network (devnet/testnet/mainnet) is environment-only configuration; no UI to switch networks after deployment
- Files: Network selected at build time via `NEXT_PUBLIC_STACKS_NETWORK`
- Blocks: Cannot test on different networks with same deployment; requires rebuild for each network

**No Transaction History/Status Tracking:**
- Problem: Users see success/error toast but no persistent record of their transactions
- Files: No transaction history component or storage
- Blocks: Users cannot verify past donations; no audit trail for troubleshooting; poor UX for repeated users

## Test Coverage Gaps

**No Unit Tests for Utility Functions:**
- What's not tested: Currency conversion functions, address validation, contract parameter building
- Files: `front-end/src/lib/currency-utils.ts`, `front-end/src/lib/address-utils.ts`, `front-end/src/lib/campaign-utils.ts`
- Risk: Conversion errors, edge cases (zero amounts, very large numbers, NaN results) could occur unnoticed in production
- Priority: High - financial calculations must be reliable

**No Tests for React Components:**
- What's not tested: All React components (CampaignDetails, DonationModal, AdminControls, Navbar, etc.)
- Files: `front-end/src/components/**/*.tsx`
- Risk: UI bugs, accessibility issues, incorrect error state rendering go undetected
- Priority: High - user-facing features need coverage

**No Error State Testing:**
- What's not tested: Component behavior when blockchain queries fail, wallet not connected, network errors
- Files: `front-end/src/hooks/campaignQueries.ts`, `front-end/src/hooks/chainQueries.ts`
- Risk: Poor error handling leads to confusing user experience; could display wrong error messages or crash
- Priority: High - error paths are critical for reliability

**No Integration Tests for Multi-Step Flows:**
- What's not tested: Full donation flow (wallet connect → select amount → confirm → wait for tx), refund flow, admin operations
- Risk: Issues only surface after user interaction; could lose donations or fail withdrawals
- Priority: Critical - core business logic

**No E2E Tests:**
- What's not tested: Real wallet integration, devnet/testnet deployment, user journeys
- Risk: Cannot verify features work in real environment; contract integration issues missed
- Priority: High - before production deployment

---

*Concerns audit: 2026-01-28*
