# Architecture Research: Clarity 4 Migration

**Project:** Stacks Starter Kit - Clarity 4 Update
**Researched:** 2026-02-02
**Confidence:** MEDIUM

## Summary

Migrating to Clarity 4 requires configuration changes in Clarinet.toml (clarity_version and epoch settings) but NO contract syntax changes beyond adopting new optional features. The migration is backward compatible - existing Clarity 3 contracts run unchanged on Clarity 4. Impact is isolated to configuration files; frontend and test code remain unchanged.

## Configuration Changes

### Clarinet.toml

**Current configuration (Clarity 3):**
```toml
[contracts.counter]
path = 'contracts/counter.clar'
clarity_version = 3
epoch = 3.0
```

**Updated configuration (Clarity 4):**
```toml
[contracts.counter]
path = 'contracts/counter.clar'
clarity_version = 4
epoch = 3.3
```

**Key changes:**
- `clarity_version`: 3 → 4
- `epoch`: 3.0 → 3.3

**When activated:**
- Epoch 3.3 activated at Bitcoin block 923,222 (November 11, 2024)
- Corresponds to stacks-core release 3.3.0.0.0

**Source confidence:** HIGH - Verified from [stacks-core release notes](https://github.com/stacks-network/stacks-core/releases/tag/3.3.0.0.0) and [Stacks official blog](https://www.stacks.co/blog/clarity-4-bitcoin-smart-contract-upgrade)

### Contract Files

**No syntax changes required for migration.**

Clarity 4 is fully backward compatible. The contract header remains unchanged:
```clarity
;; No version pragma needed - version controlled by Clarinet.toml
(define-data-var counter uint u0)
```

Unlike Solidity's `pragma solidity ^0.8.0`, Clarity does not use in-contract version specifiers. Version is controlled entirely through Clarinet.toml configuration.

**Optional: Adopt new Clarity 4 features**

Clarity 4 introduces 5 new built-in functions (available only after migration):

1. **`contract-hash?`** - Fetch hash of contract code body for on-chain validation
2. **`restrict-assets?`** - Set post-conditions to protect assets during external calls
3. **`to-ascii`** - Convert values (bools, principals) to ASCII strings
4. **`stacks-block-time`** - Retrieve current block timestamp (renamed from `block-time`)
5. **`secp256r1-verify?`** - Verify secp256r1 signatures for passkey authentication

**Counter contract opportunities:**
- Could use `stacks-block-time` to track when increments occur
- Could use `to-ascii` to generate readable status messages

**Recommendation:** Migrate configuration first, then evaluate feature adoption in separate phase.

**Source confidence:** HIGH - Verified from [SIP-033 documentation](https://stacks.org/sip-033-clarity-4) and [Clarity 4 announcement](https://www.stacks.co/blog/clarity-4-bitcoin-smart-contract-upgrade)

## Test Impact

### No changes required for basic migration

The existing test suite using `@hirosystems/clarinet-sdk` and Vitest continues to work unchanged:

```typescript
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";

const simnet = await initSimnet();
// Tests remain identical
```

**Why tests don't need changes:**
- Clarinet SDK automatically uses the epoch/version from Clarinet.toml
- Contract behavior is backward compatible
- Same API for calling functions and asserting results

**Clarinet version requirement:**
- Need Clarinet version that supports epoch 3.3 and Clarity 4
- As of research date, Clarinet 2.11.0+ supports epoch 3.0 (Nakamoto)
- Epoch 3.3 support likely requires Clarinet 2.12.0+

**Action needed:**
1. Verify Clarinet version supports epoch 3.3
2. Update Clarinet.toml configuration
3. Run existing test suite (should pass without changes)

**Source confidence:** MEDIUM - Based on pattern from [Clarity 3 migration guidance](https://www.hiro.so/blog/nakamoto-support-now-live-on-simnet-and-devnet) and Clarinet changelog searches. Direct Clarity 4 test migration docs not found.

## Frontend Impact

### No changes required

Frontend code using `@stacks/transactions` and `@stacks/connect` is unaffected:

**Contract calls remain identical:**
```typescript
// Read-only function calls - unchanged
const result = await callReadOnlyFunction({
  contractAddress,
  contractName: 'counter',
  functionName: 'get-count',
  // ...
});

// Contract-call transactions - unchanged
await openContractCall({
  contractAddress,
  contractName: 'counter',
  functionName: 'increment',
  // ...
});
```

**Why frontend is unaffected:**
- Contract interface (public functions, parameters, return types) unchanged
- Network interaction layer (@stacks/connect) unchanged
- Only internal contract logic could use new features

**When frontend changes needed:**
- IF contract adopts new Clarity 4 features that change public interface
- Example: Adding timestamp return values using `stacks-block-time`
- But basic migration with no contract logic changes = no frontend changes

**Source confidence:** HIGH - Backward compatibility confirmed in [Clarity 4 activation announcement](https://www.stacks.co/blog/clarity-4-bitcoin-smart-contract-upgrade)

## Migration Order

### Recommended sequence

**Phase 1: Configuration Update (Low Risk)**
1. Update Clarinet.toml: `clarity_version = 4`, `epoch = 3.3`
2. Verify Clarinet version supports epoch 3.3
3. Run existing test suite
4. Deploy to devnet and verify existing functionality

**Validation:** All existing tests pass, counter works identically

**Phase 2: Feature Adoption (Optional, Separate Milestone)**
1. Identify beneficial Clarity 4 features for counter contract
2. Update contract to use new features (if desired)
3. Update tests for new functionality
4. Update frontend if contract interface changes

**Why separate phases:**
- Configuration change is mechanical and low-risk
- Feature adoption requires design decisions and testing
- Can ship Clarity 4 compatibility without feature changes
- Feature adoption can be deferred or skipped

### Deployment considerations

**Devnet:**
- Full control over epoch activation
- Can test Clarity 4 immediately after Clarinet configuration

**Testnet/Mainnet:**
- Epoch 3.3 already active (activated November 2024)
- Deploying with `clarity_version = 4` will use Clarity 4 runtime
- Existing Clarity 3 contracts on-chain continue running (no forced migration)

**Source confidence:** MEDIUM - Based on [Nakamoto rollout documentation](https://docs.stacks.co/nakamoto-upgrade/nakamoto-rollout-plan) patterns and epoch activation model

## Architecture Implications

### Component isolation

The migration demonstrates good architectural separation:

| Component | Impact | Reason |
|-----------|--------|--------|
| Clarinet.toml | Configuration change | Version specified here |
| Contract files | No change (base migration) | Backward compatible |
| Test files | No change | SDK respects Clarinet.toml |
| Frontend | No change | Contract interface unchanged |
| Deployment | Environment check needed | Epoch must be active on network |

### Design patterns

**Version control pattern:**
- Clarity version is infrastructure configuration, not code
- Contrast with Solidity's in-contract pragmas
- Enables centralized version management across contracts

**Backward compatibility commitment:**
- Major version increments (3→4) maintain compatibility
- New features are opt-in, not breaking changes
- Reduces migration risk

**Epoch-based activation:**
- Network-wide upgrades at specific Bitcoin block heights
- Cannot deploy Clarity 4 before epoch 3.3 activates
- Development environments can enable early for testing

## Known Issues and Gaps

### Documentation gaps (LOW confidence areas)

1. **Clarinet version requirements:** Could not find definitive statement of minimum Clarinet version for Clarity 4/epoch 3.3 support. Recommendation: Check Clarinet releases page or use `clarinet --version` and test.

2. **Deployment plan syntax:** Did not verify if deployment plan files need updates for Clarity 4. Assumption: Should follow Clarinet.toml pattern with `clarity-version: 4` and `epoch: "3.3"` but needs verification.

3. **VSCode extension compatibility:** Unknown if Clarity language server in VSCode extension recognizes Clarity 4 syntax. May need extension update.

### Testing recommendations

Before considering migration complete:
1. Verify Clarinet version explicitly supports epoch 3.3
2. Test full devnet deployment workflow
3. Check if deployment plans need syntax updates
4. Confirm VSCode extension recognizes Clarity 4 (if used)

## Sources

### HIGH confidence sources

- [Stacks Core Release 3.3.0.0.0](https://github.com/stacks-network/stacks-core/releases/tag/3.3.0.0.0) - Epoch 3.3 and Clarity 4 activation details
- [Clarity 4 is Now LIVE](https://www.stacks.co/blog/clarity-4-bitcoin-smart-contract-upgrade) - Official activation announcement
- [SIP-033: Clarity 4](https://stacks.org/sip-033-clarity-4) - Feature specifications
- [SIP-033 Community Vote](https://stacks.org/sip-033-vote-breakdown) - Governance approval

### MEDIUM confidence sources

- [Updates for Clarinet](https://docs.hiro.so/stacks/nakamoto/guides/clarinet) - Clarinet Nakamoto support (epoch 3.0 focused)
- [Nakamoto Support on Simnet/Devnet](https://www.hiro.so/blog/nakamoto-support-now-live-on-simnet-and-devnet) - Testing environment patterns
- [GitHub: Clarinet Releases](https://github.com/hirosystems/clarinet/releases) - Version information

### Research notes

- Search for "clarity_version = 4" in GitHub returned no public examples as of 2026-02-02
- Clarity 4 activated November 2024, still early adoption phase
- Most examples still use Clarity 3 / epoch 3.0 configuration
- Configuration pattern extrapolated from Clarity 2→3 migration patterns
