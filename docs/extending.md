# Extending the Starter Kit

The counter is example code to demonstrate contract interaction. This document explains what to keep, what to delete, and how to add your own contract.

## What's What

### Scaffolding (KEEP)

These files power any contract interaction:

| Directory/File | Purpose |
|---------------|---------|
| `front-end/src/components/providers/` | Wallet and React Query setup |
| `front-end/src/lib/` | Utility functions (API client, contract utils, network config) |
| `front-end/src/components/ui/` | shadcn UI components |
| `front-end/src/components/navbar.tsx` | Navigation shell |
| `front-end/src/components/theme-toggle.tsx` | Dark mode toggle |
| `front-end/src/components/wallet/` | Wallet connection components |

### Example Code (DELETE)

These files demonstrate the counter example:

| File | What it does |
|------|-------------|
| `clarity/contracts/counter.clar` | Example Clarity contract |
| `front-end/src/hooks/counterQueries.ts` | Example React Query hooks |
| `front-end/src/components/counter-display.tsx` | Example UI component |
| `clarity/contracts/fundraising.clar` | Legacy example contract |
| `front-end/src/components/_deprecated-chakra/` | Old Chakra UI components |

### Configuration (MODIFY)

Point these to your contract:

| File | What to change |
|------|---------------|
| `front-end/src/constants/contracts.ts` | Add your contract name and deployer address |
| `clarity/deployments/default.devnet-plan.yaml` | Add your contract to deployment plan |
| `clarity/Clarinet.toml` | Register your contract |
| `front-end/.env` | API keys for testnet/mainnet |

## Delete the Example

Run these commands to remove the counter example:

```bash
# Delete example contracts
rm clarity/contracts/counter.clar
rm clarity/contracts/fundraising.clar

# Delete example hooks and components
rm front-end/src/hooks/counterQueries.ts
rm front-end/src/components/counter-display.tsx

# Delete deprecated Chakra components
rm -rf front-end/src/components/_deprecated-chakra
```

Then update `front-end/src/app/page.tsx` to remove the `CounterDisplay` import and usage.

## Add Your Contract

### Step 1: Write your contract

Create your contract in `clarity/contracts/your-contract.clar`.

### Step 2: Register with Clarinet

Add to `clarity/Clarinet.toml`:

```toml
[contracts.your-contract]
path = 'contracts/your-contract.clar'
clarity_version = 3
epoch = 3.0
```

### Step 3: Add to deployment plan

Update `clarity/deployments/default.devnet-plan.yaml` to deploy your contract:

```yaml
- emulated-contract-publish:
    contract-name: your-contract
    emulated-sender: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
    path: contracts/your-contract.clar
    clarity-version: 3
```

### Step 4: Configure front-end constants

Update `front-end/src/constants/contracts.ts` with your contract:

```typescript
export const YOUR_CONTRACT = {
  address: DEPLOYER_ADDRESS,
  name: "your-contract",
} as const;
```

### Step 5: Create query hooks

Create `front-end/src/hooks/yourContractQueries.ts` following the patterns in [patterns.md](patterns.md):

- Use `useQuery` for read-only functions (see [Contract Read Pattern](patterns.md#contract-read-pattern-queries))
- Use `useMutation` for public functions (see [Contract Write Pattern](patterns.md#contract-write-pattern-mutations))

### Step 6: Create UI components

Build components that use your query hooks. Follow the same pattern as `counter-display.tsx`:

- Import hooks from your queries file
- Track pending transaction state for user feedback
- Disable buttons while wallet not connected or transaction pending

## Add a New Contract Function

To add a function to an existing contract:

### 1. Add function to .clar file

**Read-only function (no state change):**
```clarity
(define-read-only (get-something)
  (ok (var-get something)))
```

**Public function (changes state):**
```clarity
(define-public (do-something)
  (begin
    (var-set something new-value)
    (ok true)))
```

### 2. Restart Devnet

Contract changes require redeploy:

```bash
cd clarity && clarinet devnet start
```

### 3. Add hook to queries file

**For read-only:** Create a `useQuery` hook - see [Contract Read Pattern](patterns.md#contract-read-pattern-queries)

**For public:** Create a `useMutation` hook - see [Contract Write Pattern](patterns.md#contract-write-pattern-mutations)

### 4. Wire up UI

Import your new hook and connect it to a button or display component.

## Moving to Testnet/Mainnet

### Testnet deployment

1. Deploy your contract using Clarinet:
   ```bash
   cd clarity && clarinet deployments apply -p deployments/default.testnet-plan.yaml
   ```
2. Set environment variable: `NEXT_PUBLIC_STACKS_NETWORK=testnet`
3. Add testnet deployer address to `.env`:
   ```
   NEXT_PUBLIC_CONTRACT_DEPLOYER_TESTNET_ADDRESS=ST...
   ```
4. Test with Leather wallet (no more auto-signing)

### Mainnet deployment

1. Deploy your contract using Clarinet:
   ```bash
   cd clarity && clarinet deployments apply -p deployments/default.mainnet-plan.yaml
   ```
2. Set environment variable: `NEXT_PUBLIC_STACKS_NETWORK=mainnet`
3. Add mainnet deployer address to `.env`:
   ```
   NEXT_PUBLIC_CONTRACT_DEPLOYER_MAINNET_ADDRESS=SP...
   ```
4. Users sign transactions with Leather wallet

### Key differences from Devnet

| Aspect | Devnet | Testnet/Mainnet |
|--------|--------|-----------------|
| Wallet | Pre-funded test wallets | Leather extension required |
| Signing | Automatic | User approval required |
| Deploy | `clarinet devnet start` | `clarinet deployments apply` |
| Addresses | ST... (test) | ST.../SP... (real) |
