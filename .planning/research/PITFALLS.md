# Pitfalls Research: Clarity 4 Migration

## Summary

Migrating Clarity contracts from version 3 to 4 is primarily additive (new functions), but introduces runtime pitfalls with epoch-aware keywords, configuration mismatches, and anti-patterns in error handling. The biggest risk is deploying contracts that pass local tests but fail in production due to epoch configuration or keyword usage in historical block contexts.

## Critical Pitfalls

### Pitfall 1: Using stacks-block-time in at-block with Pre-Clarity-4 Blocks

**What goes wrong:** If you use `at-block` to set context to a block from before Clarity 4 activation (Bitcoin block 923222), attempting to use `stacks-block-time` in that context will result in a runtime error.

**Why it happens:** `stacks-block-time` is a Clarity 4 keyword that doesn't exist in earlier epochs. The `at-block` expression sets execution context to a historical block, and keywords execute in that block's epoch context.

**Consequences:**
- Transaction fails at runtime, not compile time
- Silent failures in historical data processing
- Cross-epoch compatibility bugs

**Prevention:**
- Check block height before using `stacks-block-time` in `at-block` contexts
- Add epoch guards: only use Clarity 4 keywords when you know the context block is post-activation
- Document minimum supported block height if your contract uses `at-block` with Clarity 4 features

**Detection:**
- Test with `at-block` targeting blocks from different epochs
- Clarinet simnet tests should include historical block queries
- Warning signs: runtime errors in production but tests pass (tests likely only use recent blocks)

**Example scenario:**
```clarity
;; DANGEROUS: Will fail if querying pre-Clarity-4 blocks
(define-read-only (get-historical-timestamp (block-hash (buff 32)))
  (at-block block-hash
    (ok stacks-block-time)))  ;; Runtime error if block-hash is pre-923222

;; SAFE: Guard against pre-Clarity-4 blocks
(define-read-only (get-historical-timestamp-safe (block-hash (buff 32)))
  (at-block block-hash
    (if (>= stacks-block-height u923222)  ;; Check if Clarity 4 is active
      (ok stacks-block-time)
      (err u404))))  ;; Feature not available
```

### Pitfall 2: burn-block-height Bug in Clarity 3 (Unfixed, Affects Migration)

**What goes wrong:** In Clarity 3, when `burn-block-height` is used within an `at-block` expression, it always returns the burn block at the current chain tip, NOT the historical burn block height for the specified block.

**Why it happens:** This is a known bug in Clarity 3 that affects any contracts using `burn-block-height` inside `at-block`. It will be fixed in a future hard fork.

**Consequences:**
- Incorrect historical data queries
- Logic bugs when reasoning about Bitcoin block heights at specific Stacks blocks
- Migration to Clarity 4 doesn't fix this (it's inherited behavior)

**Prevention:**
- Avoid using `burn-block-height` inside `at-block` expressions in both Clarity 3 and 4
- Use alternative approaches: store burn heights as data when needed, or query externally
- Document this limitation if your contract needs historical burn block data

**Detection:**
- Test that compares `burn-block-height` inside vs outside `at-block` contexts
- Expected: different values. Actual (buggy): same value
- Warning sign: historical burn block queries always return current tip

### Pitfall 3: Epoch/Clarity Version Mismatch Between Development and Deployment

**What goes wrong:** Contract configured with `clarity_version = 4` and `epoch = 3.0` in `Clarinet.toml` works locally, but deployment to testnet/mainnet fails or behaves incorrectly due to network epoch mismatch.

**Why it happens:**
- Local devnet can be configured to any epoch via `Devnet.toml`
- Testnet/mainnet have specific block heights where epochs activate
- Contract specifies `clarity_version = 4` but network hasn't activated epoch 3.0 yet
- Or reverse: contract uses Clarity 3 syntax but network is in epoch 3.0

