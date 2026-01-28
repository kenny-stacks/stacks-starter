# Testing Patterns

**Analysis Date:** 2026-01-28

## Test Framework

**Runner:**
- Vitest 3.1.3 (frontend: not used; clarity: primary test runner)
- Config: `clarity/vitest.config.js`
- Environment: `vitest-environment-clarinet` - specialized environment for Clarity smart contract testing

**Assertion Library:**
- Vitest built-in assertions
- Custom Clarity matchers provided by `@hirosystems/clarinet-sdk` for Clarity value assertions
- Examples: `.toBeOk()`, `.toBeErr()`, `.toBeUint()`, etc.

**Run Commands:**
```bash
npm run test              # Run all tests once
npm run test:report       # Run tests with coverage and cost reports
npm run test:watch       # Watch mode - watches tests and Clarity contracts
```

**Frontend Testing:**
- No test files found in front-end package
- ESLint only for linting
- Manual testing or integration testing appears to be the approach

## Test File Organization

**Location:**
- Clarity tests: `clarity/tests/` directory
- Test files co-located with contract code (monorepo structure)
- Single test file: `clarity/tests/fundraising.test.ts`

**Naming:**
- Files use `.test.ts` suffix: `fundraising.test.ts`

**Structure:**
```
clarity/
├── contracts/
│   └── fundraising.clar
├── tests/
│   └── fundraising.test.ts
└── vitest.config.js
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;

describe("fundraising campaign", () => {
  const initCampaign = (goal: number) => {
    // helper function
  };

  it("initializes with a goal", () => {
    // test body
  });
});
```

**Patterns:**
- Module-level setup: Simnet initialization and account extraction at top of file
- Helper functions: `initCampaign()` defined inside describe block for campaign setup
- Flat test organization: All tests in single describe block
- No nested describe blocks or multiple suites

**Test Setup:**
- Simnet initialized once at module load: `const simnet = await initSimnet()`
- Accounts extracted globally: `const deployer = accounts.get("deployer")!`
- Helper functions created for repeated test setup patterns

**Helper Functions:**
```typescript
function getCurrentStxBalance(address: string) {
  const assetsMap = simnet.getAssetsMap();
  return assetsMap.get("STX")?.get(address) || BigInt(0);
}

const initCampaign = (goal: number) => {
  const response = simnet.callPublicFn(
    "fundraising",
    "initialize-campaign",
    [Cl.uint(goal), Cl.uint(0)],
    deployer,
  );
  const block = simnet.burnBlockHeight;
  return { response, block };
};
```

## Mocking

**Framework:** Not applicable - Vitest uses real Clarity simnet environment

**Patterns:**
- No mocking framework (Vitest-Mock, Sinon) observed
- Clarinet SDK provides simnet with real state management
- State is reset or manipulated through contract calls, not mocks
- Account addresses obtained from simnet accounts map

**What to Mock:**
- Not applicable in Clarity testing context

**What NOT to Mock:**
- Never mock Clarity contract functions - use simnet for real execution
- Never mock account state - use simnet state queries
- Never mock blockchain blocks - use `simnet.mineEmptyBlocks()` for time advancement

## Fixtures and Factories

**Test Data:**
```typescript
// Campaign initialization with specific goal
const initCampaign = (goal: number) => {
  const response = simnet.callPublicFn(
    "fundraising",
    "initialize-campaign",
    [Cl.uint(goal), Cl.uint(0)],
    deployer,
  );
  const block = simnet.burnBlockHeight;
  return { response, block };
};

// Example usage with different goals
it("initializes with a goal", () => {
  const { response } = initCampaign(100000);
  expect(response.result).toBeOk(Cl.bool(true));
});

// Donation amounts used consistently
const donationAmount = BigInt(5000000000); // 5000 STX in microstacks
```

**Location:**
- Helper functions defined in test file itself (no separate fixtures directory)
- Magic numbers documented inline: `BigInt(5000000000); // 5000 STX, in microstacks`
- Clarity value constructors: `Cl.uint()`, `Cl.bool()`, `Cl.principal()`, `Cl.tuple()` for test data

