# Stacks Starter

A minimal starter kit for building dApps on Stacks. Connect a wallet, interact with a smart contract, and understand the patterns.

## Prerequisites

- [Node.js 18+](https://nodejs.org)
- [pnpm](https://pnpm.io/installation)
- [Clarinet](https://docs.stacks.co/clarinet/overview) (for local contract development)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (required for local devnet)
- Basic knowledge of [React](https://react.dev), [TypeScript](https://www.typescriptlang.org/docs/), and [Stacks](https://docs.stacks.co)

Working with Claude Code? Check out the [Stacks Claude Code Plugin](https://github.com/kenny-stacks/stacks-claude-plugin).

## Quick Start

There are two primary folders in the starter kit, `clarity` and `front-end`. `clarity` is your Clarinet smart contract structure, and `front-end` contains all of your front end files. Make sure you run the relevant commands to get everything started in the right folders.

Alternatively, if you are using Claude Code, you can install the plugin (linked above) which has a built-in command to get your dev server started in the background. This is extremely helpful because it allows Clade Code to have visibility into your Clarinet devnet and your frontend.

```bash
cd front-end
pnpm install
cp .env.example .env
```

Start local devnet (requires Docker):

```bash
cd ../clarity && clarinet devnet start
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
