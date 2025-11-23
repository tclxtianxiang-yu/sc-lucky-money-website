'use client'

import { X, Sparkles } from 'lucide-react'

interface GrabbedModalProps {
  amount: string
  onClose: () => void
}

export function GrabbedModal({ amount, onClose }: GrabbedModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full mx-4 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">恭喜！</h2>
          <p className="text-gray-400 mb-6">您抢到了</p>

          <div className="bg-black/30 rounded-2xl p-6 mb-8">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              {amount} ETH
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  )
}
