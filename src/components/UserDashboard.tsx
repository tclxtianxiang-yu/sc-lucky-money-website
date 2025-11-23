'use client'

import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi'
import { luckyMoneyABI } from '@/abis/LuckyMoney'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatEther } from 'viem'
import { gql } from 'graphql-request'
import { graphClient } from '@/config/graph'
import { GrabbedModal } from './GrabbedModal'
import { CONTRACT_ADDRESS } from '@/config/constants'

export function UserDashboard() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const [grabbedAmount, setGrabbedAmount] = useState<string | null>(null)
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const { data: remainingCount, refetch: refetchCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: luckyMoneyABI,
    functionName: 'num',
  })

  const handleGrab = () => {
    if (!address) return
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: luckyMoneyABI,
      functionName: 'giveOutMoney',
      args: [address],
    })
  }

  // Check grabbed amount from logs when confirmed
  useEffect(() => {
    if (isConfirmed && hash) {
      refetchCount()
      // In a real app we'd parse logs, but here we can just query the subgraph or wait for the event
      // For simplicity, let's query the subgraph for the latest distribution to this user
      const fetchGrabbedAmount = async () => {
        const query = gql`
          query($to: String!, $hash: String!) {
            luckyMoneyDistributeds(where: { to: $to, transactionHash: $hash }) {
              amount
            }
          }
        `
        // Wait a bit for indexing
        setTimeout(async () => {
          try {
            const data: any = await graphClient.request(query, { 
              to: address?.toLowerCase(), 
              hash: hash.toLowerCase() 
            })
            if (data.luckyMoneyDistributeds.length > 0) {
              setGrabbedAmount(formatEther(data.luckyMoneyDistributeds[0].amount))
            }
          } catch (e) {
            console.error(e)
          }
        }, 2000)
      }
      fetchGrabbedAmount()
    }
  }, [isConfirmed, hash, address, refetchCount])

  const isSoldOut = remainingCount !== undefined && remainingCount === BigInt(0)

  return (
    <>
      <div className="w-full max-w-md mx-auto text-center">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-violet-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <button
            onClick={handleGrab}
            disabled={isPending || isConfirming || isSoldOut}
            className="relative w-64 h-64 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex flex-col items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming ? (
              <Loader2 className="w-16 h-16 text-white animate-spin" />
            ) : isSoldOut ? (
              <>
                <span className="text-6xl mb-2">😢</span>
                <span className="text-2xl font-bold text-white">Sold Out</span>
              </>
            ) : (
              <>
                <span className="text-6xl mb-2">🧧</span>
                <span className="text-2xl font-bold text-white">Open</span>
              </>
            )}
          </button>
        </div>
      </div>

      {grabbedAmount && (
        <GrabbedModal 
          amount={grabbedAmount} 
          onClose={() => setGrabbedAmount(null)} 
        />
      )}
    </>
  )
}
