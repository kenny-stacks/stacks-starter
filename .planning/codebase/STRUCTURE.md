# Codebase Structure

**Analysis Date:** 2026-01-28

## Directory Layout

```
stacks-starter/
├── clarity/                    # Smart contract workspace
│   ├── contracts/
│   │   └── fundraising.clar    # Main campaign contract (Clarity)
│   ├── tests/                  # Contract tests
│   ├── deployments/            # Deployment configurations
│   ├── settings/               # Network settings
│   ├── Clarinet.toml           # Clarinet project config
│   ├── package.json            # Dependencies (vitest)
│   └── vitest.config.js        # Test runner config
│
├── front-end/                  # Next.js React frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── page.tsx        # Home page (server component)
│   │   │   ├── layout.tsx       # Root layout with providers
│   │   │   └── globals.css      # Global styles
│   │   │
│   │   ├── components/         # React components
│   │   │   ├── ui/
│   │   │   │   └── Providers.tsx        # Query client, Chakra, wallet providers
│   │   │   ├── CampaignDetails.tsx      # Main campaign display component
│   │   │   ├── DonationModal.tsx        # Donation form modal
│   │   │   ├── CampaignAdminControls.tsx # Admin controls
│   │   │   ├── Navbar.tsx               # Navigation bar
│   │   │   ├── ConnectWallet.tsx        # Hiro wallet connection
│   │   │   ├── DevnetWalletButton.tsx   # Devnet wallet selector
│   │   │   ├── DevnetWalletProvider.tsx # Devnet wallet context provider
│   │   │   ├── HiroWalletProvider.tsx   # Hiro wallet context provider
│   │   │   └── StyledMarkdown.tsx       # Markdown renderer with Chakra styles
│   │   │
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── campaignQueries.ts       # Campaign data queries (useCampaignInfo, useExistingDonation)
│   │   │   ├── chainQueries.ts          # Blockchain queries (useCurrentBtcBlock)
│   │   │   └── useTransactionExecuter.tsx # Transaction execution hook
│   │   │
│   │   ├── lib/                # Utilities and helpers
│   │   │   ├── stacks-api.ts            # Stacks API client configuration and factory
│   │   │   ├── contract-utils.ts        # Contract execution, network detection
│   │   │   ├── campaign-utils.ts        # Transaction builders (donate, withdraw, refund, etc.)
│   │   │   ├── currency-utils.ts        # Currency conversion, price fetching
│   │   │   ├── devnet-wallet-context.ts # Devnet wallet definitions and context
│   │   │   ├── address-utils.ts         # Address validation/formatting
│   │   │   ├── clarity-utils.ts         # Clarity value serialization
│   │   │   └── (other utilities)
│   │   │
│   │   ├── constants/          # Configuration constants
│   │   │   ├── contracts.ts    # Contract addresses, names (network-dependent)
│   │   │   ├── campaign.ts     # Campaign title, subtitle
│   │   │   ├── devnet.ts       # Devnet-specific config
│   │   │   └── (other constants)
│   │   │
│   │   └── theme.ts            # Chakra theme configuration
│   │
│   ├── public/                 # Static assets
│   │   ├── campaign/           # Campaign carousel images (user-provided)
│   │   └── campaign-details.md # Campaign markdown content
│   │
│   ├── package.json            # Dependencies (Next.js, React, Stacks, Chakra, React Query)
│   ├── tsconfig.json           # TypeScript configuration
│   ├── next.config.ts          # Next.js configuration
│   ├── .eslintrc.json          # ESLint config
│   └── .prettierrc              # Prettier config
│
├── .planning/                  # GSD planning documents
│   └── codebase/               # Architecture analysis
│
├── .devcontainer/              # Dev container configuration
├── package.json                # Root workspace config (monorepo)
├── package-lock.json
├── metadata.json               # Project metadata
└── README.md
```

## Directory Purposes

**`clarity/`:**
- Purpose: Stacks smart contract package; contains Clarity contract definition
- Contains: Contract source, tests, deployment configs for different networks
- Key files: `clarity/contracts/fundraising.clar` (single contract)
- Entry point: Deployed via Clarinet; interacted with by frontend via HTTP API

**`front-end/`:**
- Purpose: Next.js React application serving the fundraising UI
- Contains: Components, hooks, utilities, configuration, assets
- Build output: Compiled to `.next/` (not in version control)
- Entry point: `front-end/src/app/page.tsx` via Next.js router

**`front-end/src/app/`:**
- Purpose: Next.js App Router directory; defines pages and layouts
- `page.tsx`: Home page; server component that loads campaign data from file system
- `layout.tsx`: Root layout; wraps entire app with providers (React Query, Chakra, wallets)

**`front-end/src/components/`:**
- Purpose: Reusable and page-specific React components
- `CampaignDetails.tsx`: Core component; displays campaign state, handles donation modal
- `DonationModal.tsx`: Form for donation input; converts USD to on-chain amounts
- `CampaignAdminControls.tsx`: Initialize, cancel, withdraw functions (admin only)
- Providers: Wallet and theme context providers injected at root
- UI components: Navbar, buttons, wallet selectors

**`front-end/src/hooks/`:**
- Purpose: Custom hooks encapsulating data fetching and side effects
- `campaignQueries.ts`: Two hooks for campaign state and user donations
- `chainQueries.ts`: Hook for current Bitcoin block height (via Stacks API)
- `useTransactionExecuter.tsx`: Factory hook returning async transaction executor function

