import { createPublicClient, http, type PublicClient } from 'viem'
import { rootstock } from 'viem/chains'

let rpcUrl = import.meta.env.VITE_RPC_URL as string | undefined

if (!rpcUrl) {
  // eslint-disable-next-line no-console
  console.warn('VITE_RPC_URL not set. Using public RPC URL.')
  rpcUrl = 'https://rootstock-mainnet.public.blastapi.io'
}

export const publicClient: PublicClient = createPublicClient({
  chain: rootstock,
  transport: http(rpcUrl),
})

export function assertClient() {
  if (!publicClient) {
    throw new Error('No client available. Set VITE_RPC_URL.')
  }
  return publicClient
}


