# Stack Research: Clarity 4 Migration

**Project:** Stacks Starter Kit - Clarity 4 Update
**Researched:** 2026-02-02
**Confidence:** MEDIUM

## Summary

Clarity 4 activated on mainnet November 12, 2025 at Bitcoin block 923222. The migration from Clarity 3 to Clarity 4 requires minimal stack changes - primarily updating Clarinet configuration and potentially updating @stacks/* package versions. Clarinet 2.11.0+ supports epoch 3.0 (Nakamoto), and the project's current Clarinet 3.10.0 should fully support Clarity 4 development.

## Required Updates

### Clarinet
- **Current installed version:** 3.10.0 ✅
- **Minimum for Clarity 4:** 2.11.0+ (for epoch 3.0 support)
- **Latest documented:** 3.2.0 (project has newer version)
- **Status:** No update required

**Version History:**
- Clarinet 2.2.0 (Jan 2024): Added Nakamoto support (epoch 2.5 and 3.0)
- Clarinet 2.11.0+: Runs epoch 3.0 by default with Clarity 3 support
- Clarinet 3.x: Current stable with full Nakamoto support

**Configuration Changes Required:**

In `Clarinet.toml`, contracts must specify Clarity version and epoch. Current project uses:

```toml
[contracts.counter]
path = 'contracts/counter.clar'
clarity_version = 3
epoch = 3.0
```

**For Clarity 4 contracts**, the configuration syntax is likely:

```toml
[contracts.counter]
path = 'contracts/counter.clar'
clarity_version = 4
epoch = 3.0
```

> **Note:** The `clarity_version = 4` syntax is extrapolated from the Clarity 3 pattern. Official documentation has not yet widely published examples, but this follows the established versioning scheme introduced for Clarity 2 and 3. Mark as **LOW confidence** pending verification.

**Devnet Configuration:**
- Devnet.toml requires proper `pox_stacking_orders` with 3 stacking orders from 3 different accounts (Nakamoto requirement)
- All stacking orders must start at cycle 1, take at least 2 slots, with auto-extend enabled
- Devnet starts in epoch 3.0 by default on recent Clarinet versions

### Clarity Language

**Version Specifier Syntax:**
Unlike Solidity's in-contract pragma statements, Clarity version is declared externally in `Clarinet.toml`:

```toml
clarity_version = 4  # Specifies Clarity 4
epoch = 3.0          # Specifies Nakamoto epoch
```

**Clarity 4 Features (SIP-033 & SIP-034):**
1. **Contract Code Hash Retrieval** - Verify contract templates before interaction
2. **Post-Conditions for Contracts** - Contracts can protect their own assets
3. **Value-to-ASCII Conversion** - Convert booleans/principals to strings
4. **Block Timestamp Access** - Time-based logic in contracts
5. **secp256r1 Signature Verification** - Passkey/hardware wallet support

**Epoch Mapping:**
- **Epoch 2.5**: Clarity 2 (pre-Nakamoto)
- **Epoch 3.0**: Clarity 3 and Clarity 4 (Nakamoto)
  - Clarity 3: Available with Nakamoto launch (Oct 2024)
  - Clarity 4: Activated November 12, 2025 (Bitcoin block 923222)

**Backward Compatibility:**
- Clarity 4 is expected to be backward compatible with Clarity 3 contracts
- Existing Clarity 3 contracts can remain on `clarity_version = 3`
- New contracts can adopt `clarity_version = 4` to access new built-ins
- **Confidence:** LOW - backward compatibility not explicitly documented in search results

### Stacks.js Packages

**Recommended Versions:**
- **@stacks/connect:** 6.16.0+
- **@stacks/transactions:** 6.16.0+
- **@stacks/stacking:** 6.16.0+
- **All @stacks/* packages:** 6.16.0+

**Why:** Version 6.16.0+ includes Nakamoto support. The Nakamoto upgrade does not introduce breaking changes to applications - apps continue to work post-upgrade with better UX from faster block times.

**Current Project Status:**
Check package.json for current @stacks/* versions. If < 6.16.0, update:

```bash
npm install @stacks/connect@latest @stacks/transactions@latest
```

**VSCode Extension:**
For Clarity 4 development, ensure Clarity LSP extension is version 1.14.0+ to access documentation for new keywords and built-ins.

## No Changes Needed

The following aspects of the stack remain unchanged for Clarity 4 migration:

### Core Framework
- **Next.js 15** - No changes required
- **React 19** - No changes required
- **TypeScript** - No changes required

### UI/Styling
- **shadcn/ui** - No changes required
- **Tailwind CSS** - No changes required

### State Management
- **React Query** - No changes required for blockchain state management
- **@stacks/connect** - Only version update needed (6.16.0+), no API changes

### Testing
- **Vitest** - No changes required
- **Clarinet test harness** - No changes required (runs with Clarinet)

### Contract Development Workflow
- **Clarinet CLI commands** - Same commands (`clarinet check`, `clarinet test`, `clarinet devnet start`)
- **REPL** - Same usage pattern
- **Local devnet** - Automatically runs epoch 3.0 with Clarinet 2.11.0+

## Migration Strategy

### Phase 1: Verify Tooling
1. Confirm Clarinet version: `clarinet --version` (should be 2.11.0+) ✅ Currently 3.10.0
2. Check @stacks/* package versions in package.json
3. Update @stacks/* packages to 6.16.0+ if needed

### Phase 2: Update Configuration
1. Update `Clarinet.toml` contract declarations:
   - Change `clarity_version = 3` to `clarity_version = 4`
   - Confirm `epoch = 3.0`
2. Verify Devnet.toml has proper pox_stacking_orders
3. Test local devnet: `clarinet devnet start`

### Phase 3: Validate Contracts
1. Run `clarinet check` to validate Clarity 4 syntax
2. Run `clarinet test` to ensure existing tests pass
3. Update tests if new Clarity 4 features are used

### Phase 4: Update Documentation
1. Update README with Clarity 4 version requirement
2. Document any new Clarity 4 features used in contracts
3. Update deployment instructions if needed

## Open Questions

1. **Clarity 4 Configuration Syntax:** Is `clarity_version = 4` the correct syntax? (LOW confidence - needs verification)
2. **Backward Compatibility:** Do Clarity 3 contracts work unchanged in Clarity 4 epoch? (MEDIUM confidence - expected but not explicitly documented)
3. **Contract Redeployment:** Do existing deployed Clarity 3 contracts need redeployment? (NO - contracts are immutable, version is per-contract)
4. **New Built-ins Usage:** Are new Clarity 4 built-ins optional or required? (Optional - existing code works without them)

## Sources

**HIGH Confidence:**
- [Clarity Book - Installing Tools](https://book.clarity-lang.org/ch01-01-installing-tools.html) - Clarinet 3.2.0 installation
- [Hiro Blog - Nakamoto Support Live](https://www.hiro.so/blog/nakamoto-support-now-live-on-simnet-and-devnet) - clarity_version = 3 syntax confirmed
- [Stacks.co - Clarity 4 Launch](https://www.stacks.co/blog/clarity-4-bitcoin-smart-contract-upgrade) - Activation at block 923222
- [Stacks Forum - Clarity 4 Proposal](https://forum.stacks.org/t/clarity-4-proposal-new-builtins-for-vital-ecosystem-projects/18266) - SIP-033 features

**MEDIUM Confidence:**
- [Hiro Docs - Clarinet Updates](https://docs.hiro.so/stacks/nakamoto/guides/clarinet) - Nakamoto configuration guidance
- [Clarinet CHANGELOG](https://github.com/hirosystems/clarinet/blob/develop/CHANGELOG.md) - Version history (mentioned in search results, 404 on direct access)
- [Stacks Documentation](https://docs.stacks.co) - General Clarity and Nakamoto information

**LOW Confidence (Needs Verification):**
- Exact `clarity_version = 4` syntax (extrapolated from Clarity 3 pattern)
- Full backward compatibility guarantees (implied but not explicitly documented)
- @stacks/* package breaking changes status (documented as non-breaking for apps, but version 6.16.0+ recommended)

## Risk Assessment

**Low Risk Migration:**
- Minimal breaking changes expected
- Clarinet version already adequate (3.10.0)
- Configuration changes are isolated to Clarinet.toml
- Existing contracts can stay on Clarity 3 if desired
- @stacks/* updates are non-breaking

**Primary Risk:**
- Documentation for Clarity 4-specific configuration is sparse (likely due to recent activation)
- May need to reference Clarinet source code or GitHub issues for edge cases

**Mitigation:**
- Test thoroughly in local devnet before any deployment
- Start with configuration change only, keep contract code unchanged initially
- Validate with `clarinet check` and `clarinet test` at each step
