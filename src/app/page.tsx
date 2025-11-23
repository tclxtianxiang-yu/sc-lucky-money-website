'use client'

import { ConnectWallet } from '@/components/ConnectWallet'
import { OwnerDashboard } from '@/components/OwnerDashboard'
import { UserDashboard } from '@/components/UserDashboard'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { luckyMoneyABI } from '@/abis/LuckyMoney'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useIsMounted } from '@/hooks/useIsMounted'

const CONTRACT_ADDRESS = '0xe482752Bb054A78858953892B8EDcF1039060fE1'

export default function Home() {
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  const [isOwner, setIsOwner] = useState(false)
  const { writeContract, data: hash } = useWriteContract()
  
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Read owner from contract
  const { data: contractOwner, isLoading, refetch: refetchOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: luckyMoneyABI,
    functionName: 'owner',
  })

  // Poll balance and num to detect exhaustion
  const { data: contractBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: luckyMoneyABI,
    functionName: 'balance',
    query: {
      refetchInterval: 2000,
    },
  })

  const { data: contractNum } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: luckyMoneyABI,
    functionName: 'num',
    query: {
      refetchInterval: 2000,
    },
  })

  useEffect(() => {
    if (contractOwner && address) {
      setIsOwner(contractOwner === address)
    }
  }, [contractOwner, address])

  // Refetch owner when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      refetchOwner()
    }
  }, [isConfirmed, refetchOwner])

  const handleBecomeOwner = () => {
    if (!address) return
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: luckyMoneyABI,
      functionName: 'initOwner',
      args: [address],
    })
  }

  const handleReset = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: luckyMoneyABI,
      functionName: 'reset',
    })
  }

  const isExhausted = contractNum !== undefined && contractBalance !== undefined && 
                      contractNum === BigInt(0) && contractBalance === BigInt(0) &&
                      contractOwner !== '0x0000000000000000000000000000000000000000' &&
                      !isOwner  // Owner should see dashboard, not exhausted state

  return (
    <main className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
          Lucky Money
        </h1>
        <ConnectWallet />
      </nav>

      <div className="container mx-auto px-4 py-12">
        {!isMounted ? (
          <div className="flex justify-center mt-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : !isConnected ? (
          <div className="text-center mt-20">
            <h2 className="text-4xl font-bold mb-6">Welcome to Web3 Lucky Money</h2>
            <p className="text-gray-400 text-lg mb-8">Connect your wallet to start distributing or grabbing red packets.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center mt-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : isExhausted ? (
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold mb-6">Red Packets Exhausted</h2>
            <p className="text-gray-400 mb-8">All red packets have been claimed. Click below to start a new round.</p>
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
            >
              Start New Round
            </button>
          </div>
        ) : contractOwner === '0x0000000000000000000000000000000000000000' ? (
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold mb-6">No Owner Yet</h2>
            <button
              onClick={handleBecomeOwner}
              className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
              Become Owner & Start
            </button>
          </div>
        ) : isOwner ? (
          <OwnerDashboard />
        ) : (
          <UserDashboard />
        )}
      </div>
    </main>
  )
}
