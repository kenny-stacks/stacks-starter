# Feature Landscape

**Domain:** Blockchain/Web3 dApp Starter Kit (Stacks)
**Researched:** 2026-01-28

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Wallet Connection | Core dApp functionality - users need to authenticate and sign transactions | Low | Multi-wallet support standard (Hiro extension for testnet/mainnet, devnet wallets for local dev) |
| Network Switching | Developers need to test across devnet/testnet before mainnet deployment | Low | Environment-based configuration is sufficient; no need for runtime network switching |
| Simple Demo Contract | Developers need a working example to understand patterns | Low | Counter contract is ideal: shows read-only calls + state-changing transactions |
| Contract Read Operations | All dApps query blockchain state | Low | Pattern for calling read-only contract functions via Stacks API |
| Contract Write Operations | All dApps execute transactions | Medium | Pattern for building, signing, and broadcasting transactions; includes post-conditions |
| Transaction Status | Users need feedback when transactions are processing | Medium | Polling for transaction confirmation; showing pending/success/error states |
| Basic Documentation | Developers need setup instructions and architecture explanation | Low | README with quick start + docs folder with patterns |
| Working Example UI | Need to see contract interaction in action | Low | Minimal UI showing wallet connection + contract calls (no styling required) |
| TypeScript Support | TypeScript is standard in modern web3 development | Low | Types for contracts, transactions, and API responses |
| Local Development Setup | Developers need to run without deploying to testnet first | Medium | Devnet support via Hiro Platform or local Clarinet; pre-funded test wallets |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Multi-Network Abstraction | Single codebase works across devnet/testnet/mainnet without code changes | Low | Environment variable configuration pattern (existing in current codebase) |
| Devnet Wallet Selector | Test with 6 different wallets locally without browser extension | Medium | Huge DX win for local development; avoids extension setup friction |
| React Query Integration | Production-ready state management for blockchain data | Low | Handles caching, refetching, error states; better than raw useEffect |
| Contract Testing Setup | Vitest + Clarinet SDK configured out of the box | Medium | Most starters skip testing; this shows professional patterns |
| Modern Frontend Stack | Next.js 15 + React 19 + shadcn/Tailwind | Low | Current stack, not bleeding-edge experimental |
| Post-Condition Examples | Shows how to add safety to transactions | Medium | Critical for production apps but often missing from starters |
| Environment-Based Config | Clean pattern for managing network-specific addresses/endpoints | Low | Better than hardcoding addresses in components |
| TypeScript Strict Mode | Catch errors at compile time, not runtime | Low | Shows best practices from the start |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Multiple Example Contracts | Overwhelms developers; unclear which patterns to follow | One simple counter contract that demonstrates core patterns |
| Complex UI Components | Starter becomes a component library; high maintenance burden | Minimal shell UI with shadcn basics; developers add their own |
| Built-in Backend/API | Out of scope for blockchain starter; adds unnecessary complexity | Direct blockchain interaction only; document API patterns if needed |
| Token/NFT Features | Domain-specific; not universally needed; adds conceptual overhead | Keep demo contract generic (counter); link to token examples in docs |
| Price Feeds/Oracles | Advanced feature requiring external dependencies | Exclude from core; can document as extension pattern |
| Authentication Beyond Wallet | Wallet IS authentication in web3; additional auth adds confusion | Wallet connection only; document session management patterns separately |
| Pre-Styled Marketing Pages | Developers will delete everything; wastes their time and yours | Functional starter with minimal styling; developers customize |
| Multiple Smart Contract Examples | Forces choice paralysis; harder to understand patterns | One contract, clear patterns, extensible architecture |
| Over-Engineered Abstraction | Premature optimization makes code harder to learn | Clear, simple patterns that developers can understand and modify |
| "Everything but the kitchen sink" | Trying to demonstrate every possible feature | Minimal viable example that teaches core concepts |

## Feature Dependencies

