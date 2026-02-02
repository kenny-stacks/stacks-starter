# Requirements: Stacks Starter v1.2

**Defined:** 2026-02-02
**Core Value:** Developers can connect a wallet and interact with a smart contract within minutes of cloning

## v1.2 Requirements

Requirements for Clarity 4 update. Each maps to roadmap phases.

### Configuration

- [ ] **CFG-01**: Update clarity_version to 4 in Clarinet.toml
- [ ] **CFG-02**: Update epoch to 3.3 in Clarinet.toml
- [ ] **CFG-03**: Verify Clarinet tooling works with new configuration

### Contract

- [ ] **CTR-01**: Review counter contract for Clarity 4 idiom improvements
- [ ] **CTR-02**: Apply beneficial idiom changes (if any found)

### Testing

- [ ] **TST-01**: All existing Vitest tests pass with Clarity 4 configuration
- [ ] **TST-02**: Contract deploys and functions correctly on local devnet
- [ ] **TST-03**: Add tests for any Clarity 4 features adopted

## Future Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Additional Contract Examples

- **EX-01**: NFT contract example demonstrating minting patterns
- **EX-02**: Token contract example demonstrating fungible token patterns

### Developer Tooling

- **TOOL-01**: GitHub Actions CI workflow
- **TOOL-02**: Deployment guide for testnet/mainnet

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| stacks-block-time feature | User chose minimal update, config only |
| Documentation version emphasis | User specified no version emphasis in docs |
| Multiple contract examples | Out of scope for this milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CFG-01 | Phase 7 | Pending |
| CFG-02 | Phase 7 | Pending |
| CFG-03 | Phase 7 | Pending |
| CTR-01 | Phase 7 | Pending |
| CTR-02 | Phase 7 | Pending |
| TST-01 | Phase 8 | Pending |
| TST-02 | Phase 8 | Pending |
| TST-03 | Phase 8 | Pending |

**Coverage:**
- v1.2 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-02*
*Last updated: 2026-02-02 after v1.2 roadmap created*
