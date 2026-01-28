# Phase 1: Foundation & Developer Setup - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the modern UI foundation (Tailwind CSS v3 + shadcn/ui), development tooling (ESLint 9, Vitest), and dark mode. Remove Chakra UI. The result: developers can run `pnpm install`, `pnpm dev`, and `pnpm test` with working Tailwind styles and dark mode toggle.

</domain>

<decisions>
## Implementation Decisions

### Project Reorganization
- Adopt `lib/stacks/` pattern for blockchain code, `lib/utils/` for pure utilities
- Keep monorepo structure: `contracts/` and `front-end/` at root
- Examples (counter feature) go in `front-end/src/examples/` — inside app code, clearly marked as deletable
- shadcn components in `components/ui/` — standard CLI convention

### Package Manager
- Switch from npm to pnpm (avoids React 19 peer dependency flags)
- Remove `package-lock.json`, use only `pnpm-lock.yaml`
- Soft recommendation: document pnpm in README, don't enforce via packageManager field

### Claude's Discretion
- Dark mode default (system/light/dark) and toggle implementation
- Chakra UI removal strategy (all at once vs incremental)
- ESLint rule configuration details
- Exact Tailwind content paths

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for dark mode and ESLint configuration.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-developer-setup*
*Context gathered: 2026-01-28*
