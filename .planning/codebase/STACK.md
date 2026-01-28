# Technology Stack

**Analysis Date:** 2026-01-28

## Languages

**Primary:**
- TypeScript 5.x - Used in both frontend and Clarity test projects
- Clarity 3.0 - Smart contract language for Stacks blockchain contracts

**Secondary:**
- JavaScript - Next.js configuration and ESLint setup
- JSX/TSX - React component markup in frontend

## Runtime

**Environment:**
- Node.js (LTS recommended) - Runtime for both frontend development and Clarity tests

**Package Manager:**
- npm - Used for dependency management with `package-lock.json` present at root

## Frameworks

**Core:**
- Next.js 15.1.7 - Full-stack React framework for frontend (`/Users/kenny/Code/stacks-starter/front-end`)
- React 19.0.0 - UI library and component framework

**UI Components:**
- Chakra UI 2.10.5 - Component library with `@chakra-ui/react` and `@chakra-ui/icons`

**Testing:**
- Vitest 3.1.3 - Test runner for Clarity contract tests (`/Users/kenny/Code/stacks-starter/clarity`)
- vitest-environment-clarinet 2.3.0 - Custom environment for running Clarity tests with simnet

**Build/Dev:**
- Vite (implicitly via Vitest) - Build tooling
- TypeScript 5.3.3+ - Language compilation
- Clarinet SDK 3.0.1 - Clarity contract development toolkit

## Key Dependencies

**Critical - Blockchain/Stacks Integration:**
- @stacks/blockchain-api-client 7.2.2 - Client for Stacks blockchain API queries
- @stacks/connect 8.1.9 - Wallet authentication and connection
- @stacks/transactions 7.0.2+ - Transaction creation and signing
- @stacks/network 7.0.2 - Network configuration management
- @stacks/wallet-sdk 7.0.4 - Wallet generation and management
- @hirosystems/clarinet-sdk 3.0.1 - Clarinet smart contract testing and simulation

**State & Data Fetching:**
- @tanstack/react-query 5.66.0 - Server state management and caching

**Other:**
- react-markdown 9.0.3 - Markdown rendering in React components
- timeago.js 4.0.2 - Relative time formatting
- chokidar-cli 3.0.0 - File watching for test automation

## Configuration

**Environment:**
- Environment variables defined in `.env.example` at `front-end/.env.example`
- Variables configured at build time with `NEXT_PUBLIC_` prefix for frontend exposure
- Key environment vars:
  - `NEXT_PUBLIC_STACKS_NETWORK` - Network selection (devnet/testnet/mainnet)
  - `NEXT_PUBLIC_DEVNET_HOST` - Devnet location (platform/local)
  - `NEXT_PUBLIC_PLATFORM_HIRO_API_KEY` - Hiro platform API key for devnet
  - `NEXT_PUBLIC_CONTRACT_DEPLOYER_TESTNET_ADDRESS` - Deployed contract address on testnet
  - `NEXT_PUBLIC_CONTRACT_DEPLOYER_MAINNET_ADDRESS` - Deployed contract address on mainnet

**Build:**
- `next.config.ts` - Next.js configuration at `front-end/next.config.ts` (currently minimal)
- `tsconfig.json` - TypeScript configuration with path alias `@/*` → `./src/*`
- `vitest.config.js` - Vitest configuration at `clarity/vitest.config.js` for Clarity tests
- `Clarinet.toml` - Clarity project configuration at `clarity/Clarinet.toml`

## Platform Requirements

**Development:**
- Node.js runtime
- npm package manager
- Terminal/shell environment
- Git for version control
- Optional: Hiro Clarinet IDE for smart contract development

**Production:**
- Deployment target: Web browser (Next.js frontend)
- Smart contracts deployed to: Stacks blockchain (devnet/testnet/mainnet)
- Backend API: Hiro Stacks Blockchain API (hosted service)
- Wallet connectivity: Browser-based (Hiro Wallet extension or Devnet wallets)

---

*Stack analysis: 2026-01-28*
