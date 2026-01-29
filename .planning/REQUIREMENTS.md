# Requirements: Stacks Starter

**Defined:** 2026-01-29
**Core Value:** Developers can connect a wallet and interact with a smart contract within minutes of cloning

## v1.1 Requirements

Requirements for Hiro Platform Migration. Remove hosted devnet dependency.

### Code Changes

- [ ] **CODE-01**: Remove Hiro Platform API constants from `devnet.ts`
- [ ] **CODE-02**: Remove `NEXT_PUBLIC_DEVNET_HOST` conditional logic (always use local)
- [ ] **CODE-03**: Remove `NEXT_PUBLIC_PLATFORM_HIRO_API_KEY` environment variable usage
- [ ] **CODE-04**: Simplify devnet network configuration to localhost:3999 only

### Documentation Changes

- [ ] **DOCS-01**: Update README with local devnet setup instructions (replace Hiro Platform references)
- [ ] **DOCS-02**: Rewrite getting-started.md for Clarinet devnet workflow
- [ ] **DOCS-03**: Update extending.md to remove Hiro Platform deployment references
- [ ] **DOCS-04**: Update .env.example to remove platform-specific variables

## Out of Scope

| Feature | Reason |
|---------|--------|
| Alternative hosted devnet providers | Local devnet is the target; no replacement service needed |
| Testnet/mainnet API changes | Hiro API remains available for testnet/mainnet |
| New contract examples | Out of scope for this migration milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CODE-01 | Phase 6 | Pending |
| CODE-02 | Phase 6 | Pending |
| CODE-03 | Phase 6 | Pending |
| CODE-04 | Phase 6 | Pending |
| DOCS-01 | Phase 6 | Pending |
| DOCS-02 | Phase 6 | Pending |
| DOCS-03 | Phase 6 | Pending |
| DOCS-04 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-29 after roadmap creation*
