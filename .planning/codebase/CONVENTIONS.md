# Coding Conventions

**Analysis Date:** 2026-01-28

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `ConnectWallet.tsx`, `DonationModal.tsx`, `Navbar.tsx`)
- Utilities and helpers: camelCase with `.ts` extension (e.g., `campaign-utils.ts`, `currency-utils.ts`, `contract-utils.ts`)
- Hooks: camelCase prefixed with `use` (e.g., `useTransactionExecuter.tsx`, `campaignQueries.ts`)
- Constants: camelCase in dedicated files under `/constants` (e.g., `contracts.ts`, `devnet.ts`)

**Functions:**
- camelCase naming convention used throughout
- Examples: `formatStxAddress()`, `getCurrentPrices()`, `executeContractCall()`, `useCampaignInfo()`
- Exported functions use consistent naming: `getContributeStxTx()`, `getContributeSbtcTx()`, `getInitializeTx()`
- React hooks return objects/data with consistent naming: query functions return `UseQueryResult<T>`

**Variables:**
- camelCase for local variables and state: `isWalletConnected`, `currentWalletAddress`, `isLoading`
- Boolean variables prefix with `is`: `isDevnetEnvironment`, `isCancelled`, `isExpired`
- Constants use UPPER_SNAKE_CASE or camelCase depending on scope
- Context state variables follow object property naming: `testnetAddress`, `mainnetAddress`, `isWalletOpen`

**Types:**
- PascalCase for interface names: `CampaignInfo`, `CampaignDonation`, `HiroWallet`, `DevnetWallet`, `DevnetWalletContextType`, `ConnectWalletButtonProps`
- PascalCase for type aliases: `Network`, `PriceData`
- Interface properties use camelCase: `stxAmount`, `sbtcAmount`, `usdValue`, `donationCount`

## Code Style

**Formatting:**
- No explicit formatter configured (ESLint only, no Prettier detected)
- TypeScript strict mode enabled via `tsconfig.json`: `"strict": true`
- Unused variables are flagged via TypeScript config: `"noUnusedLocals": true`, `"noUnusedParameters": true`
- Imports organized by type: external packages first, then internal imports using `@/` alias

**Linting:**
- ESLint configured for Next.js via `eslint-config-next`
- ESLint version 9+ with `@eslint/eslintrc`
- Some ESLint rules disabled explicitly with comments where needed:
  - `// eslint-disable-next-line @typescript-eslint/no-explicit-any` used when passing `any` types (see `useTransactionExecuter.tsx:44-45`, `contract-utils.ts:70-71`)

## Import Organization

**Order:**
1. React and framework imports (React, Next, etc.)
2. External library imports (Chakra UI, TanStack Query, Stacks packages)
3. Internal component imports using `@/` alias
4. Internal utility/hook imports using `@/` alias
5. Type imports where applicable

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `front-end/tsconfig.json`)
- Used consistently in all files for cleaner relative paths
- Examples: `@/components/ConnectWallet`, `@/lib/campaign-utils`, `@/constants/contracts`

**Examples from codebase:**
```typescript
// ConnectWallet.tsx - external first, then internal
import { Box, Button, Flex, Menu, ... } from "@chakra-ui/react";
import { useContext } from "react";
import HiroWalletContext from "./HiroWalletProvider";
import { formatStxAddress } from "@/lib/address-utils";

// campaignQueries.ts - query libraries, then internal APIs and utils
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { getApi, getStacksUrl } from "@/lib/stacks-api";
import { FUNDRAISING_CONTRACT } from "@/constants/contracts";
```

## Error Handling

**Patterns:**
- Try-catch blocks used for async operations
- Error messages logged to console for debugging: `console.error('Connection failed:', error)`
- User-facing errors displayed via toast notifications (Chakra UI)
- Promise assertions in Clarity contract tests: `expect(...).toBeOk(...)`, `expect(...).toBeErr(...)`
- Contract validation errors return error codes as unsigned integers (e.g., `err u100`, `err u101`)

