# Phase 6: Hiro Platform Removal - Research

**Researched:** 2026-01-29
**Domain:** Code cleanup, documentation update, environment variable removal
**Confidence:** HIGH

## Summary

This phase involves removing all Hiro Platform hosted devnet references from the codebase and documentation, making local Clarinet devnet (`clarinet devnet start`) the only development path. The scope is well-defined: remove platform-specific code from `devnet.ts`, update environment files, and rewrite documentation to reference local devnet workflow.

The current codebase has a conditional setup where `NEXT_PUBLIC_DEVNET_HOST` environment variable switches between platform-hosted devnet (via Hiro Platform API) and local devnet (`localhost:3999`). Since the project already works with local devnet (as verified in Phase 4), this is a pure removal/simplification task with no new functionality.

**Primary recommendation:** Delete the platform conditional logic in `devnet.ts`, hardcode `localhost:3999`, remove related environment variables, and update all documentation to use `clarinet devnet start` workflow.

## Standard Stack

This phase does not introduce new libraries. It simplifies existing configuration.

### Core
| Component | Current | After Removal | Impact |
|-----------|---------|---------------|--------|
| `devnet.ts` | Conditional platform/local URL | Hardcoded `localhost:3999` | Simpler, no runtime branching |
| `.env.example` | 3 devnet vars | 1 devnet var (`NEXT_PUBLIC_STACKS_NETWORK`) | Cleaner setup |
| Docker | Required for local devnet | Still required | No change |
| Clarinet | Already installed | Still required | No change |

### Tools Required for Local Devnet
| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| Clarinet | Latest | Local blockchain development | `brew install clarinet` |
| Docker | Latest | Runs devnet services | Docker Desktop |

**No new packages to install.**

## Architecture Patterns

### Current Architecture (BEFORE)

```
front-end/src/constants/devnet.ts:
├── PLATFORM_API_DOMAIN          # "https://api.platform.hiro.so"
├── DEVNET_STACKS_BLOCKCHAIN_API_URL_PLATFORM  # Uses API key
├── DEVNET_STACKS_BLOCKCHAIN_API_URL_LOCAL     # "http://localhost:3999"
├── DEVNET_STACKS_BLOCKCHAIN_API_URL           # Conditional selection
└── DEVNET_NETWORK               # Uses conditional URL

Environment variables:
├── NEXT_PUBLIC_STACKS_NETWORK   # "devnet"|"testnet"|"mainnet"
├── NEXT_PUBLIC_DEVNET_HOST      # "platform"|"local" (TO REMOVE)
└── NEXT_PUBLIC_PLATFORM_HIRO_API_KEY  # Platform API key (TO REMOVE)
```

### Target Architecture (AFTER)

```
front-end/src/constants/devnet.ts:
├── DEVNET_STACKS_BLOCKCHAIN_API_URL  # "http://localhost:3999" (hardcoded)
└── DEVNET_NETWORK                     # Uses hardcoded URL

Environment variables:
└── NEXT_PUBLIC_STACKS_NETWORK   # "devnet"|"testnet"|"mainnet" (KEEP)
```

### Pattern: Simplified Devnet Configuration

**What:** Hardcode local devnet URL, remove all conditional platform logic
**When to use:** Always - local devnet is now the only development path
**Example:**
```typescript
// AFTER: front-end/src/constants/devnet.ts
import { STACKS_TESTNET, StacksNetwork } from "@stacks/network";

export const DEVNET_STACKS_BLOCKCHAIN_API_URL = "http://localhost:3999";

export const DEVNET_NETWORK: StacksNetwork = {
  ...STACKS_TESTNET,
  client: { baseUrl: DEVNET_STACKS_BLOCKCHAIN_API_URL },
};
```

### Anti-Patterns to Avoid

- **Leaving dead code:** Remove all platform constants, don't just comment them out
- **Partial removal:** Ensure ALL references are removed (search for `PLATFORM_HIRO`, `DEVNET_HOST`, `api.platform`)
- **Inconsistent docs:** All documentation must reference local devnet, not platform

## Don't Hand-Roll

This phase is primarily deletion/simplification. No new solutions needed.

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Local devnet | Custom Docker setup | `clarinet devnet start` | Clarinet handles all devnet orchestration |
| API endpoint | Dynamic URL selection | Hardcoded `localhost:3999` | Single development path = simpler |

**Key insight:** The goal is REMOVAL of complexity, not addition. Less code = fewer bugs.

## Common Pitfalls

### Pitfall 1: Incomplete Removal
**What goes wrong:** Leftover references to platform cause confusion or runtime errors
**Why it happens:** Text-based removal misses some occurrences
**How to avoid:** Use systematic grep search before and after:
```bash
grep -r "PLATFORM_HIRO\|DEVNET_HOST\|api\.platform\|Hiro Platform" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.env*"
```
**Warning signs:** Build warnings about unused exports, documentation mentions platform

### Pitfall 2: Documentation Drift
**What goes wrong:** Code is updated but documentation still references platform workflow
**Why it happens:** Multiple documentation files need coordinated updates
**How to avoid:** Update all docs in the same commit:
- `README.md`
- `docs/getting-started.md`
- `docs/extending.md`
- `front-end/.env.example`
**Warning signs:** Users following docs encounter setup issues

### Pitfall 3: Breaking Testnet/Mainnet
**What goes wrong:** Changes accidentally affect non-devnet configurations
**Why it happens:** Over-aggressive removal touches shared code paths
**How to avoid:** Only modify devnet-specific code paths. The `getStacksUrl()` function in `stacks-api.ts` correctly handles all networks - only the devnet branch needs simplification.
**Warning signs:** Testnet/mainnet deployments fail after changes