**Consequences:**
- Deployment transaction fails
- Contract deploys but can't use Clarity 4 features
- Different behavior between local tests and live network

**Prevention:**
1. **Check network epoch before deployment:**
   - Testnet: Verify current epoch via block explorer or API
   - Mainnet: Clarity 4 activated at Bitcoin block 923222 (December 2025)

2. **Match Clarinet.toml to target network:**
   ```toml
   [contracts.counter]
   path = 'contracts/counter.clar'
   clarity_version = 4  # Only if network supports it
   epoch = 3.0          # Must match network epoch
   ```

3. **Align Devnet.toml with deployment target:**
   ```toml
   # In settings/Devnet.toml
   epoch_2_0 = 100
   epoch_2_05 = 101
   epoch_2_1 = 102
   epoch_3_0 = 108  # Match your testing to target network
   ```

4. **Deployment plan validation:**
   - Review generated deployment plans for epoch field
   - Ensure deployment plan epoch matches network state
   - Use correct flags: `--testnet` or `--mainnet`

**Detection:**
- Deployment transaction rejected with epoch-related error
- Clarity 4 functions not available even though code compiles
- Different test results between simnet/devnet and testnet
- Warning: "Contract deployed successfully but function X is undefined"

### Pitfall 4: Using unwrap-panic/unwrap-err-panic in Production Code

**What goes wrong:** Using `unwrap-panic` or `unwrap-err-panic` causes the entire transaction to abort with a generic runtime error, providing no meaningful error information to the calling application.

**Why it happens:** Developers carry over habits from other languages (like Rust's `.unwrap()`) or want to avoid writing error-handling code.

**Consequences:**
- Poor error messages make debugging impossible
- Calling applications can't handle errors gracefully
- Users see generic failures instead of actionable messages
- Difficult to diagnose issues in production

**Prevention:**
- Use `unwrap!` and `unwrap-err!` with explicit error codes instead
- Define meaningful error constants at top of contract
- Only use `unwrap-panic`/`unwrap-err-panic` when you've already validated the value cannot fail (e.g., after a guard clause)

**Good pattern:**
```clarity
;; Define error constants
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-UNAUTHORIZED (err u403))

;; BAD: No error information
(define-public (bad-transfer (amount uint))
  (let ((balance (unwrap-panic (get-balance tx-sender))))
    (ok true)))

;; GOOD: Meaningful error codes
(define-public (good-transfer (amount uint))
  (let ((balance (unwrap! (get-balance tx-sender) ERR-NOT-FOUND)))
    (ok true)))

;; ACCEPTABLE: After validation
(define-public (safe-panic-usage (amount uint))
  (begin
    (asserts! (is-some (get-balance tx-sender)) ERR-NOT-FOUND)
    ;; Now unwrap-panic is safe because we validated above
    (let ((balance (unwrap-panic (get-balance tx-sender))))
      (ok true))))
```

**Detection:**
- Search codebase for `unwrap-panic` and `unwrap-err-panic`
- Code review: ensure each usage has a validation guard
- Test error paths: ensure errors return meaningful codes, not runtime panics

## Moderate Pitfalls

### Pitfall 5: Forgetting to Update clarity_version in Clarinet.toml

**What goes wrong:** Contract uses Clarity 4 features (like `stacks-block-time`, `contract-hash?`, `to-ascii`) but `Clarinet.toml` still has `clarity_version = 3`.

**Why it happens:** Developer updates contract code but forgets to update configuration file.

**Consequences:**
- Compiler errors: "undefined function" for Clarity 4 keywords
- Tests fail with confusing error messages
- Wasted debugging time tracking down configuration issue

**Prevention:**
- Update `Clarinet.toml` FIRST when starting migration
- Add a checklist to migration process: "Update clarity_version before using new features"
- Use grep/search to find all contracts: `grep -r "clarity_version" clarity/`

**Detection:**
- Compiler error mentioning undefined Clarity 4 function
- Contract works locally after changing clarity_version but not before
- Warning sign: "use of undeclared identifier" for known Clarity 4 keywords

**Fix:**
```toml
# Before migration
[contracts.counter]
path = 'contracts/counter.clar'
clarity_version = 3
epoch = 3.0

# After migration
[contracts.counter]
path = 'contracts/counter.clar'
clarity_version = 4  # ← Update this
epoch = 3.0
```

### Pitfall 6: Using tx-sender Instead of contract-caller for Authorization

**What goes wrong:** Using `tx-sender` for authentication instead of `contract-caller` creates security vulnerabilities and enables phishing attacks.

**Why it happens:** Developers don't understand the difference between `tx-sender` (transaction originator, like Solidity's `tx.origin`) and `contract-caller` (immediate caller).

