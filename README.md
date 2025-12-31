# BitChill Dashboard (Minimal TVL)

Quick-start dashboard to compute per-handler TVL using RPC only.

## Setup

### Local Development with SSH Tunnel

For development, you can use SSH port forwarding to connect to the API running on the server.

1. **Set up SSH tunnel** (in a separate terminal):
   ```bash
   ssh -L 3000:localhost:3000 bitchill.server
   ```
   This forwards your local port 3000 to the server's port 3000 where the API is running.
   Keep this terminal open while developing.
   ```

2. **Create `.env` file**:
   ```
   VITE_RPC_URL=YOUR_ALCHEMY_OR_RPC
   VITE_API_URL=http://localhost:9876
   ```
   **Important**: Set `VITE_API_URL` to match the local port you're forwarding to (9876 in the example above).
   If you used port 3000 in the SSH command, use `http://localhost:3000` instead.

3. **Install and run the frontend**:
   ```bash
   npm install
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` and connect to the API via the SSH tunnel.

### Local Development (API on localhost)

If you're running the API locally:

1. Create `.env` with:
   ```
   VITE_RPC_URL=YOUR_ALCHEMY_OR_RPC
   VITE_API_URL=http://localhost:3000
   ```

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```

### Production Deployment (GitHub Pages)

The dashboard is deployed to GitHub Pages. To configure the API URL:

1. **Set GitHub Secret:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add a new secret named `VITE_API_URL`
   - Set the value to your API server URL (e.g., `https://api.yourdomain.com` or ngrok URL)

2. **Deploy API to Server:**
   - The API needs to be publicly accessible
   - Options:
     - **Direct exposure**: Run API on port 3000 and configure firewall/security groups
     - **Reverse proxy (recommended)**: Use nginx to proxy requests to the API
     - **ngrok (testing)**: Use ngrok for temporary public access

3. **Build and Deploy:**
   - Push to `main` branch triggers automatic deployment
   - The build process uses `VITE_API_URL` from GitHub secrets

## Features

- **Real-time TVL**: Shows current Total Value Locked per handler
- **TVL Evolution Graph**: Historical TVL data with configurable granularity (daily, weekly, monthly)
- **Total rBTC Purchases**: Total USD spent on rBTC purchases since launch
- **Operational Balances**: Swapper and fee collector balances

## Usage

- Provide handler address, stablecoin address, and (if lending) the iSUSD or kToken address.
- TVL calculation:
  - Sovryn: assetBalanceOf(handler) + profitOf(handler)
  - Tropykus: balanceOfUnderlying(handler)
  - Plain: stablecoin.balanceOf(handler)
