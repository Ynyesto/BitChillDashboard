import { readContract } from 'viem/actions'
import { assertClient } from './provider'
import abis from './abis.json'
import type { HANDLERS } from './config'

export type HandlerConfig = typeof HANDLERS[number]

export interface TvlResult {
  handler: string
  name: string
  stablecoin: string
  protocol: string
  tvlUsd: number
  underlyingUsd: number
  interestGenerated?: number
}

export async function getHandlerTvl(handler: HandlerConfig): Promise<TvlResult> {
  const client = assertClient()

  let underlyingBalance = 0n
  let interestGenerated: number | undefined

  if (handler.protocol === 'sovryn') {
    // Get asset balance and profit from iSUSD
    // assetBalanceOf returns the TVL (deposits made by users)
    // profitOf returns the withdrawable interest/profit generated
    const [asset, profit] = await Promise.all([
      readContract(client, {
        address: handler.lendingToken as `0x${string}`,
        abi: abis.iSusd,
        functionName: 'assetBalanceOf',
        args: [handler.address as `0x${string}`],
      }),
      readContract(client, {
        address: handler.lendingToken as `0x${string}`,
        abi: abis.iSusd,
        functionName: 'profitOf',
        args: [handler.address as `0x${string}`],
      }),
    ]) as [bigint, bigint]
    // Convert int256 to bigint (handle negative values if any)
    const assetBalance = BigInt(asset.toString())
    const profitBalance = BigInt(profit.toString())
    // TVL = assetBalanceOf (deposits only, per Sovryn docs)
    underlyingBalance = assetBalance
    // Store withdrawable interest separately
    interestGenerated = Number(profitBalance) / 1e18
  } else if (handler.protocol === 'tropykus') {
    // Get all required data for Tropykus calculation
    const [kTokenBalance, exchangeRate, snapshot] = await Promise.all([
      readContract(client, {
        address: handler.lendingToken as `0x${string}`,
        abi: abis.kToken,
        functionName: 'balanceOf',
        args: [handler.address as `0x${string}`],
      }),
      readContract(client, {
        address: handler.lendingToken as `0x${string}`,
        abi: abis.kToken,
        functionName: 'exchangeRateStored',
        args: [],
      }),
      readContract(client, {
        address: handler.lendingToken as `0x${string}`,
        abi: abis.kToken,
        functionName: 'getSupplierSnapshotStored',
        args: [handler.address as `0x${string}`],
      }),
    ]) as [bigint, bigint, [bigint, bigint, bigint, bigint]]
    
    // Calculate real underlying balance: kTokenBalance * exchangeRate / 1e18
    const realUnderlyingBalance = (kTokenBalance * exchangeRate) / BigInt(1e18)
    underlyingBalance = realUnderlyingBalance
    
    // Calculate interest generated: real_underlying - snapshot_underlying
    const snapshotUnderlying = snapshot[1] // underlyingAmount is the second return value, and it equals deposits - withdrawals of the underlying token
    const interestDelta = realUnderlyingBalance - snapshotUnderlying
    interestGenerated = Number(interestDelta) / 1e18
  }

  // Convert to USD (divide by 1e18)
  const tvlUsd = Number(underlyingBalance) / 1e18
  const underlyingUsd = Number(underlyingBalance) / 1e18

  return {
    handler: handler.address,
    name: handler.name,
    stablecoin: handler.stablecoin,
    protocol: handler.protocol,
    tvlUsd,
    underlyingUsd,
    interestGenerated,
  }
}

export async function getAllTvl(): Promise<TvlResult[]> {
  const { HANDLERS } = await import('./config')
  return Promise.all(HANDLERS.map(getHandlerTvl))
}


