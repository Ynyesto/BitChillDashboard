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
  interestWithdrawn?: number // Only for Tropykus (and potentially Sovryn)
}

export async function getHandlerTvl(handler: HandlerConfig): Promise<TvlResult> {
  const client = assertClient()

  let underlyingBalance = 0n

  if (handler.protocol === 'sovryn') {
    // Get asset balance and profit from iSUSD
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
    // Convert int256 to bigint and sum
    underlyingBalance = BigInt(asset.toString()) + BigInt(profit.toString())
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
    
    // Calculate interest withdrawn: real_underlying - snapshot_underlying
    const snapshotUnderlying = snapshot[1] // underlyingAmount is the second return value
    const interestWithdrawn = realUnderlyingBalance - snapshotUnderlying
    
    // Convert to USD (divide by 1e18)
    const tvlUsd = Number(underlyingBalance) / 1e18
    const underlyingUsd = Number(underlyingBalance) / 1e18
    const interestWithdrawnUsd = Number(interestWithdrawn) / 1e18

    return {
      handler: handler.address,
      name: handler.name,
      stablecoin: handler.stablecoin,
      protocol: handler.protocol,
      tvlUsd,
      underlyingUsd,
      interestWithdrawn: interestWithdrawnUsd,
    }
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
  }
}

export async function getAllTvl(): Promise<TvlResult[]> {
  const { HANDLERS } = await import('./config')
  return Promise.all(HANDLERS.map(getHandlerTvl))
}


