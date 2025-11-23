'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { luckyMoneyABI } from '@/abis/LuckyMoney'
import { Gift, Loader2 } from 'lucide-react'
import { gql } from 'graphql-request'
import { useQuery } from '@tanstack/react-query'
import { graphClient } from '@/config/graph'
import { CONTRACT_ADDRESS } from '@/config/constants'

export function OwnerDashboard() {
  const [amount, setAmount] = useState('')
  const [count, setCount] = useState('')
  
  const { writeContract, data: hash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const { data: contractBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: luckyMoneyABI,
    functionName: 'balance',
    query: {
      refetchInterval: 2000,
    },
  })

  const { data: remainingCount, refetch: refetchCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: luckyMoneyABI,
    functionName: 'num',
    query: {
      refetchInterval: 2000,
    },
  })

  // Query distribution history from Subgraph
  const { data: history, refetch: refetchHistory } = useQuery({
    queryKey: ['luckyMoneyDistributeds'],
    queryFn: async () => {
      const query = gql`
        {
          luckyMoneyDistributeds(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
            id
            to
            amount
            transactionHash
          }
        }
      `
      return graphClient.request(query)
    },
    refetchInterval: 2000,
  })

  useEffect(() => {
    if (isConfirmed) {
      refetchBalance()
      refetchCount()
      refetchHistory()
      setAmount('')
      setCount('')
    }
  }, [isConfirmed, refetchBalance, refetchCount, refetchHistory])

  const handleCreate = () => {
    if (!amount || !count) return
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: luckyMoneyABI,
      functionName: 'createLuckyMoney',
      args: [BigInt(count), parseEther(amount)],
      value: parseEther(amount),
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Gift className="text-pink-500" />
          Create Red Packet
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Total Amount (ETH)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
              placeholder="0.0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Number of Packets</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
              placeholder="10"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={isPending || isConfirming}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="animate-spin" />
                Processing...
              </>
            ) : (
              'Create Red Packet'
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="text-sm text-gray-400">Remaining Balance</div>
          <div className="text-2xl font-bold text-white mt-1">
            {contractBalance ? formatEther(contractBalance) : '0'} ETH
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="text-sm text-gray-400">Remaining Packets</div>
          <div className="text-2xl font-bold text-white mt-1">
            {remainingCount?.toString() || '0'}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Recent Grabs</h3>
        <div className="space-y-3">
          {(history as any)?.luckyMoneyDistributeds?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-300">
                {item.to.slice(0, 6)}...{item.to.slice(-4)}
              </div>
              <div className="font-mono text-pink-400">
                +{formatEther(item.amount)} ETH
              </div>
            </div>
          ))}
          {!(history as any)?.luckyMoneyDistributeds?.length && (
            <div className="text-center text-gray-500 py-4">No records yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
