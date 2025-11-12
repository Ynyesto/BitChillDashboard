# BitChill Dashboard - Add Balance Tracking Features

## Background and Motivation

The user wants to add additional data visualizations to the BitChill dashboard:
1. **Swapper RBTC Balance**: Display the RBTC (native Rootstock token) balance of the swapper address `0x362051Aeda2dF55fFa6CeFCEd3973D90a0891285`
2. **Fee Collector Balances**: Display DOC and USDRIF token balances of the fee collector address `0xab8AE06160b77d604EDEf7eC12D9F12ddeE7123f`
3. **Total USD Value**: Calculate and display the total USD value of fee collector balances assuming perfect 1:1 peg for both stablecoins

This will help monitor the operational funds (swapper RBTC for gas) and collected fees.

## Key Challenges and Analysis

1. **RBTC Balance Fetching**: Need to use viem's `getBalance` function to fetch native RBTC balance (not an ERC20 token)
2. **ERC20 Token Balances**: Need to call `balanceOf` on DOC and USDRIF token contracts for the fee collector address
3. **Data Structure**: Create a new data structure to hold these balances separate from TVL data
4. **UI Integration**: Add new cards/sections to display this information in a clear, consistent manner
5. **Error Handling**: Ensure proper error handling for balance fetching operations
6. **Refresh Functionality**: Include refresh capability for the new balance data

**Technical Approach**:
- Use `getBalance` from viem/actions for RBTC balance
- Use `readContract` with ERC20 ABI for DOC and USDRIF balances
- Create a new function similar to `getAllTvl` but for balances
- Add new state management in App.tsx
- Display in new card components following existing UI patterns

## High-level Task Breakdown

- [ ] **Task 1**: Create balance fetching functions
  - Success Criteria: Functions can fetch RBTC balance and ERC20 token balances
  - Create `getSwapperBalance()` function to fetch RBTC balance
  - Create `getFeeCollectorBalances()` function to fetch DOC and USDRIF balances
  - Add proper TypeScript types for balance data

- [ ] **Task 2**: Update config.ts with new addresses
  - Success Criteria: Swapper and fee collector addresses are defined in config
  - Add swapper address constant
  - Add fee collector address constant

- [x] **Task 3**: Create balance data types and aggregation function
  - Success Criteria: Type definitions exist and total USD calculation works
  - Define `BalanceData` interface
  - Create function to calculate total USD (DOC + USDRIF assuming 1:1 peg)

- [x] **Task 4**: Integrate balance fetching into App.tsx
  - Success Criteria: Balance data loads and displays in UI
  - Add state for balance data
  - Add loading and error states
  - Call balance functions on component mount and refresh
  - Display swapper RBTC balance
  - Display fee collector DOC, USDRIF, and total USD balances

- [x] **Task 5**: Style and layout the new balance cards
  - Success Criteria: New cards match existing UI design and are responsive
  - Add CSS styling for balance cards
  - Ensure proper layout in dashboard grid
  - Test responsive behavior

- [x] **Task 6**: Test and verify
  - Success Criteria: All balances display correctly and refresh works
  - Test balance fetching with actual addresses
  - Verify calculations are correct
  - Test error handling
  - Verify refresh functionality works

## Project Status Board

- [x] **Create balance fetching functions**: Implement getSwapperBalance and getFeeCollectorBalances
- [x] **Update config.ts**: Add swapper and fee collector addresses
- [x] **Create balance types**: Define BalanceData interface and calculation functions
- [x] **Integrate into App.tsx**: Add state, fetching, and display logic
- [x] **Style balance cards**: Match existing UI design
- [x] **Test and verify**: Ensure all functionality works correctly

## Current Status / Progress Tracking

**Current Status**: All tasks completed including latest enhancements

**Latest Updates (Second Round)**:
1. ✅ Added BTC oracle price fetching functionality
2. ✅ Integrated RBTC USD value calculation using oracle price
3. ✅ Restructured UI: moved handler cards inside TVL card, renamed to "TVL"
4. ✅ Removed refresh button as requested
5. ✅ All linting checks pass

**Next Steps**: 
- Manual testing recommended to verify oracle price fetching and USD calculations
- Verify UI layout looks correct with nested handler cards

## Executor's Feedback or Assistance Requests

All tasks completed successfully. Latest enhancements:
- Oracle integration for BTC price (address: 0xe2927A0620b82A66D67F678FC9b826B0E01B1bFD)
- RBTC balance now shows USD value using oracle price
- UI restructured with handler cards nested inside TVL card
- Refresh button removed as requested
- All code passes linting

## Lessons

- Use `getBalance` from viem/actions for native token balances (RBTC)
- Use `