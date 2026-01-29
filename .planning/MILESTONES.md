# Project Milestones: Stacks Starter

## v1.1 Hiro Platform Migration (Shipped: 2026-01-29)

**Delivered:** Removed Hiro Platform hosted devnet dependency, simplified to local Clarinet devnet only.

**Phases completed:** 6 (2 plans total)

**Key accomplishments:**
- Removed all Hiro Platform API configuration and conditional logic
- Simplified devnet.ts to hardcoded localhost:3999
- Eliminated 2 platform-specific environment variables
- Updated README, getting-started, and extending docs for local workflow
- Added Docker Desktop as explicit prerequisite

**Stats:**
- 11 files modified
- 1 phase, 2 plans
- 1 day from start to ship

**Git range:** `d593f7f` → `6db194a`

**What's next:** Project complete as starter kit. Future enhancements could include additional contract examples (NFT, token), GitHub Actions CI, or deployment guides.

---

## v1 MVP (Shipped: 2026-01-29)

**Delivered:** Minimal starter kit for building dApps on the Stacks blockchain with wallet integration, multi-network support, and contract interaction patterns.

**Phases completed:** 1-5 (15 plans total)

**Key accomplishments:**
- Replaced Chakra UI with shadcn/Tailwind for modern, customizable UI foundation
- Built unified wallet provider supporting Leather (testnet/mainnet) and devnet wallet selector
- Created counter smart contract demonstrating read/write patterns with React Query hooks
- Established comprehensive documentation (README, getting-started, patterns, extending guides)
- Dark mode with no hydration flash via next-themes

**Stats:**
- 118 files created/modified
- 3,477 lines of code (TypeScript + Clarity)
- 5 phases, 15 plans
- 2 days from start to ship

**Git range:** `7fd7055` (Initial commit) → `366ea9c` (docs(05): complete Documentation & Polish phase)

**What's next:** Project complete as MVP. Future enhancements could include additional contract examples (NFT, token), GitHub Actions CI, or deployment guides.

---
