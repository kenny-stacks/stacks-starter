# Phase 5: Documentation & Polish - Research

**Researched:** 2026-01-28
**Domain:** Technical documentation and developer onboarding
**Confidence:** HIGH

## Summary

Documentation for a starter kit serves a specific purpose: enable developers to understand the architecture quickly and extend it successfully. The research focused on best practices for README structure, getting-started guides, technical patterns documentation, and "what to delete" guidance specific to starter kits.

Current best practices (2026) emphasize storing documentation in the repository alongside code, using a single source of truth, and maintaining documentation through the same PR workflow as code changes. For developer onboarding, the gold standard is enabling developers to understand prerequisites, complete setup, and grasp core patterns within the first session.

The user has already decided on the documentation structure: minimal README with quick start, three docs files (getting-started.md, patterns.md, extending.md), code examples linked to source files rather than inline, and a concise technical tone. Research focused on validating this approach and identifying patterns, pitfalls, and best practices for each documentation type.

**Primary recommendation:** Follow the established "Separate Quick Starts, Tutorials, Reference, and Concepts" pattern where README = quick start, getting-started.md = tutorial, patterns.md = concepts, and extending.md = reference for modification.

## Standard Stack

Documentation for this phase requires no libraries or build tools. It's pure Markdown with optional tooling.

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Markdown | CommonMark/GFM | Documentation format | Universal GitHub support, readable as plain text |
| git | - | Version control for docs | Docs evolve with code in same commits |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| markdownlint | latest | Markdown linting | Optional: enforce consistent formatting, catch broken links |
| Vale | latest | Prose linting | Optional: technical writing style enforcement |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Markdown files | Docusaurus/VitePress | Static site generators add complexity, not needed for 3-file docs structure |
| Plain Markdown | MDX | MDX enables interactive components but adds build step and complexity |
| Link to source | Inline code | Inline examples are easier to copy but become stale when code changes |

**Installation:**
None required. Optional linting:
```bash
npm install --save-dev markdownlint-cli
```

## Architecture Patterns

### Recommended Documentation Structure

User has already decided on this structure (from CONTEXT.md):

```
/
├── README.md                    # Minimal: quick start, structure, links
└── docs/
    ├── getting-started.md       # Detailed setup walkthrough
    ├── patterns.md              # Architecture patterns explained
    └── extending.md             # How to modify/replace example code
```

### Pattern 1: Progressive Disclosure in README
**What:** README provides minimum viable information with links to detailed docs.
**When to use:** Always for starter kits. Developers scan README first; overwhelm = abandonment.
**Structure:**
- Project title + one-line description
- Prerequisites (with learning resource links)
- Quick start (fewest steps to running app)
- Project structure overview
- Link to docs/ for everything else

**Anti-pattern:** Kitchen sink README with everything inline (leads to 1000+ line files that nobody reads).

### Pattern 2: Task-Based Getting Started Guide
**What:** Step-by-step walkthrough organized by developer goals, not technical components.
**When to use:** getting-started.md is the tutorial. New developer follows it sequentially.
**Structure:**
1. Prerequisites checklist (can I start?)
2. Installation (get it running)
3. First interaction (prove it works)
4. Understanding the flow (mental model)
5. Making a change (confidence builder)

**Anti-pattern:** Reference-style dump of all features without narrative flow.

