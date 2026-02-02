# Phase 7: Clarity 4 Migration - Research

**Researched:** 2026-02-02
**Domain:** Clarity Smart Contract Language Version Migration
**Confidence:** HIGH

## Summary

Phase 7 involves updating the Clarinet.toml configuration to enable Clarity 4 and reviewing the counter contract for beneficial idiom improvements. This research builds on comprehensive project-level research already completed in `.planning/research/` and focuses specifically on the planning needs for this phase.

The migration is primarily a configuration change: updating `clarity_version = 4` and `epoch = 3.3` in Clarinet.toml. Clarity 4 is fully backward compatible with Clarity 3 - all existing code continues to work unchanged. The counter contract is a minimal 17-line contract that requires no code changes for Clarity 4 compliance, though optional adoption of `stacks-block-time` could demonstrate modern idioms.

**Primary recommendation:** Update Clarinet.toml configuration first, verify all existing tests pass, then assess whether any Clarity 4 idiom improvements provide clear benefit for the counter contract.

## Standard Stack

The established tools for Clarity 4 migration:

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Clarinet | 3.10.0 (installed) | Clarity development toolchain | Official Hiro toolchain, supports epoch 3.3 |
| Clarity | 4 | Smart contract language | Target version for migration |
| Stacks Core | 3.3.0.0.0+ | Blockchain node | Epoch 3.3 activated at Bitcoin block 923222 |

### Configuration
| Setting | Value | Purpose | Notes |
|---------|-------|---------|-------|
| `clarity_version` | `4` | Enable Clarity 4 features | In Clarinet.toml per-contract |
| `epoch` | `3.3` | Specify Nakamoto epoch with Clarity 4 | Required for Clarity 4 keywords |

### No Changes Needed
| Tool | Current | Notes |
|------|---------|-------|
| @stacks/connect | 6.16.0+ recommended | No breaking changes for Clarity 4 |
| @stacks/transactions | 6.16.0+ recommended | No breaking changes for Clarity 4 |
| Vitest | Current | Test harness unchanged |
| Clarinet CLI | Current | Same commands (`check`, `test`, `devnet start`) |

## Architecture Patterns

### Configuration-Based Version Control