**Examples:**
```typescript
// In HiroWalletProvider.tsx
try {
  setIsWalletOpen(true);
  await connect();
  setIsWalletOpen(false);
  setIsWalletConnected(isConnected());
} catch (error) {
  console.error('Connection failed:', error);
  setIsWalletOpen(false);
}

// In contract-utils.ts
if ("error" in response) {
  console.error(response.error);
  throw new Error(response.error || "Transaction failed");
}

// In Clarity contract
(asserts! (is-eq tx-sender contract-owner) err-not-authorized)
(asserts! (not (var-get is-campaign-initialized)) err-already-initialized)
```

## Logging

**Framework:** `console` object (no dedicated logging library)

**Patterns:**
- `console.error()` for error conditions: `console.error('Connection failed:', error)`
- `console.log()` for temporary debugging (appears in `useTransactionExecuter.tsx:59`): `console.log('params', params)`
- Logging used primarily in error paths and transaction execution hooks
- No structured logging or log levels (info, warn, debug) implemented

**When to log:**
- Error handlers in async operations (wallet connection, contract calls)
- Transaction parameter debugging (temporary - may be removed before production)
- No logging for normal control flow

## Comments

**When to Comment:**
- JSDoc comments used for utility functions explaining parameters and return values
- Example from `address-utils.ts`:
  ```typescript
  /**
   * Formats a Stacks address for display by showing the first 6 and last 4 characters
   * @param address - The full STX address to format
   * @param chars - Optional parameter to specify how many characters to show
   * @returns Formatted address string
   */
  ```

**JSDoc/TSDoc:**
- Used for public utility functions
- Includes `@param` for parameters with type info
- Includes `@returns` for return values
- Used in `currency-utils.ts` for conversion functions and hooks
- Minimal in component files (component responsibility is often clear from props interface)

**Inline comments:**
- Rare; code is generally self-documenting
- One TODO found: `clarity/tests/fundraising.test.ts:55` - "TODO: write sBTC tests when there is a way to fund simnet wallets with sBTC"

## Function Design

**Size:**
- Small, focused functions preferred
- Utility functions typically 5-20 lines (e.g., `formatStxAddress()`, currency conversion functions)
- Hooks range from 20-50 lines for simple hooks to 60+ lines for complex query hooks
- React components typically 40-150 lines including JSX

**Parameters:**
- Interfaces used to group related parameters: `ContributeParams` interface with `address` and `amount`
- Transaction functions follow pattern: `(network, params)` or `(network, address, value)`
- Optional parameters use TypeScript optional syntax: `chars = { start: 6, end: 4 }`
- Props passed as typed interfaces: `ConnectWalletButtonProps extends ButtonProps`

**Return Values:**
- Utility functions return typed values: `UseQueryResult<CampaignInfo>`, `Promise<DirectCallResponse>`
- React hooks return query result objects with data/loading/error properties
- Transaction builder functions return fully configured `ContractCallRegularOptions` objects
- Error handlers either throw or return error object structures

## Module Design

**Exports:**
- Named exports used consistently (no default exports except for Next.js page components)
- Example: `export const ConnectWalletButton = (buttonProps: ...) => { ... }`
- Hook exports prefixed with `use`: `export const useCampaignInfo = (...) => { ... }`
- Context providers exported as default in provider files (convention for Next.js patterns)

**Barrel Files:**
- No explicit barrel files (index.ts exports) observed in codebase
- Direct imports from source files using path aliases preferred

**Module Organization:**
- `/lib` contains utility functions and helpers
- `/hooks` contains React hooks and custom query hooks
- `/components` contains React components (UI and containers)
- `/constants` contains configuration and contract references
- `/tests` contains Vitest test files (Clarity contract tests)

---

*Convention analysis: 2026-01-28*