### Pattern 3: Concept-Focused Patterns Documentation
**What:** Explain the "why" and "how" of architectural decisions, not the "what" (that's code).
**When to use:** patterns.md teaches the mental model and recurring patterns.
**Structure for this project:**
- Wallet integration pattern (Devnet auto-signing vs Leather extension)
- Contract interaction pattern (read-only queries vs public mutations)
- React Query pattern (query for reads, mutation for writes, cache invalidation)
- Network detection (how app adapts to Devnet/Testnet/Mainnet)

**Anti-pattern:** Copying code into docs without explaining when/why to use each pattern.

### Pattern 4: Deletion Guidance for Starter Kits
**What:** Explicit list of "what to delete when starting your own project."
**When to use:** extending.md must include this. Developers need permission to delete example code.
**Structure:**
- What's scaffolding (keep: providers, utilities, config)
- What's example (delete: counter contract, counter UI, counter queries)
- What's your code (modify: constants, contract references)

**Source:** Validated by community research showing successful starter kits explicitly list "remove this when starting fresh."

### Pattern 5: Link to Source Files, Don't Inline Code
**What:** Reference source files with GitHub URLs or relative paths instead of copying code into docs.
**When to use:** User has decided this for maintainability. When code changes, inline docs go stale.
**Implementation:**
```markdown
See how wallet connection works in [src/components/wallet/connect-button.tsx](../front-end/src/components/wallet/connect-button.tsx).

For the full pattern, review [useCounterValue](../front-end/src/hooks/counterQueries.ts) which demonstrates read-only contract queries.
```

**Tradeoff:** Links require clicking through (less copy-paste convenient) but stay accurate as code evolves. For starter kits, accuracy > convenience because out-of-date examples break trust.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown linting | Custom doc validator | markdownlint-cli | Mature tool with 100+ rules, GitHub Actions integration, used by Microsoft/Google |
| Link checking | Manual verification | markdown-link-check or markdownlint | Automated link validation catches 404s before users do |
| Consistent formatting | Style guide enforcement | markdownlint with .markdownlint.json config | Automated enforcement, integrates with git hooks/CI |
| Code example sync | Manual updates | CI tests that actually run code examples | If example code can't execute, it's wrong |

**Key insight:** Documentation tooling is mature. Don't build custom validators or formatters. Use markdownlint for markdown quality, and if examples must be inline, write tests that verify they compile/run.

## Common Pitfalls

### Pitfall 1: Assuming Knowledge Instead of Stating Prerequisites
**What goes wrong:** Documentation says "npm install" without listing Node.js version, or assumes React/TypeScript knowledge.
**Why it happens:** Writers are experts who forget what beginners don't know.
**How to avoid:** User's decision to include "detailed prerequisites: list Node.js, pnpm, Clarinet, plus React/TypeScript/Stacks knowledge with learning links" directly addresses this.
**Warning signs:** GitHub issues asking "what version of Node?" or "do I need to know Solidity?"

### Pitfall 2: Documentation Becoming Stale
**What goes wrong:** Code changes, docs don't. Developers follow docs, code doesn't match, trust erodes.
**Why it happens:** Docs treated as separate artifact, not updated in same PR as code changes.
**How to avoid:**
- Update docs in same commit as code changes
- Link to source files instead of inline code (user's decision)
- Test that example commands actually work in CI
**Warning signs:** GitHub issues with "docs say X but code does Y"

### Pitfall 3: Vague Writing and Missing Context
**What goes wrong:** Instructions like "configure the contract" without saying which file, what values, or why.
**Why it happens:** Writer knows the context, assumes reader does too.
**How to avoid:**
- Use absolute references: "Edit `front-end/src/constants/contracts.ts`" not "edit the constants"
- Explain why: "Update CONTRACT_ADDRESS because devnet resets addresses on each restart"
- Test docs with someone unfamiliar with the project
**Warning signs:** GitHub issues asking "where do I configure X?" or "what should this value be?"

### Pitfall 4: Poor Organization and Navigation
**What goes wrong:** Wall of text with no structure, or jumping between topics illogically.
**Why it happens:** Lack of planning before writing (research confirms this is #1 mistake).
**How to avoid:**
- Outline before writing (user has discretion on exact section headings)
- Use consistent heading hierarchy (# for title, ## for major sections, ### for subsections)
- Use task-based organization for getting-started (user's first session = setup + first change)
- Use concept-based organization for patterns (group by architectural concern)
**Warning signs:** Developers skip reading and jump straight to code/issues.

### Pitfall 5: Kitchen Sink README
**What goes wrong:** README becomes 1000+ lines trying to document everything inline.
**Why it happens:** Fear that developers won't click through to detailed docs.
**How to avoid:** User's decision for "minimal README: quick start, project structure, links to docs/" directly addresses this. README is the menu, docs/ files are the meal.
**Warning signs:** README takes more than 5 minutes to scan (research goal: understand in 5 min).

### Pitfall 6: No "What to Delete" Guidance for Starter Kits
**What goes wrong:** Developers unsure what's example vs scaffolding, either keep everything (bloat) or delete too much (breaks).
**Why it happens:** Starter kit authors focus on showing features, forget deletion is a feature.
**How to avoid:** User's decision to include explicit "delete the example" section in extending.md addresses this. Must list:
- Keep (providers, utilities, config patterns)
- Delete (counter.clar, counter components, counter queries)
- Modify (constants/contracts.ts to point to your contract)
**Warning signs:** GitHub issues asking "can I remove the counter example?" or "I deleted X and now nothing works"

### Pitfall 7: Missing Troubleshooting for Common Issues
**What goes wrong:** Developers hit known issues (Devnet not running, wallet not connecting) and get stuck.
**Why it happens:** Authors know the workarounds, forget to document them.
**How to avoid:** Research shows troubleshooting sections should include built-in errors and common problems reported to support. For this project:
- Devnet-specific: "Contract not found" = Devnet not started or not deployed
- Wallet-specific: "Transaction failed" = Wrong network selected in Leather
- Build errors: "Module not found" = npm install not run or node_modules deleted
**Warning signs:** Repeated support questions about the same issue.

User has discretion on whether to include troubleshooting sections. Recommendation: Yes, include troubleshooting subsection in getting-started.md for the 3-5 most common blockers based on anticipated issues (Devnet not running, wallet connection, API key not set).

## Code Examples

For a documentation phase, the "code examples" are patterns for structuring documentation content.

### README Quick Start Pattern
```markdown
## Quick Start

1. **Prerequisites**
   - Node.js 18+ ([download](https://nodejs.org))
   - pnpm ([install guide](https://pnpm.io/installation))
   - Clarinet ([docs](https://docs.hiro.so/clarinet))

2. **Install and Run**
   ```bash
   pnpm install
   cp front-end/.env.example front-end/.env
   # Add your Hiro Platform API key to .env
   pnpm --filter front-end dev
   ```

3. **Open http://localhost:3000**

See [docs/getting-started.md](docs/getting-started.md) for detailed setup.
```

**Pattern:** Numbered list of minimal steps. Each step is actionable. Prerequisites listed first with download links. Link to detailed guide at end.

### Getting Started First Interaction Pattern
```markdown
## Verify It Works

1. Open http://localhost:3000
2. Check that the counter displays "0"
3. Click "Increment"
4. Watch the counter update to "1"

**What just happened:**
- Your browser called a Clarity smart contract
- The contract incremented its counter variable
- React Query refetched the new value
- The UI updated automatically

See [patterns.md](patterns.md) to understand the full flow.
```

**Pattern:** Concrete steps to prove the app works. Then explain what happened conceptually. Link to deeper explanation.

### Patterns Documentation Structure
```markdown
## Wallet Integration Pattern

**Context:** Stacks dApps need to connect wallets for transaction signing.

**The Pattern:**
- Devnet: Auto-sign with pre-funded wallets (no extension)
- Testnet/Mainnet: Connect Leather wallet (user signs)

**Implementation:**
See [src/components/providers/wallet-provider.tsx](../front-end/src/components/providers/wallet-provider.tsx) for the wallet context that handles both modes.

**When to use which:**
- Devnet: Fast iteration, testing contract logic
- Testnet: Test with real wallet extension
- Mainnet: Production

**Related patterns:**
- Transaction signing differs: useIncrementCounter shows both code paths
```

**Pattern:** Name the pattern, give context (why it exists), explain the pattern, link to implementation, explain when to use, link to related patterns.

### Extending Documentation Pattern
```markdown
## Replace the Counter Example

The counter is example code to demonstrate contract interaction. To start your project:

**1. Delete Example Code**
```bash
rm clarity/contracts/counter.clar
rm -rf front-end/src/hooks/counterQueries.ts
rm front-end/src/components/counter-display.tsx
```

**2. Keep Scaffolding** (these power any contract interaction)
- `src/components/providers/` - Wallet and React Query setup
- `src/lib/contract-utils.ts` - Transaction helpers
- `src/lib/stacks-api.ts` - API client setup

**3. Add Your Contract**
1. Write your contract in `clarity/contracts/your-contract.clar`
2. Update `clarity/deployments/default.devnet-plan.yaml`
3. Update `front-end/src/constants/contracts.ts`
4. Create hooks in `front-end/src/hooks/yourContractQueries.ts` (follow counter pattern)

See [patterns.md#creating-contract-queries](patterns.md#creating-contract-queries) for query hook patterns.
```

**Pattern:** Explicit deletion instructions with commands. Explicit keep instructions with rationale. Step-by-step replacement with links to patterns.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single massive README | README + docs/ folder | ~2020 | Separation of quick start (README) from tutorials (docs/) improves scanability |
| Inline code examples | Links to source + tests | ~2023 | Code stays accurate, tests verify examples work |
| "Just read the code" | Progressive disclosure | Always | Docs are the onboarding ramp, code is the destination |
| Docs as afterthought | Docs in same PR as code | ~2022 | Treating docs like code keeps them current |
| Copy-paste snippets | "See file X for pattern Y" | 2024-2025 | Acknowledges AI assistants can read source files, docs explain concepts |

**Deprecated/outdated:**
- Inline code snippets without source links (goes stale)
- README-only documentation for projects with >1 concept to explain
- Documentation without testing (broken examples worse than no examples)

**State-of-the-art in 2026:**
- AI coding assistants (GitHub Copilot, Cursor, Claude) change documentation needs: less copy-paste snippets, more conceptual explanation of "why" and "when" since AI can read code
- Documentation is increasingly treated like code: version controlled, reviewed in PRs, tested in CI
- Progressive disclosure: README = 5-minute overview, docs = deep dive

## Open Questions

1. **Troubleshooting depth**
   - What we know: Research shows troubleshooting guides should cover common issues, prioritize frequent problems
   - What's unclear: Exact issues won't be known until developers use starter kit
   - Recommendation: Include placeholder troubleshooting section in getting-started.md with 3-5 anticipated issues (Devnet not running, API key missing, wallet not connecting). User has discretion on this (Claude's Discretion in CONTEXT.md).

2. **Prerequisites link detail**
   - What we know: User decided to include learning resource links for React/TypeScript/Stacks knowledge
   - What's unclear: How detailed these links should be (official docs only vs curated tutorial list)
   - Recommendation: Single authoritative link per prerequisite (official docs/getting started). User has discretion on depth (Claude's Discretion in CONTEXT.md).

3. **Section heading specificity**
   - What we know: User wants concise/technical tone, 3-file structure decided
   - What's unclear: Exact section headings within each doc
   - Recommendation: Use standard headings from research patterns (Quick Start, Prerequisites, Project Structure for README; Setup, Verify It Works, Understanding the Flow for getting-started.md; Wallet Integration Pattern, Contract Query Pattern, etc for patterns.md; Replace Example, Add Your Contract for extending.md). User has discretion on exact headings (Claude's Discretion in CONTEXT.md).

## Sources

### Primary (HIGH confidence)
- [Top 7 Code Documentation Best Practices for Teams (2026)](https://www.qodo.ai/blog/code-documentation-best-practices-2026/) - Best practices for 2026
- [10 Essential Technical Documentation Best Practices for 2026](https://www.documind.chat/blog/technical-documentation-best-practices) - Current year best practices
- [GitHub's Documentation Best Practices](https://github.blog/developer-skills/documentation-done-right-a-developers-guide/) - Official GitHub guidance
- [Google Markdown Style Guide](https://google.github.io/styleguide/docguide/style.html) - Authoritative style reference
- [GitHub basic Markdown syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) - Official Markdown reference

### Secondary (MEDIUM confidence - WebSearch verified)
- [Developer Onboarding Best Practices](https://document360.com/blog/developer-onboarding-best-practices/) - Onboarding patterns
- [README Best Practices](https://github.com/jehna/readme-best-practices) - Community README standards
- [Common Technical Writing Mistakes](https://www.archbee.com/blog/technical-writing-mistakes) - Pitfall patterns
- [Troubleshooting Documentation Best Practices](https://daily.dev/blog/developer-troubleshooting-docs-best-practices) - When to include troubleshooting
- [Starter Kits: Making the case](https://medium.com/geekculture/starter-kits-making-the-case-2427de84d8e7) - What to delete guidance

### Tertiary (LOW confidence - WebSearch only, patterns validated by multiple sources)
- [markdownlint tool](https://github.com/DavidAnson/markdownlint) - Markdown linting
- Multiple sources on documentation structure patterns (consistent across 10+ search results)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Markdown and git are universal, no version concerns
- Architecture patterns: HIGH - Patterns validated across multiple authoritative sources (GitHub, Google, recent 2026 articles), aligned with user's CONTEXT.md decisions
- Pitfalls: HIGH - Common mistakes validated across multiple technical writing sources, research shows consistent patterns
- Code examples: HIGH - Adapted from standard documentation patterns, customized to user's decided structure

**Research date:** 2026-01-28
**Valid until:** 90 days (documentation best practices are stable, but starter kit specifics should be validated against actual usage)

**Notes:**
- User decisions from CONTEXT.md are locked and researched accordingly (minimal README, 3-file docs structure, link to source files, concise tone)
- Claude's discretion areas identified: exact section headings, prerequisite link depth, whether to include troubleshooting
- No libraries or tools required for this phase (pure Markdown documentation)
- Research focused on documentation patterns, not technical implementation (no code to verify)
