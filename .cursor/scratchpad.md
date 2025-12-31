# BitChill Dashboard Enhancements - TVL Evolution & Total Purchases

## Background and Motivation

The user wants to enhance the BitChill React dashboard with two new features:
1. **TVL Evolution Graph**: A graph showing how Total Value Locked changes over time (since TVL decreases as stablecoins are spent to buy rBTC)
2. **Total rBTC Purchases Card**: A card displaying the total amount in USD spent to buy rBTC since BitChill was launched

The dashboard currently:
- Fetches real-time TVL data directly from blockchain using viem
- Shows current TVL per handler, operational balances, and fee collector balances
- Uses React + Vite + TypeScript

The swapper-bot project:
- Maintains a SQLite database (`dca_events.db`) on a remote server
- Tracks all DCA events (created, updated, deleted)
- Tracks swap transactions with purchase amounts
- Has methods to query historical data

## Key Challenges and Analysis

### Data Availability

**For TVL Evolution:**
- Current TVL is calculated on-chain in real-time
- Historical TVL data is NOT directly stored in the database
- The database has:
  - `dca_events` table: tracks deposits, withdrawals, schedule updates
  - `user_dca_positions` table: current state of positions (but not historical snapshots)
  - `swap_transactions` table: tracks purchases with timestamps and amounts

**For Total rBTC Purchases:**
- `swap_transactions` table has `total_purchase_amount` for each successful transaction
- `swap_candidates` table has individual `purchase_amount` per user/schedule
- Both have `timestamp` fields
- Data is stored as strings (wei amounts) - need to convert to USD

### Options for Implementation

#### Option 1: REST API on Remote Server (Recommended)
**Pros:**
- Database is already on remote server
- Can create efficient SQL queries for historical data
- Can aggregate data server-side (better performance)
- Can add caching if needed
- Keeps database access secure

**Cons:**
- Need to set up API server (Express/Fastify)
- Need to deploy and maintain API
- Additional infrastructure

**Implementation:**
- Create Express/Fastify API in swapper-bot or separate service
- Endpoints:
  - `GET /api/tvl-evolution?startDate=&endDate=&granularity=day|week|month`
  - `GET /api/total-purchases`
- Calculate TVL evolution by:
  - Starting from first deposit event
  - Reconstructing TVL at each point by processing events chronologically
  - Or: Use swap_transactions to track when purchases happened and subtract from deposits

#### Option 2: Direct Database Access from Dashboard
**Pros:**
- No API needed
- Simpler architecture

**Cons:**
- Security risk (exposing database directly)
- SQLite doesn't work well over network
- Would need to convert to PostgreSQL/MySQL or use SQLite over HTTP (not recommended)
- CORS and authentication complexity

#### Option 3: On-Chain Event Indexing
**Pros:**
- No dependency on database
- Fully decentralized

**Cons:**
- Would need to index all historical events (expensive RPC calls)
- Slow initial load
- Complex to reconstruct historical TVL from events
- Not practical for frequent updates

### Recommended Approach: REST API

**Architecture:**
```
Dashboard (React) 
  ↓ HTTP
REST API (Express/Fastify on remote server)
  ↓ SQL Queries
SQLite Database (dca_events.db)
```

**API Endpoints Needed:**

1. **GET /api/tvl-evolution**
   - Query params: `startDate`, `endDate`, `granularity` (day/week/month)
   - Returns: Array of `{ timestamp: number, tvl: number }`
   - Implementation: Reconstruct TVL by processing events chronologically

2. **GET /api/total-purchases**
   - Returns: `{ totalUsd: number, totalTransactions: number, lastPurchaseTimestamp?: number }`
   - Implementation: Sum all successful `total_purchase_amount` from `swap_transactions`

3. **GET /api/health** (optional)
   - Health check endpoint

**TVL Evolution Calculation Strategy:**

Since we don't have historical TVL snapshots, we need to reconstruct it:

1. **Method A: Event-Based Reconstruction**
   - Get all events ordered by timestamp
   - Start with TVL = 0
   - For each event:
     - `created`: TVL += depositAmount
     - `updated`: TVL = updatedTokenBalance (if provided)
     - `deleted`: TVL -= refundedAmount
   - Track TVL at each timestamp
   - Aggregate by granularity (day/week/month)

