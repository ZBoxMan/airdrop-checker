'use client'

import { useState } from 'react'
import { chains } from '@/lib/viem-client'

// 示例空投定义（实际应动态获取）
const AIRDROPS = [
  {
    id: '1inch_2024',
    name: '1inch',
    chain: chains.mainnet,
    check: async (address: string) => {
      // 这里应调用真实 API 或链上查询
      // 暂时用 mock：随机 + 确定性
      const last2 = parseInt(address.slice(-2), 16)
      return last2 % 3 === 0
    },
    claimUrl: 'https://1inch.io/claim',
  },
  {
    id: 'layer3_arb',
    name: 'Layer3 (Arbitrum)',
    chain: chains.arbitrum,
    check: async (address: string) => {
      const val = parseInt(address.slice(-4), 16)
      return val % 5 === 0
    },
    claimUrl: 'https://layer3.xyz/claim',
  },
  {
    id: 'optimism_quest',
    name: 'Optimism Quests',
    chain: chains.optimism,
    check: async (address: string) => {
      const val = parseInt(address.slice(-2), 16)
      return val % 4 === 0
    },
    claimUrl: 'https://app.optimism.io/quests',
  },
  {
    id: 'zksync_genesis',
    name: 'zkSync Genesis',
    chain: chains.zkSync,
    check: async (address: string) => {
      const val = parseInt(address.slice(-3), 16)
      return val % 7 === 0
    },
    claimUrl: 'https://portal.zksync.io/',
  },
  {
    id: 'base_nft',
    name: 'Base NFT Drop',
    chain: chains.base,
    check: async (address: string) => {
      const val = parseInt(address.slice(-4), 16)
      return val % 2 === 0
    },
    claimUrl: 'https://base.org/',
  },
]

export default function Home() {
  const [address, setAddress] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [eligible, setEligible] = useState<typeof AIRDROPS>([])

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
          const ok = await airdrop.check(address)
          return ok ? airdrop : null
        } catch {
          return null
        }
      })
    )
    setEligible(results.filter(Boolean) as typeof AIRDROPS)
    setChecking(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4">🛰️ Airdrop Checker</h1>
        <p className="text-gray-400">
          Check your eligibility for airdrops across Ethereum, Arbitrum, Optimism, zkSync, and Base.
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
              {checking ? 'Checking...' : '🔍 Check My Airdrops'}
            </button>
          </section>
        )}

        {/* Results */}
        {eligible.length > 0 && (
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">✅ Eligible Airdrops ({eligible.length})</h2>
            <ul className="space-y-4">
              {eligible.map((airdrop) => (
                <li key={airdrop.id} className="border-b border-gray-700 pb-4 last:border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{airdrop.name}</h3>
                      <p className="text-sm text-gray-400">Chain: {airdrop.chain.name}</p>
                    </div>
                    <a
                      href={airdrop.claimUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      Claim
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {checking && (
          <p className="text-center text-gray-400 mt-8">Analyzing on-chain activity...</p>
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