**Consequences:**
- Proxy contracts can impersonate users
- Phishing attacks: malicious contract calls your contract on behalf of user
- Assets stolen or unauthorized state changes

**Prevention:**
- Use `contract-caller` for authorization checks, not `tx-sender`
- Only use `tx-sender` when you specifically need the transaction originator (rare)
- Code review: audit all uses of `tx-sender` for security implications

**Example:**
```clarity
;; VULNERABLE: Malicious proxy can steal user funds
(define-public (bad-withdraw (amount uint))
  (begin
    ;; tx-sender is original user, even if called via malicious proxy
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (try! (transfer amount tx-sender))
    (ok true)))

;; SECURE: Proxy attack prevented
(define-public (good-withdraw (amount uint))
  (begin
    ;; contract-caller must be owner (proxy can't impersonate)
    (asserts! (is-eq contract-caller (var-get owner)) ERR-UNAUTHORIZED)
    (try! (transfer amount contract-caller))
    (ok true)))
```

**Detection:**
- Security audit: search for `tx-sender` in authorization checks
- Test with proxy contract: try calling protected functions via intermediate contract
- Warning: authorization bypassed when called indirectly

### Pitfall 7: Misunderstanding Post-Conditions (New in Clarity 4)

**What goes wrong:** Developers use the new `restrict-assets?` function incorrectly, creating post-conditions that are too strict (blocking valid transactions) or too loose (not providing intended protection).

**Why it happens:** Post-conditions are a new Clarity 4 feature with complex behavior. Developers unfamiliar with the concept set them incorrectly.

**Consequences:**
- Too strict: legitimate transactions fail at runtime
- Too loose: assets not protected as intended
- False sense of security

**Prevention:**
- Understand post-condition semantics: they assert state AFTER transaction completes
- Test both success and failure cases
- Start with simpler patterns before complex asset restrictions
- Review Clarity 4 post-condition examples in documentation

**Detection:**
- Unexpected transaction failures in testing
- Assets moving when they shouldn't (or vice versa)
- Post-condition violation errors at runtime

### Pitfall 8: Not Testing Across Epoch Boundaries

**What goes wrong:** Tests only run in epoch 3.0 (Clarity 4), missing bugs that occur when contracts interact across epoch boundaries.

**Why it happens:** Default Clarinet devnet configuration starts in epoch 3.0, so developers never test epoch transitions.

**Consequences:**
- Historical data queries fail in production
- Multi-contract systems break when contracts span different epochs
- Runtime errors when old contracts call new contracts (or vice versa)

**Prevention:**
- Configure `Devnet.toml` to include epoch transitions in test suite
- Test contracts calling between epoch 2.x and 3.0
- Verify behavior with `at-block` queries to pre-Clarity-4 blocks

**Configuration example:**
```toml
# settings/Devnet.toml
epoch_2_0 = 100
epoch_2_05 = 101
epoch_2_1 = 102
epoch_3_0 = 108  # Epoch transition happens during tests

# Now blocks 100-107 are epoch 2.x, 108+ are epoch 3.0
```

**Detection:**
- Tests pass locally but fail on testnet
- Different behavior for same contract deployed at different block heights
- Errors when querying historical blocks

