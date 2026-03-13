import { createPublicClient, http } from 'viem'
import { mainnet, arbitrum, optimism, zkSync, base } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export const chains = {
  mainnet,
  arbitrum,
  optimism,
  zkSync,
  base,
}