```
Network Configuration
├── Wallet Connection (depends on network type)
│   ├── Devnet Wallet Selector (devnet only)
│   └── Hiro Wallet Provider (testnet/mainnet only)
│
├── Contract Interaction
│   ├── Read Operations (requires network config + API client)
│   └── Write Operations (requires wallet connection)
│       └── Transaction Status (requires write operations)
│
├── Demo UI
│   ├── Wallet Connection Button (requires wallet provider)
│   ├── Contract Display (requires read operations)
│   └── Contract Interaction (requires write operations)
│
└── Testing Setup
    └── Contract Tests (requires Clarinet + Vitest config)
```

**Critical Path:** Network Config → Wallet Connection → Contract Interaction → Demo UI

**Optional Path:** Testing Setup (parallel to main features)

## MVP Recommendation

For MVP starter kit, prioritize:

1. **Network Configuration** - Multi-network support via environment variables
2. **Wallet Connection** - Both devnet selector and Hiro extension integration
3. **Counter Contract** - Simple read (get-count) + write (increment) example
4. **Contract Read Pattern** - Querying contract state with React Query
5. **Contract Write Pattern** - Building and executing transactions
6. **Transaction Status** - Basic pending/success/error feedback
7. **Minimal UI Shell** - Navbar with wallet connection + counter display with increment button
8. **Quick Start README** - Setup instructions, architecture overview, next steps
9. **Contract Testing** - Basic Vitest setup with one counter test
10. **TypeScript Throughout** - Types for all contract interactions

Defer to post-MVP:

- **Advanced Documentation**: Deep dives into architecture patterns, extending the starter (reason: developers can start without this; add based on feedback)
- **Additional UI Components**: More complex layouts, styling options (reason: keeps starter minimal; developers customize anyway)
- **Advanced Contract Examples**: Token transfers, NFTs, multi-sig (reason: domain-specific; link to external examples instead)
- **CI/CD Pipeline**: Automated testing and deployment (reason: varies by deployment target; document separately)
- **Error Boundaries**: React error catching UI (reason: nice-to-have; developers can add)
- **Logging/Monitoring**: Structured logging, analytics (reason: production concern; not needed for starter)

## Feature Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Wallet Connection | Critical | Low | P0 |
| Network Configuration | Critical | Low | P0 |
| Demo Contract (Counter) | Critical | Low | P0 |
| Contract Read Pattern | Critical | Low | P0 |
| Contract Write Pattern | Critical | Medium | P0 |
| Devnet Wallet Selector | High | Medium | P1 |
| React Query Integration | High | Low | P1 |
| Transaction Status | High | Medium | P1 |
| Basic Documentation | High | Low | P1 |
| Contract Testing Setup | Medium | Medium | P2 |
| Post-Condition Examples | Medium | Medium | P2 |
| TypeScript Strict Mode | Medium | Low | P2 |
| Advanced Documentation | Low | High | P3 (defer) |
| Additional UI Components | Low | High | P3 (defer) |

## Stacks-Specific Considerations

### Essential for Stacks Starters

- **Clarity Language Examples**: Stacks uses Clarity, not Solidity - must show Clarity-specific patterns
- **STX Token Integration**: Native token (STX) is different from ERC-20; show STX transfer patterns
- **Bitcoin Block Awareness**: Stacks anchors to Bitcoin; some contracts need Bitcoin block height
- **Post-Conditions**: Stacks-specific safety feature; essential to demonstrate
- **Hiro Wallet Integration**: Dominant wallet for Stacks ecosystem; must support

### Stacks Ecosystem Advantages to Highlight

- **Clarity's Decidability**: No reentrancy attacks; contracts are auditable before deployment
- **Bitcoin Settlement**: L2 on Bitcoin provides security; worth explaining in docs
- **Stacks.js Library**: Well-documented SDK for frontend integration
- **Clarinet Testing**: Built-in testing framework; easier than Ethereum's test setup
- **Hiro Platform Devnet**: Hosted development blockchain; removes local setup friction

## Common Pitfalls to Avoid

Based on web3 starter kit research:

