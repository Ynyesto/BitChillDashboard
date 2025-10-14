# BitChill Dashboard Troubleshooting

## Background and Motivation

The user reports that the BitChill dashboard is showing incorrect balance for the third handler contract (Tropykus + USDRIF). The dashboard shows 0 balance but the user knows the actual balance should be slightly over $25. The first two handlers (Tropykus + DOC and Sovryn + DOC) are working correctly.

## Key Challenges and Analysis

After examining the code, I've identified the root cause of the issue:

**Problem**: In the `config.ts` file, the Tropykus USDRIF Handler is incorrectly configured to use `kDOC` as its lending token instead of `kUSDRIF`.

**Current Configuration (INCORRECT)**:
```typescript
{
  name: 'Tropykus USDRIF Handler',
  address: CONTRACTS.TropykusErc20HandlerDex,
  stablecoin: TOKENS.USDRIF,
  lendingToken: TOKENS.kDOC, // ❌ WRONG - should be kUSDRIF
  protocol: 'tropykus' as const,
}
```

**Expected Configuration (CORRECT)**:
```typescript
{
  name: 'Tropykus USDRIF Handler',
  address: CONTRACTS.TropykusErc20HandlerDex,
  stablecoin: TOKENS.USDRIF,
  lendingToken: TOKENS.kUSDRIF, // ✅ CORRECT
  protocol: 'tropykus' as const,
}
```

**Why this causes the issue**:
1. The `getHandlerTvl` function calls `getSupplierSnapshotStored` on the lending token contract
2. For Tropykus USDRIF, it's calling this function on `kDOC` instead of `kUSDRIF`
3. The handler address `TropykusErc20HandlerDex` likely has no balance in `kDOC`, hence the 0 result
4. The actual USDRIF balance is stored in `kUSDRIF` contract

## High-level Task Breakdown

- [x] **Task 1**: Analyze the current dashboard code and identify the root cause
- [ ] **Task 2**: Fix the configuration in `config.ts` to use the correct lending token (`kUSDRIF`)
- [ ] **Task 3**: Test the fix by running the dashboard and verifying the balance shows correctly
- [ ] **Task 4**: Verify all three handlers are working correctly

## Project Status Board

- [x] **Analyze Code**: Identified incorrect lending token configuration
- [x] **Fix Configuration**: Update config.ts to use kUSDRIF instead of kDOC
- [x] **Test Fix**: Run dashboard and verify USDRIF balance shows correctly
- [ ] **Verify All Handlers**: Ensure all three handlers display correct balances

## Current Status / Progress Tracking

**Current Status**: Fix implemented and dashboard running successfully

**Completed Actions**: 
1. ✅ Update the configuration in `config.ts` - COMPLETED
2. ✅ Test the dashboard - COMPLETED (dashboard running on http://localhost:5173)

**Summary of Fix**:
- **Root Cause**: Tropykus USDRIF Handler was incorrectly configured to use `kDOC` as lending token instead of `kUSDRIF`
- **Solution**: Updated `config.ts` line 39 to use `TOKENS.kUSDRIF` instead of `TOKENS.kDOC`
- **Result**: Dashboard now correctly queries the `kUSDRIF` contract for the USDRIF handler balance

## Executor's Feedback or Assistance Requests

Ready to proceed with the fix. The issue is clear and the solution is straightforward.

## Lessons

- Always verify that handler configurations use the correct token addresses
- When troubleshooting balance issues, check both the handler address and the lending token address
- The `getSupplierSnapshotStored` function needs to be called on the correct kToken contract that corresponds to the stablecoin being tracked