Clarity version is declared externally in `Clarinet.toml`, not in-contract (unlike Solidity's pragma). This enables centralized version management.

**Current configuration (Clarity 3):**
```toml
[contracts.counter]
path = 'contracts/counter.clar'
clarity_version = 3
epoch = 3.0

[contracts.fundraising]
path = 'contracts/fundraising.clar'
clarity_version = 3
epoch = 3.0
```

**Target configuration (Clarity 4):**
```toml
[contracts.counter]
path = 'contracts/counter.clar'
clarity_version = 4
epoch = 3.3

[contracts.fundraising]
path = 'contracts/fundraising.clar'
clarity_version = 4
epoch = 3.3
```

### Pattern: Minimal Migration First

**What:** Update configuration without code changes, validate backward compatibility, then add features.
**When to use:** Any Clarity version migration.
**Why:** Isolates configuration issues from code issues; confirms baseline works before adding complexity.

### Pattern: Clarity 4 Timestamp Usage (Optional)

**What:** Use `stacks-block-time` keyword for time-based logic.
**When to use:** When contract needs actual timestamps (not block heights as time proxy).
**Example:**
```clarity
;; Source: https://docs.stacks.co/reference/clarity/keywords
(if (> stacks-block-time 1755820800)
  (print "after 2025-07-22")
  (print "before 2025-07-22"))
```

### Anti-Patterns to Avoid
- **Over-featuring simple contracts:** Adding `contract-hash?`, `restrict-assets?`, `secp256r1-verify` to a counter where they provide no value
- **Using stacks-block-time in at-block with historical blocks:** Runtime errors when querying pre-Clarity-4 blocks (before Bitcoin block 923222)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Time-based logic | Custom block-height-to-time conversion | `stacks-block-time` keyword | Accurate, accounts for Nakamoto block times |
| Contract verification | Custom hash storage/comparison | `contract-hash?` function | Built-in, verified, handles edge cases |
| Asset protection | Manual balance tracking | `restrict-assets?` function | Automatic rollback on violations |

**Key insight for this phase:** The counter contract is too simple to need any of these. Configuration-only migration is the right approach.

## Common Pitfalls

### Pitfall 1: Epoch Configuration Mismatch
**What goes wrong:** Contract works locally but fails on testnet/mainnet due to epoch mismatch.
**Why it happens:** Devnet can be configured to any epoch; target networks have specific activation heights.
**How to avoid:** Verify target network supports epoch 3.3 before deployment. Mainnet activated Clarity 4 at Bitcoin block 923222 (November 2025).
**Warning signs:** Deployment transaction rejected, Clarity 4 functions unavailable.

### Pitfall 2: Forgetting to Update clarity_version
**What goes wrong:** Developer uses Clarity 4 keywords but configuration still shows `clarity_version = 3`.
**Why it happens:** Updating contract code before configuration.
**How to avoid:** Update Clarinet.toml FIRST, then run `clarinet check` to validate.
**Warning signs:** Compiler errors: "undefined function" for Clarity 4 keywords.

### Pitfall 3: Using stacks-block-time in Historical Contexts
**What goes wrong:** Runtime error when using `stacks-block-time` in `at-block` expression for pre-Clarity-4 blocks.
**Why it happens:** Keywords execute in the context of the block being queried.
**How to avoid:** Add epoch guards if using `at-block`, or avoid historical queries with Clarity 4 keywords.
**Warning signs:** Tests pass (use recent blocks) but production queries to old blocks fail.

### Pitfall 4: Not Testing After Configuration Change
**What goes wrong:** Configuration updated but existing tests not validated.
**Why it happens:** Assuming backward compatibility means no testing needed.
**How to avoid:** Run full test suite after configuration change, before any code changes.
**Warning signs:** Tests fail with unexpected errors after deployment.

## Code Examples

### Current Counter Contract (Clarity 3)
```clarity
;; Source: /clarity/contracts/counter.clar
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
    (asserts! (> (var-get counter) u0) err-underflow)
    (var-set counter (- (var-get counter) u1))
    (ok (var-get counter))))
```

**Analysis:** This contract is minimal and well-written. It has:
- Proper error constant definition
- Consistent return patterns (`ok (var-get counter)`)
- Appropriate use of `asserts!` for validation

**Clarity 4 migration requirement:** Configuration change only. No code changes needed.

### Optional: Counter with Timestamp (Clarity 4 Idiom)
```clarity
;; OPTIONAL enhancement - only if user decides to adopt Clarity 4 feature
;; Source: Project research FEATURES.md recommendation
(define-data-var counter uint u0)
(define-data-var last-updated uint u0)
(define-constant err-underflow (err u1))

(define-read-only (get-count)
  (ok (var-get counter)))

(define-read-only (get-last-updated)
  (ok (var-get last-updated)))

(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (var-set last-updated stacks-block-time)
    (ok (var-get counter))))

(define-public (decrement)
  (begin
    (asserts! (> (var-get counter) u0) err-underflow)
    (var-set counter (- (var-get counter) u1))
    (var-set last-updated stacks-block-time)
    (ok (var-get counter))))
```

**Note:** Project research recommended `stacks-block-time` for educational value, but REQUIREMENTS.md explicitly defers this: "stacks-block-time feature: User chose minimal update, config only". Therefore, this is out of scope for Phase 7.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `block-height` for time | `stacks-block-time` for real timestamps | Clarity 4 (Nov 2025) | Accurate time-based logic |
| External hash verification | `contract-hash?` built-in | Clarity 4 (Nov 2025) | On-chain contract verification |
| Client post-conditions only | `restrict-assets?` contract-level | Clarity 4 (Nov 2025) | Contracts protect own assets |
| secp256k1 only | secp256r1 support | Clarity 4 (Nov 2025) | Passkey/WebAuthn integration |

**Deprecated/outdated:**
- `block-height`: Deprecated in Clarity 3, replaced with `stacks-block-height` and `tenure-height`
- Using block height as time proxy: Now can use `stacks-block-time` for accurate timestamps

## Open Questions

All major questions were resolved in project-level research. Minor gaps that don't block planning:

1. **Exact epoch syntax verification**
   - What we know: `epoch = 3.3` based on stacks-core release notes
   - What's unclear: Some older docs show `epoch = "3.3"` (quoted) vs `epoch = 3.3` (unquoted)
   - Recommendation: Use `epoch = 3.3` (unquoted matches existing pattern in Clarinet.toml); if errors, try quoted variant

2. **Fundraising contract scope**
   - What we know: Phase 7 requirements mention "counter contract" specifically (CTR-01, CTR-02)
   - What's unclear: Whether fundraising.clar should also be updated
   - Recommendation: Update both contracts' Clarinet.toml configuration (CFG-01, CFG-02), but only review counter for idioms (CTR-01, CTR-02)

## Sources

### Primary (HIGH confidence)
- [Stacks Documentation: Keywords](https://docs.stacks.co/reference/clarity/keywords) - `stacks-block-time` keyword documentation, epoch context behavior
- [Stacks Blog: Clarity 4 is Now LIVE](https://www.stacks.co/blog/clarity-4-bitcoin-smart-contract-upgrade) - Activation at Bitcoin block 923222, feature overview
- [Stacks Core Release 3.3.0.0.0](https://github.com/stacks-network/stacks-core/releases/tag/3.3.0.0.0) - Epoch 3.3 activation, Clarity 4 support
- [SIP-033 Specification](https://github.com/stacksgov/sips/pull/218) - Complete Clarity 4 technical specification
- Project research files (`.planning/research/*.md`) - Comprehensive pre-research

### Secondary (MEDIUM confidence)
- [Hiro Docs: Updates for Clarinet](https://docs.hiro.so/stacks/nakamoto/guides/clarinet) - Clarinet.toml configuration patterns
- [Hiro Blog: Nakamoto Support](https://www.hiro.so/blog/nakamoto-support-now-live-on-simnet-and-devnet) - `clarity_version` syntax confirmed

### Tertiary (LOW confidence)
- Exact `epoch = 3.3` syntax - Extrapolated from stacks-core release notes, not explicitly shown in Clarinet docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Clarinet 3.10.0 verified, configuration patterns documented
- Architecture: HIGH - Configuration-based versioning well-established, backward compatibility confirmed
- Pitfalls: HIGH - Documented in official sources, validated in project research
- Code examples: HIGH - Existing contract analyzed, Clarity 4 patterns from official docs

**Research date:** 2026-02-02
**Valid until:** 60 days (Clarity 4 is stable, no expected changes)

## Phase-Specific Guidance

### Requirements Mapping

| Requirement | Research Finding | Action |
|-------------|------------------|--------|
| CFG-01: Update clarity_version to 4 | Syntax: `clarity_version = 4` in Clarinet.toml | Configuration change |
| CFG-02: Update epoch to 3.3 | Syntax: `epoch = 3.3` in Clarinet.toml | Configuration change |
| CFG-03: Verify Clarinet tooling works | Run `clarinet check`, `clarinet test`, `clarinet devnet start` | Validation |
| CTR-01: Review counter for idioms | Contract is minimal; no Clarity 4 idioms provide clear benefit | Document assessment |
| CTR-02: Apply beneficial idiom changes | Per REQUIREMENTS.md, user chose config-only (stacks-block-time deferred) | No code changes |

### Recommended Plan Structure

1. **Plan 1: Configuration Update**
   - Update Clarinet.toml for both contracts (CFG-01, CFG-02)
   - Verify Clarinet tooling works (CFG-03)

2. **Plan 2: Contract Assessment**
   - Review counter contract for Clarity 4 idioms (CTR-01)
   - Document assessment findings (CTR-02 - likely "no changes beneficial")

This two-plan structure isolates configuration from assessment, enabling clear validation checkpoints.