**`front-end/src/lib/`:**
- Purpose: Shared utilities for contract interaction, currency, API, wallet logic
- `contract-utils.ts`: Core functions for executing/opening contract calls; network detection
- `campaign-utils.ts`: Transaction builders for all campaign functions
- `currency-utils.ts`: Conversion functions (STX ↔ microSTX, USD ↔ STX/sBTC); price fetcher
- `stacks-api.ts`: API client factory; abstracts Stacks blockchain API
- `devnet-wallet-context.ts`: Devnet wallet definitions; context provider component

**`front-end/src/constants/`:**
- Purpose: Centralize configuration that varies by network
- `contracts.ts`: Contract address and name; selects deployer address per NEXT_PUBLIC_STACKS_NETWORK
- `campaign.ts`: Campaign title, subtitle (hardcoded)
- `devnet.ts`: Devnet-specific URLs and network object

**`public/`:**
- Purpose: Static assets served directly by Next.js
- `campaign/`: Directory for user-provided carousel images
- `campaign-details.md`: Markdown file read server-side and passed to StyledMarkdown component

## Key File Locations

**Entry Points:**
- `front-end/src/app/page.tsx`: Initial page load; server component
- `front-end/src/app/layout.tsx`: Root layout; provider setup
- `clarity/contracts/fundraising.clar`: Smart contract; deployed once, interacted with via transactions

**Configuration:**
- `front-end/.env.local`: Runtime environment variables (NEXT_PUBLIC_STACKS_NETWORK, contract addresses)
- `front-end/tsconfig.json`: Path aliases (@/ → src/)
- `front-end/next.config.ts`: Next.js configuration (minimal)
- `clarity/Clarinet.toml`: Clarity project config

**Core Logic:**
- `front-end/src/lib/contract-utils.ts`: Transaction execution dispatch (devnet vs. web3 extension)
- `front-end/src/lib/campaign-utils.ts`: Transaction builders
- `front-end/src/hooks/campaignQueries.ts`: Campaign state queries
- `clarity/contracts/fundraising.clar`: Campaign state and function implementations

**Testing:**
- `clarity/tests/`: Clarity contract tests
- `clarity/vitest.config.js`: Clarity test runner configuration

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `CampaignDetails.tsx`, `Navbar.tsx`)
- Hooks: camelCase starting with `use` (e.g., `useCampaignInfo.ts`, `useTransactionExecuter.tsx`)
- Utilities: camelCase (e.g., `contract-utils.ts`, `currency-utils.ts`)
- Constants: camelCase (e.g., `contracts.ts`, `campaign.ts`)
- Pages: lowercase (e.g., `page.tsx`)

**Directories:**
- Feature directories (components, hooks, lib, constants): lowercase plural (e.g., `components/`, `hooks/`)
- Nested by feature: `ui/` subdir for shared UI components

**TypeScript/React:**
- Interfaces: PascalCase with optional suffix (e.g., `CampaignInfo`, `DevnetWalletContextType`)
- Types: PascalCase (e.g., `Network`)
- Functions: camelCase (e.g., `getContractIdentifier()`, `useCampaignInfo()`)
- Variables: camelCase (e.g., `campaignGoal`, `donationAmount`)
- Constants: UPPER_SNAKE_CASE for truly constant values (e.g., `DEFAULT_DURATION`); camelCase for objects (e.g., `presetAmounts`)

**Clarity:**
- Functions: kebab-case (e.g., `initialize-campaign`, `donate-stx`)
- Maps: kebab-case (e.g., `stx-donations`, `sbtc-donations`)
- Data vars: kebab-case (e.g., `is-campaign-initialized`)
- Error constants: UPPER_SNAKE_CASE with `err-` prefix (e.g., `err-not-authorized`)

## Where to Add New Code

**New Feature (e.g., Discord notifications):**
- Primary code: `front-end/src/lib/` for integration logic (e.g., `discord-utils.ts`)
- Hook: `front-end/src/hooks/` for data fetching or side effects (e.g., `useDiscordNotification.tsx`)
- Constants: `front-end/src/constants/` if configuration needed (e.g., `discord.ts`)

**New Component/Module:**
- Implementation: `front-end/src/components/` for UI, `front-end/src/lib/` for logic
- Related hook: `front-end/src/hooks/` if component needs queries or side effects
- Tests: `front-end/src/__tests__/` or co-located with feature (not yet established)

**New Utility:**
- Shared helpers: `front-end/src/lib/` (utility files follow `entity-utils.ts` pattern)
- Type-only utilities: Inline in same file or create `types.ts` if module-level

**Smart Contract Changes:**
- Public/read-only functions: Add to `clarity/contracts/fundraising.clar`
- Tests: Add to `clarity/tests/fundraising.test.ts`
- New contract: Create new `.clar` file in `clarity/contracts/`; update Clarinet.toml

**Styling:**
- Component styles: Chakra UI style props (inline via `sx`, `p`, `gap`, etc.)
- Theme: `front-end/src/theme.ts` for global Chakra overrides
- Globals: `front-end/src/app/globals.css` for CSS resets or global styles

**Configuration:**
- Network-dependent settings: `front-end/src/constants/contracts.ts` or `devnet.ts`
- Environment variables: `.env.local` (not committed); document in `.env.example`
- Stacks API: `front-end/src/lib/stacks-api.ts` (factory pattern; reuse getApi())

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: Yes (by mapper agent)
- Committed: Yes

**`.devcontainer/`:**
- Purpose: Dev container configuration for reproducible environment
- Generated: No
- Committed: Yes

**`clarity/.cache/`:**
- Purpose: Clarity build artifacts and dependency cache
- Generated: Yes (by Clarinet)
- Committed: No

**`front-end/.next/`:**
- Purpose: Next.js build output
- Generated: Yes (by `npm run build`)
- Committed: No

---

*Structure analysis: 2026-01-28*