2. **Method B: Current TVL - Purchases**
   - Get current TVL from blockchain (already available)
   - Get all swap transactions ordered by timestamp
   - Calculate: Historical TVL = Current TVL + Sum of all purchases up to that point
   - This assumes no withdrawals (which is tracked in events)

**Best Approach: Hybrid**
- Use Method A (event-based) for accuracy
- Use swap_transactions to validate/cross-check
- Handle edge cases (withdrawals, updates)

## High-level Task Breakdown

### Phase 1: API Server Setup
- [ ] Create API server structure in swapper-bot or new service
- [ ] Set up Express/Fastify with TypeScript
- [ ] Add CORS middleware
- [ ] Add error handling middleware
- [ ] Create database connection utility
- [ ] Add health check endpoint

### Phase 2: Total Purchases Endpoint
- [ ] Create `GET /api/total-purchases` endpoint
- [ ] Query `swap_transactions` for successful transactions
- [ ] Sum `total_purchase_amount` (convert from wei to USD)
- [ ] Return total in USD format
- [ ] Test endpoint

### Phase 3: TVL Evolution Endpoint
- [ ] Create `GET /api/tvl-evolution` endpoint
- [ ] Implement event-based TVL reconstruction
- [ ] Add granularity support (day/week/month)
- [ ] Add date range filtering
- [ ] Optimize query performance
- [ ] Test with real data

### Phase 4: Dashboard Integration
- [ ] Add API client utility in dashboard
- [ ] Install charting library (recharts, chart.js, or similar)
- [ ] Create TVL Evolution graph component
- [ ] Create Total Purchases card component
- [ ] Integrate into App.tsx
- [ ] Add loading states and error handling
- [ ] Style components to match existing design

### Phase 5: Testing & Deployment
- [ ] Test API endpoints with real data
- [ ] Test dashboard integration
- [ ] Verify data accuracy
- [ ] Deploy API to remote server
- [ ] Update dashboard to use production API URL
- [ ] Test end-to-end

## Project Status Board

- [x] Phase 1: API Server Setup ✅
- [x] Phase 2: Total Purchases Endpoint ✅
- [x] Phase 3: TVL Evolution Endpoint ✅
- [x] Phase 4: Dashboard Integration ✅
- [ ] Phase 5: Testing & Deployment (pending server deployment)

## Current Status / Progress Tracking

**Status:** Implementation complete! Ready for testing and deployment.

**Completed:**
- ✅ Express server with TypeScript
- ✅ Database connection and query methods
- ✅ Total purchases endpoint (`/api/total-purchases`)
- ✅ TVL evolution endpoint (`/api/tvl-evolution`) with granularity support
- ✅ Health check endpoint
- ✅ CORS configuration
- ✅ Error handling
- ✅ Dashboard API client utility
- ✅ TVL Evolution Graph component with recharts
- ✅ Total Purchases Card component
- ✅ Integration into App.tsx

**Next Steps:**
1. ✅ Install dependencies in API project: `cd bitchill-api && npm install`
2. ✅ Configure `.env` in API project (set DB_PATH and ALLOWED_ORIGIN) - DONE
3. Deploy API to remote server (see DEPLOYMENT.md for options)
4. Set GitHub secret `VITE_API_URL` with the public API URL
5. Test API endpoints from server
6. Push to main branch to trigger dashboard deployment
7. Test end-to-end

**Deployment Options:**
- **Option 1**: Direct port exposure (simple, less secure)
- **Option 2**: Nginx reverse proxy (recommended, more secure)
- **Option 3**: PM2 for process management
- **Option 4**: ngrok for testing (temporary URLs)

## Executor's Feedback or Assistance Requests

**Decisions Made:**
1. ✅ API server location: Same server as database (`/Users/antoniorodriguez-ynyesto/Proyectos personales/bitchill-api`)
2. ✅ Port: 3000
3. ✅ Authentication: Private API (CORS restricted to frontend origin)
4. ✅ Charting library: recharts
5. ✅ TVL granularity: Configurable (daily, weekly, monthly)

**Status:** Starting implementation in Executor mode.

## Lessons

- SQLite database stores amounts as strings (wei) - need conversion to USD
- TVL evolution requires reconstruction from events since no historical snapshots exist
- swap_transactions table has all purchase data needed for total purchases calculation