## Coverage

**Requirements:** Not enforced via npm scripts or CI/CD configuration

**View Coverage:**
```bash
npm run test:report       # Includes --coverage and --costs flags
```

**Report Format:**
- Coverage report output in test:report script
- Cost analysis also provided (Clarity contract execution costs)
- No specific coverage threshold enforced

## Test Types

**Unit Tests:**
- Scope: Individual public functions in Clarity contracts
- Approach: Test contract function behavior in isolation with various inputs
- Examples:
  - `initialize-campaign` with goal values
  - `donate-stx` with different amounts
  - `cancel-campaign` state transitions
- Verify both success cases (`.toBeOk()`) and error cases (`.toBeErr()`)

**Integration Tests:**
- Scope: Multi-step campaign workflows with state changes across calls
- Approach: Simulate real user flows through campaign lifecycle
- Examples:
  - Initialize campaign → donate → verify balance
  - Initialize campaign → donate → cancel → refund
  - Initialize campaign → donate → mine blocks → withdraw
- Use helper functions to reduce boilerplate for repeated flows

**E2E Tests:**
- Framework: Not used
- Frontend integration testing: Not implemented
- Manual testing against devnet/testnet is the current approach

## Common Patterns

**Async Testing:**
- Not applicable - Vitest Clarity environment handles async internally
- All simnet calls are synchronous in test code
- Block mining uses `simnet.mineEmptyBlocks(n)` for time progression

**Error Testing:**
```typescript
it("prevents non-owner from initializing campaign", () => {
  const response = simnet.callPublicFn(
    "fundraising",
    "initialize-campaign",
    [Cl.uint(100000), Cl.uint(0)],
    donor1,  // Not the owner
  );
  expect(response.result).toBeErr(Cl.uint(100)); // err-not-authorized
});

it("prevents donations after campaign ends", () => {
  initCampaign(100000);
  simnet.mineEmptyBlocks(4321);  // Advance past campaign duration
  const response = simnet.callPublicFn(
    "fundraising",
    "donate-stx",
    [Cl.uint(5000)],
    donor1,
  );
  expect(response.result).toBeErr(Cl.uint(101)); // err-campaign-ended
});
```

**State Verification:**
```typescript
it("accepts STX donations during campaign", () => {
  initCampaign(100000);
  const response = simnet.callPublicFn(
    "fundraising",
    "donate-stx",
    [Cl.uint(5000)],
    donor1,
  );
  expect(response.result).toBeOk(Cl.bool(true));

  // Verify donation was recorded via read-only function
  const getDonationResponse = simnet.callReadOnlyFn(
    "fundraising",
    "get-stx-donation",
    [Cl.principal(donor1)],
    donor1,
  );
  expect(getDonationResponse.result).toBeOk(Cl.uint(5000));
});

// Verify asset balances after operations
it("allows withdrawal when campaign ended", () => {
  const originalDeployerBalance = getCurrentStxBalance(deployer);
  const donationAmount = BigInt(5000000000);

  // ... perform operations ...

  expect(getCurrentStxBalance(deployer)).toEqual(
    originalDeployerBalance + donationAmount,
  );
});
```

**Clarity Value Construction:**
```typescript
// Primitives
Cl.uint(amount)
Cl.bool(true/false)
Cl.principal(address)

// Complex types
Cl.tuple({
  start: Cl.uint(block),
  end: Cl.uint(block + 4320),
  goal: Cl.uint(100000),
  totalStx: Cl.uint(0),
  totalSbtc: Cl.uint(0),
  donationCount: Cl.uint(0),
  isExpired: Cl.bool(false),
  isWithdrawn: Cl.bool(false),
  isCancelled: Cl.bool(false),
})
```

**Test Isolation:**
- Each test can call `initCampaign()` independently
- Simnet state management handles test isolation
- No explicit teardown needed between tests
- Block height advances are isolated to individual tests

---

*Testing analysis: 2026-01-28*
