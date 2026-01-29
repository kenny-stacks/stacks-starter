# Stacks Starter

A minimal starter kit for building dApps on Stacks. Connect a wallet, interact with a smart contract, and understand the patterns.

## Prerequisites

- [Node.js 18+](https://nodejs.org)
- [pnpm](https://pnpm.io/installation)
- [Clarinet](https://docs.hiro.so/clarinet) (for local contract development)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (required for local devnet)
- Basic knowledge of [React](https://react.dev), [TypeScript](https://www.typescriptlang.org/docs/), and [Stacks](https://docs.stacks.co)

## Quick Start

```bash
pnpm install
cp front-end/.env.example front-end/.env
```

Start local devnet (requires Docker):

```bash
cd clarity && clarinet devnet start
```

Wait for contracts to deploy (watch for block ~45), then in a new terminal:

```bash
pnpm --filter front-end dev
```

Open [http://localhost:3000](http://localhost:3000).

See [docs/getting-started.md](docs/getting-started.md) for a detailed walkthrough.

## Project Structure

```
stacks-starter/
├── clarity/           # Clarity smart contracts
│   ├── contracts/     # Contract source files
│   ├── deployments/   # Deployment plans for devnet/testnet/mainnet
│   └── tests/         # Contract unit tests
├── front-end/         # Next.js application
│   └── src/
│       ├── app/           # Next.js app router pages
│       ├── components/    # React components
│       ├── constants/     # Contract addresses, network config
│       ├── hooks/         # React Query hooks for contract calls
│       └── lib/           # Utilities and API clients
└── docs/              # Documentation
```

## Documentation

- [Getting Started](docs/getting-started.md) - Setup tutorial and first steps
- [Architecture Patterns](docs/patterns.md) - Wallet, contract, and React Query patterns
- [Extending the Starter](docs/extending.md) - Replace the counter with your contract
