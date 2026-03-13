import { createPublicClient, http } from 'viem'
import { mainnet, arbitrum, optimism, zkSync, base } from 'viem/chains'

const rpcMap: Record<string, string | undefined> = {
  ethereum: typeof window !== 'undefined' && window.location?.hostname === 'localhost'
    ? 'http://localhost:8545'
    : process.env.NEXT_PUBLIC_RPC_URL_ETHEREUM,
  arbitrum: typeof window !== 'undefined' && window.location?.hostname === 'localhost'
    ? 'http://localhost:8545'
    : process.env.NEXT_PUBLIC_RPC_URL_ARBITRUM,
  optimism: typeof window !== 'undefined' && window.location?.hostname === 'localhost'
    ? 'http://localhost:8545'
    : process.env.NEXT_PUBLIC_RPC_URL_OPTIMISM,
  zksync: typeof window !== 'undefined' && window.location?.hostname === 'localhost'
    ? 'http://localhost:8545'
    : process.env.NEXT_PUBLIC_RPC_URL_ZKSYNC,
  base: typeof window !== 'undefined' && window.location?.hostname === 'localhost'
    ? 'http://localhost:8545'
    : process.env.NEXT_PUBLIC_RPC_URL_BASE,
}

function getTransport(chainKey: string) {
  const rpcUrl = rpcMap[chainKey]
  if (!rpcUrl) {
    throw new Error(`Missing RPC URL for chain: ${chainKey}`)
  }
  return http(rpcUrl)
}

export const clients = {
  ethereum: createPublicClient({
    chain: mainnet,
    transport: getTransport('ethereum'),
  }),
  arbitrum: createPublicClient({
    chain: arbitrum,
    transport: getTransport('arbitrum'),
  }),
  optimism: createPublicClient({
    chain: optimism,
    transport: getTransport('optimism'),
  }),
  zksync: createPublicClient({
    chain: zkSync,
    transport: getTransport('zksync'),
  }),
  base: createPublicClient({
    chain: base,
    transport: getTransport('base'),
  }),
}

export const chains = {
  mainnet,
  arbitrum,
  optimism,
  zkSync,
  base,
}

export function getClient(chainKey: string) {
  return clients[chainKey as keyof typeof clients]
}