1. **Launching Without Testing Tools**: Developers will write contracts; must provide testing setup (include Vitest + Clarinet)
2. **Poor UX for Non-Technical Users**: Web3 already has steep learning curve; keep demo UI simple and clear (counter is perfect)
3. **Ignoring Security from Start**: Post-conditions and proper error handling should be in starter, not left as exercise (show best practices)
4. **Over-Engineering the Stack**: Don't include every possible library; use proven, stable tools (Stacks.js, React Query)
5. **Forgetting About Gas Costs**: Stacks transactions cost STX; demo should work with small amounts (counter is free to read, cheap to write)
6. **No Real-World Contract Example**: "Hello World" strings are toy examples; counter shows actual state management (read/write state pattern)
7. **Unclear Next Steps**: Developers need to know what to build after cloning; include "extending this starter" guide (defer to post-MVP docs)
8. **Network Configuration Confusion**: Testnet/mainnet differences trip up developers; abstract network config cleanly (existing pattern is good)

## Validation Criteria

Starter kit succeeds if developers can:

- ✓ Clone repo and run locally within 5 minutes
- ✓ Connect wallet (devnet or extension) within 1 minute of app loading
- ✓ Read contract state and see counter value immediately
- ✓ Increment counter and see transaction confirm within 30 seconds (devnet)
- ✓ Understand transaction flow by reading contract-utils.ts patterns
- ✓ Write their own contract function by following counter example
- ✓ Switch networks by changing environment variable
- ✓ Run contract tests with single command (npm test)

## Sources

### Web3 Starter Kit Research
- [Blockchain Starter Kits](https://github.com/flowchain/blockchain-starter-kit) - Analysis of minimal starter kit requirements
- [Stacks.js Starters](https://github.com/hirosystems/stacks.js-starters) - Official Stacks frontend templates with minimal boilerplate
- [Introducing Stacks.js Starters](https://www.hiro.so/blog/introducing-stacks-js-starters-launch-a-frontend-in-just-a-few-clicks) - Philosophy: avoid extremes of "start from scratch" vs "delete everything"
- [Web3 Starter Kits - useWeb3.xyz](https://www.useweb3.xyz/starter-kits) - Survey of 20+ starter kits across ecosystems

### dApp Template Features
- [Opinionated Dapp Starter](https://github.com/jellydn/dapp-starter) - Feature-rich example: React, Next.js, Hardhat, TypeChain, web3-react
- [Web3 Boilerplate](https://github.com/Pedrojok01/Web3-Boilerplate) - Clean template with TypeScript 5, React 18, web3-react v8
- [List of 13 Dapp Templates](https://www.alchemy.com/dapps/best/dapp-templates) - Comparison of popular templates and their feature sets

### Stacks Ecosystem
- [Start Building on Stacks](https://www.stacks.co/build/get-started) - Official Stacks developer portal
- [Stacks Documentation](https://docs.stacks.co) - Getting started guides, Clarity crash course, API reference
- [Clarity Smart Contracts Examples](https://github.com/friedger/clarity-smart-contracts) - Collection of real Clarity contracts

### Best Practices & Pitfalls
- [Building Your First Web3 Startup: 10 Common Mistakes](https://syndika.co/blog/building-your-first-web3-startup-10-common-mistakes-to-avoid/) - Lessons on avoiding over-engineering
- [Why Web3 Projects Fail](https://quecko.com/why-web3-projects-fail-common-mistakes-and-how-to-avoid-them) - Poor UX, ignoring security, launching tokens before products
- [Multi Chain DApp Development Guide 2026](https://www.calibraint.com/blog/multi-chain-dapp-development-guide-2026) - Complexity trade-offs in dApp templates

### Smart Contract Examples
- [Counter Contract in Solidity](https://dev.to/karthikaaax/build-a-simple-counter-smart-contract-in-solidity-emg) - Best practices for simple demo contracts
- [Clarity Crash Course](https://docs.stacks.co/get-started/clarity-crash-course) - Official tutorial for Clarity smart contracts
- [Clarity Hello World Tutorial](https://docs.hiro.so/tutorials/clarity-hello-world) - Hiro's getting started guide

**Research Confidence:** MEDIUM - WebSearch findings cross-referenced with official Stacks documentation and multiple community examples. Stacks-specific features verified against docs.stacks.co and Hiro documentation. General web3 patterns confirmed across multiple starter kit repositories.
