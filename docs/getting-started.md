# Getting Started

Complete setup walkthrough from clone to working counter.

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** - [Download](https://nodejs.org)
- **pnpm** - Install with `npm install -g pnpm` or see [pnpm.io/installation](https://pnpm.io/installation)
- **Clarinet** - [Installation guide](https://docs.hiro.so/clarinet/getting-started)
- **Docker Desktop** - Required for local devnet - [Download](https://www.docker.com/products/docker-desktop)
- **Basic familiarity** with [React](https://react.dev/learn), [TypeScript](https://www.typescriptlang.org/docs/handbook/), and [Stacks concepts](https://docs.stacks.co/concepts)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/stacks-starter.git
cd stacks-starter
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp front-end/.env.example front-end/.env
```

### 4. Start local devnet

In a terminal, start the local blockchain:

```bash
cd clarity && clarinet devnet start
```

Wait for the devnet to initialize. You'll see blocks being mined. Around block 45, the Counter contract will be deployed.

**Tip:** The Stacks Explorer is available at http://localhost:8000 to browse blocks and transactions.

### 5. Start the development server

In a new terminal (keep devnet running):

```bash
pnpm --filter front-end dev
```

### 6. Open the app

Navigate to [http://localhost:3000](http://localhost:3000)

## Verify It Works

1. The counter should display **0**
2. Click **Increment**
3. Watch the button show a pending state while the transaction confirms
4. The counter updates to **1**
5. Click **Decrement**
6. The counter returns to **0**

**What just happened:**
- Your browser called a Clarity smart contract on Devnet
- The contract updated its counter state variable
- React Query detected the change and refetched the value
- The UI updated automatically

## Understanding the Flow

The starter demonstrates three core patterns:

**Wallet Connection**
- On Devnet: Auto-signs transactions with pre-funded test wallets (no browser extension needed)
- On Testnet/Mainnet: Connects to Leather wallet for user signing

**Contract Reads**
- `useCounterValue` fetches the current counter from the contract
- React Query caches the result and handles refetching

**Contract Writes**
- `useIncrementCounter` and `useDecrementCounter` send transactions
- Mutations invalidate the cache to trigger a refetch

See [docs/patterns.md](patterns.md) for detailed architecture documentation.

**Source files:**
- Wallet integration: [front-end/src/components/providers/wallet-provider.tsx](../front-end/src/components/providers/wallet-provider.tsx)
- Contract queries: [front-end/src/hooks/counterQueries.ts](../front-end/src/hooks/counterQueries.ts)
- Contract addresses: [front-end/src/constants/contracts.ts](../front-end/src/constants/contracts.ts)
- Counter contract: [clarity/contracts/counter.clar](../clarity/contracts/counter.clar)

## Making a Change

Try modifying the counter contract to verify your setup works end-to-end.

### 1. Open the contract

Edit `clarity/contracts/counter.clar`

### 2. Change the increment amount

Find the `increment` function and change `u1` to `u5`:

```clarity
(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u5))
    (ok (var-get counter))
  )
)
```

### 3. Restart Devnet

Contract changes require redeployment:

1. Stop the running devnet (Ctrl+C in the terminal)
2. Start devnet again: `cd clarity && clarinet devnet start`

The updated contract will be deployed fresh.

### 4. Test the change

1. Refresh [http://localhost:3000](http://localhost:3000)
2. Click **Increment**
3. Counter now increases by 5 instead of 1

## Troubleshooting

### "Contract not found" error

**Cause:** Devnet is not running or contracts haven't deployed yet.

**Fix:**
1. Check if devnet is running (`clarinet devnet start` in a terminal)
2. Wait for contracts to deploy (check terminal output for block ~45)
3. Check the Stacks Explorer at http://localhost:8000

### "Transaction failed" error

**Cause:** Network mismatch between app and wallet.

**Fix:**
1. Verify your `.env` has `NEXT_PUBLIC_STACKS_NETWORK=devnet`
2. Restart the dev server after changing `.env`

### Counter shows error state

**Cause:** Cannot reach local devnet API.

**Fix:**
1. Is Docker running?
2. Is devnet started? (`clarinet devnet start` in clarity/ folder)
3. Check terminal output for errors

### Changes to contract not appearing

**Cause:** Devnet needs restart for contract changes.

**Fix:**
1. Stop devnet (Ctrl+C)
2. Start devnet again: `clarinet devnet start`
3. Contract will be redeployed from fresh state
