import { http, createConfig } from 'wagmi'
import { hardhat, mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const sepoliaRpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
const hardhatRpc = process.env.NEXT_PUBLIC_HARDHAT_RPC_URL ?? 'http://127.0.0.1:8545'

export const config = createConfig({
    chains: [hardhat, mainnet, sepolia],
    connectors: [injected()],
    transports: {
        [hardhat.id]: http(hardhatRpc),
        [mainnet.id]: http(),
        [sepolia.id]: http(sepoliaRpc),
    },
})