### Pitfall 4: Missing Docker Prerequisite in Docs
**What goes wrong:** Users try local devnet without Docker installed
**Why it happens:** Platform devnet didn't need Docker; local devnet does
**How to avoid:** Prominently document Docker as a prerequisite
**Warning signs:** "Docker not found" error reports from users

## Code Examples

### Simplified devnet.ts
```typescript
// Source: Target implementation based on codebase analysis
import { STACKS_TESTNET, StacksNetwork } from "@stacks/network";

export const DEVNET_STACKS_BLOCKCHAIN_API_URL = "http://localhost:3999";

export const DEVNET_NETWORK: StacksNetwork = {
  ...STACKS_TESTNET,
  client: { baseUrl: DEVNET_STACKS_BLOCKCHAIN_API_URL },
};
```

### Simplified .env.example
```bash
# Source: Target implementation based on requirements
# Network configuration
NEXT_PUBLIC_STACKS_NETWORK=devnet

# Testnet/Mainnet deployer addresses (not needed for devnet)
NEXT_PUBLIC_CONTRACT_DEPLOYER_TESTNET_ADDRESS=XXXX
NEXT_PUBLIC_CONTRACT_DEPLOYER_MAINNET_ADDRESS=XXXX
```

### Local Devnet Startup Commands
```bash
# Source: https://docs.stacks.co/reference/clarinet/cli-reference
# Start local devnet (from clarity directory)
cd clarity && clarinet devnet start

# Start without dashboard (useful for CI/scripts)
cd clarity && clarinet devnet start --no-dashboard
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hiro Platform hosted devnet | Local Clarinet devnet | v1.1 | Simpler setup, no API key needed, full local control |
| Conditional URL logic | Hardcoded localhost | v1.1 | Reduced code complexity |

**Deprecated/outdated:**
- `NEXT_PUBLIC_DEVNET_HOST` environment variable: removed in v1.1
- `NEXT_PUBLIC_PLATFORM_HIRO_API_KEY` environment variable: removed in v1.1
- Hiro Platform devnet workflow: replaced by `clarinet devnet start`

## Files to Modify

### Code Changes (CODE-01 through CODE-04)

| File | Change Type | What to Do |
|------|-------------|------------|
| `front-end/src/constants/devnet.ts` | REWRITE | Remove platform constants, keep only local URL |
| `front-end/.env.example` | MODIFY | Remove `NEXT_PUBLIC_DEVNET_HOST` and `NEXT_PUBLIC_PLATFORM_HIRO_API_KEY` |
| `front-end/.env.local` | MODIFY | Remove `NEXT_PUBLIC_DEVNET_HOST` line |

### Documentation Changes (DOCS-01 through DOCS-04)

| File | Change Type | What to Do |
|------|-------------|------------|
| `README.md` | REWRITE | Replace Hiro Platform workflow with `clarinet devnet start` |
| `docs/getting-started.md` | REWRITE | Major rewrite for local devnet workflow |
| `docs/extending.md` | MODIFY | Update deployment section, remove platform references |
| `front-end/.env.example` | MODIFY | Remove platform-specific variables (same as CODE-04) |

### Files That Reference Platform (Full List)

Based on grep search, these files contain Hiro Platform references:
1. `front-end/src/constants/devnet.ts` - CODE
2. `front-end/.env.example` - ENV
3. `README.md` - DOCS
4. `docs/getting-started.md` - DOCS (extensive references)
5. `docs/extending.md` - DOCS (minor references)
6. `metadata.json` - May need update (demoUrl)
7. `.planning/*` - Internal planning docs (update for accuracy)

## Local Devnet Reference

### Default Ports (from settings/Devnet.toml)
| Service | Port | Purpose |
|---------|------|---------|
| Stacks API | 3999 | Main API endpoint for frontend |
| Stacks API Events | 3700 | Event notifications |
| Stacks Node RPC | 20443 | Direct node communication |
| Stacks Node P2P | 20444 | Node-to-node communication |
| Bitcoin Node RPC | 18443 | Bitcoin RPC |
| Bitcoin Node P2P | 18444 | Bitcoin P2P |
| Stacks Explorer | 8000 | Web UI for Stacks blockchain |
| Bitcoin Explorer | 8001 | Web UI for Bitcoin blockchain |
| PostgreSQL | 5432 | Database for API |
| Orchestrator | 20445 | Devnet orchestration |

### Key Point for Documentation
- Frontend connects to `http://localhost:3999` (Stacks API)
- Explorer available at `http://localhost:8000` (optional)
- All ports configurable in `clarity/settings/Devnet.toml`

## Open Questions

None. This phase is well-defined removal work with clear scope.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `front-end/src/constants/devnet.ts` - Verified current implementation
- Codebase analysis: `clarity/settings/Devnet.toml` - Verified port configuration
- Codebase analysis: `docs/getting-started.md` - Verified current documentation state

### Secondary (MEDIUM confidence)
- [Clarinet CLI Reference](https://docs.stacks.co/reference/clarinet/cli-reference) - Command syntax verified
- [Clarinet GitHub](https://github.com/hirosystems/clarinet) - Installation and features confirmed

### Tertiary (LOW confidence)
- None - all findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries, pure removal
- Architecture: HIGH - Clear before/after states verified in codebase
- Pitfalls: HIGH - Common patterns for code removal tasks

**Research date:** 2026-01-29
**Valid until:** Indefinite - this is removal work, not dependent on external API changes
