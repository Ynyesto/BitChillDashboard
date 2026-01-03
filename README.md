# BitChill Dashboard (Minimal TVL)

Quick-start dashboard to compute per-handler TVL using RPC only.

## Setup

1. Create `.env` with:

```
VITE_RPC_URL=YOUR_ALCHEMY_OR_RPC
```

2. Install and run:

```
npm install
npm run dev
```

## Usage

- Provide handler address, stablecoin address, and (if lending) the iSUSD or kToken address.
- TVL calculation:
  - Sovryn: assetBalanceOf(handler) (TVL = deposits only, per Sovryn docs)
  - Tropykus: balanceOfUnderlying(handler)
  - Plain: stablecoin.balanceOf(handler)
- Withdrawable interest (Sovryn only): profitOf(handler)