## Minor Pitfalls

### Pitfall 9: Over-Using Clarity 4 Features in Simple Contracts

**What goes wrong:** Developer adds Clarity 4 features (like `to-ascii` conversions or `contract-hash?` checks) to a simple counter contract where they provide no value.

**Why it happens:** Excitement about new features, "might need it later" thinking.

**Consequences:**
- Increased complexity without benefit
- Higher gas costs
- Harder to audit and maintain
- Premature optimization

**Prevention:**
- Only use Clarity 4 features when they solve a real problem
- Start with minimal migration: just update `clarity_version`
- Add new features when requirements emerge, not speculatively

**Example - Simple counter doesn't need:**
- `stacks-block-time` (no time-based logic)
- `contract-hash?` (no template validation)
- `restrict-assets?` (no asset transfers)
- `to-ascii` (no string generation)
- `secp256r1-verify` (no signature verification)

**Detection:**
- Code review: ask "why is this feature needed?"
- Unused imports or functions
- Complex code doing simple things

### Pitfall 10: Inconsistent Error Handling Patterns

**What goes wrong:** Some functions use `(ok bool)` returns, others use `(ok uint)`, others use error codes, creating inconsistent API.

**Why it happens:** Incrementally updating contract without considering overall API design.

**Consequences:**
- Confusing for frontend developers
- Harder to compose functions
- Inconsistent error handling in UI

**Prevention:**
- Establish error handling conventions before migration:
  - Define all error constants at top of file
  - Decide: will functions return `(ok true)` or `(ok <value>)`?
  - Be consistent across contract
- Migrate error handling patterns along with Clarity version

**Example conventions:**
```clarity
;; Error constants (top of file)
(define-constant ERR-UNDERFLOW (err u1))
(define-constant ERR-OVERFLOW (err u2))
(define-constant ERR-UNAUTHORIZED (err u3))

;; Consistent return pattern: (response uint uint)
(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))))  ;; Always return new value

(define-public (decrement)
  (begin
    (asserts! (> (var-get counter) u0) ERR-UNDERFLOW)
    (var-set counter (- (var-get counter) u1))
    (ok (var-get counter))))  ;; Consistent with increment
```

**Detection:**
- API documentation doesn't match actual return types
- Frontend code has special cases for different functions
- Type errors when composing functions

## Testing Checklist

How to verify your Clarity 4 migration succeeded:

### Pre-Migration

- [ ] Document current contract behavior (what returns what, all edge cases)
- [ ] Ensure existing tests pass with Clarity 3 configuration
- [ ] Identify which (if any) Clarity 4 features you need
- [ ] Check network epoch support (is testnet/mainnet ready for Clarity 4?)

### Configuration Update

- [ ] Update `clarity_version = 4` in `Clarinet.toml` for migrated contracts
- [ ] Update `epoch = 3.0` if not already set
- [ ] Verify `Devnet.toml` includes epoch 3.0 configuration
- [ ] Confirm deployment plan will target correct epoch

### Code Changes

- [ ] If using Clarity 4 features, verify they're actually needed
- [ ] Replace `unwrap-panic`/`unwrap-err-panic` with `unwrap!`/`unwrap-err!` + error codes
- [ ] Audit `tx-sender` usage, replace with `contract-caller` where appropriate
- [ ] Add epoch guards for any `at-block` + Clarity 4 keyword combinations
- [ ] Ensure error handling patterns are consistent

### Testing

- [ ] All existing tests still pass with `clarity_version = 4`
- [ ] Contract behavior unchanged (unless intentionally modified)
- [ ] Test with `at-block` targeting pre-Clarity-4 blocks (if using historical queries)
- [ ] Test across epoch boundaries (if using multi-epoch devnet config)
- [ ] Test all error paths return meaningful error codes (not runtime panics)
- [ ] Test authorization with proxy contracts (if using `contract-caller`)
- [ ] Test post-conditions (if using `restrict-assets?`)

