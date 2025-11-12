import { getBalance, readContract } from 'viem/actions'
import { formatEther, formatUnits } from 'viem'
import abis from './abis.json'
import { assertClient } from './provider'

export interface SwapperBalanceResult {
  address: `0x${string}`
  balanceWei: bigint
  balanceRbtc: number
  balanceUsd: number
}

export interface FeeCollectorBalancesResult {
  address: `0x${string}`
  docBalanceRaw: bigint
  docBalance: number
  usdrifBalanceRaw: bigint
  usdrifBalance: number
}

const STABLE_DECIMALS = 18
const PRICE_DECIMALS = 18

export async function getBtcPrice(oracleAddress: `0x${string}`): Promise<number> {
  const client = assertClient()
  const priceRaw = await readContract(client, {
    address: oracleAddress,
    abi: abis.oracle,
    functionName: 'getPrice',
    args: [],
  }) as bigint

  return Number(formatUnits(priceRaw, PRICE_DECIMALS))
}

export async function getSwapperBalance(
  address: `0x${string}`,
  btcPriceUsd: number,
): Promise<SwapperBalanceResult> {
  const client = assertClient()
  const balance = await getBalance(client, { address })
  const balanceRbtc = Number(formatEther(balance))

  return {
    address,
    balanceWei: balance,
    balanceRbtc,
    balanceUsd: balanceRbtc * btcPriceUsd,
  }
}

export async function getFeeCollectorBalances(
  address: `0x${string}`,
  {
    docToken,
    usdrifToken,
  }: { docToken: `0x${string}`; usdrifToken: `0x${string}` },
): Promise<FeeCollectorBalancesResult> {
  const client = assertClient()

  const [docBalanceRaw, usdrifBalanceRaw] = await Promise.all([
    readContract(client, {
      address: docToken,
      abi: abis.erc20,
      functionName: 'balanceOf',
      args: [address],
    }) as Promise<bigint>,
    readContract(client, {
      address: usdrifToken,
      abi: abis.erc20,
      functionName: 'balanceOf',
      args: [address],
    }) as Promise<bigint>,
  ])

  return {
    address,
    docBalanceRaw,
    docBalance: Number(formatUnits(docBalanceRaw, STABLE_DECIMALS)),
    usdrifBalanceRaw,
    usdrifBalance: Number(formatUnits(usdrifBalanceRaw, STABLE_DECIMALS)),
  }
}

export interface OperationalBalancesResult {
  swapper: SwapperBalanceResult
  feeCollector: FeeCollectorBalancesResult
  feeCollectorTotalUsd: number
}

export async function getOperationalBalances({
  swapperAddress,
  feeCollectorAddress,
  docToken,
  usdrifToken,
  btcOracleAddress,
}: {
  swapperAddress: `0x${string}`
  feeCollectorAddress: `0x${string}`
  docToken: `0x${string}`
  usdrifToken: `0x${string}`
  btcOracleAddress: `0x${string}`
}): Promise<OperationalBalancesResult> {
  const [btcPrice, feeCollector] = await Promise.all([
    getBtcPrice(btcOracleAddress),
    getFeeCollectorBalances(feeCollectorAddress, { docToken, usdrifToken }),
  ])

  const swapper = await getSwapperBalance(swapperAddress, btcPrice)

  return {
    swapper,
    feeCollector,
    feeCollectorTotalUsd: feeCollector.docBalance + feeCollector.usdrifBalance,
  }
}


