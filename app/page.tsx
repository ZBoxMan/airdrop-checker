'use client'

import { useState } from 'react'
import { getClient } from '@/lib/viem-client'

interface ERC20Airdrop {
  id: string
  name: string
  chain: string
  tokenAddress: `0x${string}`
  minBalance?: string
  decimals?: number
  claimUrl: string
}

const AIRDROPS: ERC20Airdrop[] = [
  {
    id: 'weth_eth',
    name: 'WEDC (WETH)',
    chain: 'mainnet',
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    minBalance: '0.01',
    decimals: 18,
    claimUrl: 'https://weth.io/',
  },
  {
    id: 'usdc_eth',
    name: 'USDC (Ethereum)',
    chain: 'mainnet',
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    minBalance: '1',
    decimals: 6,
    claimUrl: 'https://www.usdc.circle.com/',
  },
  {
    id: 'arb_eth',
    name: 'ARB (Arbitrum)',
    chain: 'arbitrum',
    tokenAddress: '0x912CE59144191C1204E64559FE8253a0e49E3BEB',
    minBalance: '10',
    decimals: 18,
    claimUrl: 'https://arbitrum.io/',
  },
  {
    id: 'op_eth',
    name: 'OP (Optimism)',
    chain: 'optimism',
    tokenAddress: '0x4200000000000000000000000000000000000042',
    minBalance: '10',
    decimals: 18,
    claimUrl: 'https://www.optimism.io/',
  },
  {
    id: 'zkSync_eth',
    name: 'ZK Token (zkSync)',
    chain: 'zksync',
    tokenAddress: '0x0E2b54d1E2a9bA6d57621244544bB99aF0242342',
    minBalance: '1',
    decimals: 18,
    claimUrl: 'https://zksync.io/',
  },
  {
    id: 'base_eth',
    name: 'Base Token',
    chain: 'base',
    tokenAddress: '0x2c230fc3c512056df2ae8d4801e3c52aa493e6c8',
    minBalance: '10',
    decimals: 18,
    claimUrl: 'https://base.org/',
  },
]

const erc20Abi = [
  {
    name: 'balanceOf',
    type: 'function' as const,
    stateMutability: 'view' as const,
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export default function Home() {
  const [address, setAddress] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [eligible, setEligible] = useState<ERC20Airdrop[]>([])

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        setAddress(accounts[0])
      } catch (err) {
        console.error('Connection failed:', err)
        alert('Failed to connect wallet. Make sure MetaMask is installed.')
      }
    } else {
      alert('No Ethereum wallet found. Please install MetaMask.')
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setEligible([])
  }

  const handleCheck = async () => {
    if (!address) return
    setChecking(true)
    setEligible([])

    const results = await Promise.all(
      AIRDROPS.map(async (airdrop) => {
        try {
          const client = getClient(airdrop.chain)
          if (!client) {
            console.warn(`No RPC client for chain: ${airdrop.chain}`)
            return null
          }

          const rawBalance = await client.readContract({
            address: airdrop.tokenAddress,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
          })

          const decimals = airdrop.decimals ?? 18
          const minRaw = airdrop.minBalance
            ? (BigInt(airdrop.minBalance) * (BigInt(10) ** BigInt(decimals)))
            : BigInt(0)

          if (rawBalance >= minRaw) {
            return airdrop
          }
          return null
        } catch (err) {
          console.error(`Check failed for ${airdrop.name}:`, err)
          return null
        }
      })
    )

    setEligible(results.filter(Boolean) as ERC20Airdrop[])
    setChecking(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4">🛰️ Airdrop Checker</h1>
        <p className="text-gray-400">
          Check your token balances across Ethereum, Arbitrum, Optimism, zkSync, and Base.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Wallet Connection */}
        <section className="bg-gray-800 p-6 rounded-lg mb-8">
          {address ? (
            <div>
              <p className="mb-4">
                Connected: <span className="font-mono text-green-400">{address}</span>
              </p>
              <button
                onClick={disconnectWallet}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-lg font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </section>

        {/* Check Button */}
        {address && (
          <section className="mb-8 text-center">
            <button
              onClick={handleCheck}
              disabled={checking}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded text-xl font-bold disabled:opacity-50"
            >
              {checking ? 'Checking...' : '🔍 Check My Balances'}
            </button>
          </section>
        )}

        {/* Results */}
        {eligible.length > 0 && (
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">
              ✅ Tokens With Sufficient Balance ({eligible.length})
            </h2>
            <ul className="space-y-4">
              {eligible.map((airdrop) => (
                <li key={airdrop.id} className="border-b border-gray-700 pb-4 last:border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{airdrop.name}</h3>
                      <p className="text-sm text-gray-400">
                        Chain: {airdrop.chain} | Threshold: {airdrop.minBalance}
                      </p>
                    </div>
                    <a
                      href={airdrop.claimUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      Learn More
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {checking && (
          <p className="text-center text-gray-400 mt-8">Reading on-chain balances...</p>
        )}

        {!checking && eligible.length === 0 && address && (
          <p className="text-center text-gray-500 mt-8">
            No eligible airdrops found based on current thresholds.
          </p>
        )}
      </main>

      <footer className="max-w-4xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>
          💡 Want custom detection or batch analysis? Contact us for premium services.
        </p>
      </footer>
    </div>
  )
}