### Deployment Preparation

- [ ] Verify target network (testnet/mainnet) supports Clarity 4 / epoch 3.0
- [ ] Check Clarinet version supports Clarity 4 (`clarinet --version`)
- [ ] Generate deployment plan with correct network flag (`--testnet`/`--mainnet`)
- [ ] Review deployment plan: verify epoch matches target network
- [ ] Test deployment on testnet before mainnet

### Post-Deployment Validation

- [ ] Contract deployed successfully
- [ ] Clarity 4 functions work as expected (if used)
- [ ] Frontend integration still works
- [ ] Error messages are meaningful (not generic runtime errors)
- [ ] Gas costs are reasonable (Clarity 4 shouldn't significantly increase gas)
- [ ] Monitor for unexpected runtime errors in production

### Documentation

- [ ] Update README/docs to note Clarity 4 requirement
- [ ] Document minimum supported block height (if using Clarity 4 features with `at-block`)
- [ ] Update contract ABI documentation (if API changed)
- [ ] Note any breaking changes from migration

## Sources

### Official Documentation
- [Clarity Keywords - Stacks Documentation](https://docs.stacks.co/reference/keywords) - burn-block-height bug, stacks-block-time runtime error
- [SIP-033 Update: Clarity 4 Is On The Way](https://stacks.org/sip-033-clarity-4) - Clarity 4 new functions overview
- [Stacks - Clarity 4 is Now LIVE](https://www.stacks.co/blog/clarity-4-bitcoin-smart-contract-upgrade) - Activation details, new features
- [Updates for Clarinet - Hiro Docs](https://docs.hiro.so/stacks/nakamoto/guides/clarinet) - Epoch 2.5 and epoch 3.0 support
- [Unit Testing - Stacks Documentation](https://docs.stacks.co/clarinet/testing-with-clarinet-sdk) - Simnet and devnet testing
- [Contract Deployment - Stacks Documentation](https://docs.stacks.co/clarinet/contract-deployment) - Deployment plan configuration

### Best Practices and Security
- [Clarity: Best Practices and Checklists - CertiK](https://www.certik.com/resources/blog/clarity-best-practices-and-checklist) - unwrap-panic avoidance, best practices
- [Unwrap Flavours - Clarity Book](https://book.clarity-lang.org/ch06-03-unwrap-flavours.html) - unwrap! vs unwrap-panic
- [Tx-Sender in Clarity may lead to Vulnerabilities - CoinFabrik](https://www.coinfabrik.com/blog/tx-sender-in-clarity-smart-contracts-is-not-adviced/) - tx-sender vs contract-caller security
- [Testing Your Contract - Clarity Book](https://book.clarity-lang.org/ch07-04-testing-your-contract.html) - Testing strategies

### Epoch and Version History
- [Nakamoto Support Now Live on Simnet and Devnet](https://www.hiro.so/blog/nakamoto-support-now-live-on-simnet-and-devnet) - Epoch configuration and Clarity 3
- [How to Setup a Stacks 2.1 Local Environment](https://www.hiro.so/blog/how-to-setup-a-stacks-2-1-local-environment-to-test-clarity-2-contract-functions) - Clarity version configuration

### Clarity 4 Features
- [SIP-033: Clarity 4 Pull Request](https://github.com/stacksgov/sips/pull/218) - Complete technical specification
- [Stacks Community Approves SIP-033](https://stacks.org/sip-033-vote-breakdown) - Activation vote details

**Research Confidence Level: MEDIUM**
- HIGH confidence on: known bugs (burn-block-height, stacks-block-time), best practices (unwrap-panic, tx-sender)
- MEDIUM confidence on: post-conditions (new feature, limited real-world examples), epoch testing (configuration-dependent)
- All WebSearch findings cross-referenced with official Stacks documentation where possible
