'use client'

import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance, useChainId } from 'wagmi'
import { Wallet, LogOut, ChevronDown, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { formatEther } from 'viem'
import { useIsMounted } from '@/hooks/useIsMounted'

export function ConnectWallet() {
  const isMounted = useIsMounted()
  const { address, isConnected, status } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { chains, switchChain } = useSwitchChain()
  const chainId = useChainId()
  const { data: balance } = useBalance({ 
    address,
    query: {
      refetchInterval: 2000,
    },
  })

  const [isNetworkOpen, setIsNetworkOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNetworkOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isMounted) return null

  const currentChain = chains.find((c) => c.id === chainId)

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        {/* Network Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsNetworkOpen(!isNetworkOpen)}
            className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors text-white text-sm font-medium"
          >
            <div className={`w-2 h-2 rounded-full ${currentChain?.id === 31337 ? 'bg-green-500' : 'bg-blue-500'}`} />
            {currentChain?.name || 'Unknown Network'}
            <ChevronDown className="w-4 h-4 opacity-50" />
          </button>

          {isNetworkOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    switchChain({ chainId: chain.id })
                    setIsNetworkOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${chain.id === 31337 ? 'bg-green-500' : 'bg-blue-500'}`} />
                    {chain.name}
                  </span>
                  {chain.id === chainId && <Check className="w-4 h-4 text-green-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Balance & Address */}
        <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
          <div className="flex items-center gap-3 text-white">
            <div className="flex flex-col items-end leading-tight">
              <span className="text-xs text-gray-400 font-medium">
                {balance ? `${Number(formatEther(balance.value)).toFixed(4)} ${balance.symbol}` : 'Loading...'}
              </span>
              <span className="text-sm font-bold">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            <Wallet className="w-5 h-5 text-pink-500" />
          </div>
          <div className="w-px h-8 bg-white/10 mx-1" />
          <button
            onClick={() => disconnect()}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-red-400"
            title="Disconnect"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="group relative px-6 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <span className="flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </span>
    </button>
  )
}
